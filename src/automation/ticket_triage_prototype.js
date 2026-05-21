import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

// Define ticket triage tool
const triageTicketTool = tool(async ({ ticketContent, customerHistory }) => {
  // In a real implementation, this would use NLP/ML to analyze the ticket
  // For prototype, we'll implement basic keyword-based classification
  
  const contentLower = ticketContent.toLowerCase();
  
  // Simple keyword-based categorization
  let category = "general";
  let priority = "medium";
  
  // Check for urgent keywords
  const urgentKeywords = ["urgent", "emergency", "critical", "down", "broken", "not working"];
  if (urgentKeywords.some(keyword => contentLower.includes(keyword))) {
    priority = "high";
  }
  
  // Check for billing keywords
  const billingKeywords = ["invoice", "payment", "charge", "billing", "refund", "price"];
  if (billingKeywords.some(keyword => contentLower.includes(keyword))) {
    category = "billing";
  }
  // Check for technical keywords
  else if (contentLower.includes("error") || contentLower.includes("bug") || 
           contentLower.includes("crash") || contentLower.includes("feature")) {
    category = "technical";
  }
  // Check for account keywords
  else if (contentLower.includes("login") || contentLower.includes("password") || 
           contentLower.includes("account") || contentLower.includes("access")) {
    category = "account";
  }
  
  // Adjust priority based on customer history (if available)
  if (customerHistory && customerHistory.priorityTickets > 2) {
    priority = "high";
  }
  
  return {
    category,
    priority,
    suggestedAssignment: getSuggestedAssignment(category),
    confidenceScore: 0.85 // Placeholder for ML model confidence
  };
}, {
  name: "triage_ticket",
  description: "Analyze and categorize customer support tickets for routing",
  schema: z.object({
    ticketContent: z.string().describe("The content of the support ticket"),
    customerHistory: z.optional(z.object({
      priorityTickets: z.number().describe("Number of high priority tickets from this customer")
    })).describe("Optional customer history information")
  })
});

// Define notification tool
const notifyTeamTool = tool(async ({ category, priority, ticketId }) => {
  // In a real implementation, this would send notifications to appropriate teams
  console.log(`Notification: ${priority} priority ${category} ticket ${ticketId} requires attention`);
  return `Notification sent to ${getTeamForCategory(category)} team for ${priority} priority ticket ${ticketId}`;
}, {
  name: "notify_team",
  description: "Notify appropriate team about triaged ticket",
  schema: z.object({
    category: z.string().describe("Ticket category"),
    priority: z.string().describe("Ticket priority"),
    ticketId: z.string().describe("Ticket identifier")
  })
});

// Helper function to get suggested assignment
function getSuggestedAssignment(category) {
  const assignments = {
    billing: "Billing Team",
    technical: "Engineering Team",
    account: "Account Management Team",
    general: "General Support Team"
  };
  return assignments[category] || "General Support Team";
}

// Helper function to get team for category
function getTeamForCategory(category) {
  const teams = {
    billing: "Billing",
    technical: "Engineering",
    account: "Account Management",
    general: "General Support"
  };
  return teams[category] || "General Support";
}

// Create the tool nodes
const triageToolNode = new ToolNode([triageTicketTool]);
const notifyToolNode = new ToolNode([notifyTeamTool]);

// Initialize the LLM
const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0.1 // Low temperature for consistent classification
});

// Define the agent state interface
interface TicketState {
  messages: any[];
  ticketContent?: string;
  customerHistory?: any;
  triageResult?: any;
  notificationSent?: boolean;
}

// Define the agent function
const agentNode = async (state: TicketState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  
  // If we have ticket content to process, triage it
  if (state.ticketContent && !state.triageResult) {
    // Call the triage tool
    const triageResult = await triageTicketTool._call({
      ticketContent: state.ticketContent,
      customerHistory: state.customerHistory
    });
    
    return {
      ...state,
      triageResult: triageResult,
      messages: [...state.messages, { role: "assistant", content: `Ticket triaged: ${JSON.stringify(triageResult)}` }]
    };
  }
  // If we have triage result but haven't sent notification, send it
  else if (state.triageResult && !state.notificationSent) {
    // Call the notification tool
    const notificationResult = await notifyTeamTool._call({
      category: state.triageResult.category,
      priority: state.triageResult.priority,
      ticketId: `TICKET-${Date.now()}` // Simple ticket ID generation
    });
    
    return {
      ...state,
      notificationSent: true,
      messages: [...state.messages, { role: "assistant", content: notificationResult }]
    };
  }
  // Otherwise, just respond based on input
  else {
    const response = await model.invoke(state.messages);
    return { ...state, messages: [...state.messages, response] };
  }
};

// Define the conditional edge function
const shouldContinue = (state: TicketState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  
  // If we have tool calls in the last message, route to tools
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  
  // If we've completed both triage and notification, end
  if (state.triageResult && state.notificationSent) {
    return END;
  }
  
  // Otherwise, continue with agent
  return "agent";
};

// Create the graph
const workflow = new StateGraph<TicketState>({
  messages: Array,
  ticketContent: z.string().optional(),
  customerHistory: z.any().optional(),
  triageResult: z.any().optional(),
  notificationSent: z.boolean()
})
  .addNode("agent", agentNode)
  .addNode("triage_tool", triageToolNode)
  .addNode("notify_tool", notifyToolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue, {
    "tools": "triage_tool", // This needs refinement - we'll simplify
    "agent": "agent",
    [END]: END
  })
  // Simplify: agent -> tools -> agent loop
  .addEdge("agent", "triage_tool")
  .addEdge("triage_tool", "agent")
  .addEdge("agent", "notify_tool") 
  .addEdge("notify_tool", "agent");

// Compile the graph
const app = workflow.compile();

// Example usage function
async function runTicketTriageExample() {
  console.log("Running Ticket Triage Automation Prototype...");
  
  // Example ticket content
  const ticketContent = "I've been charged twice for my subscription this month and I need a refund for the duplicate charge. This is urgent as it's affecting my budget.";
  
  // Example customer history
  const customerHistory = {
    priorityTickets: 3 // This customer has had multiple high priority tickets
  };
  
  const input = {
    messages: [{
      role: "user",
      content: `Please triage this support ticket: "${ticketContent}"`
    }],
    ticketContent: ticketContent,
    customerHistory: customerHistory
  };
  
  try {
    const result = await app.invoke(input);
    console.log("\n=== TRIAGE RESULT ===");
    console.log(`Category: ${result.triageResult?.category}`);
    console.log(`Priority: ${result.triageResult?.priority}`);
    console.log(`Suggested Assignment: ${result.triageResult?.suggestedAssignment}`);
    console.log(`Confidence Score: ${result.triageResult?.confidenceScore}`);
    console.log(`Notification Sent: ${result.notificationSent}`);
    console.log("\n=== CONVERSATION ===");
    result.messages.forEach((msg: any, index: number) => {
      if (msg.role) {
        console.log(`${index + 1}. ${msg.role}: ${msg.content}`);
      }
    });
  } catch (error) {
    console.error("Error running ticket triage example:", error);
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTicketTriageExample().catch(console.error);
}

export { app };