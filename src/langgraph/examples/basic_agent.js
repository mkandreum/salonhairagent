import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";

// Define a simple tool
const searchTool = tool(async ({ query }) => {
  // In a real implementation, this would call a search API
  return `Search results for: ${query}`;
}, {
  name: "search",
  description: "Search for information on a given topic"
});

// Create the tool node
const toolNode = new ToolNode([searchTool]);

// Initialize the LLM
const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0
});

// Define the agent function
const agentNode = async (state) => {
  const response = await model.bindTools([searchTool]).invoke(state.messages);
  return { messages: [response] };
};

// Define the conditional edge function
const shouldContinue = (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return END;
};

// Create the graph
const workflow = new StateGraph({ messages: Array })
  .addNode("agent", agentNode)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

// Compile the graph
const app = workflow.compile();

// Example usage
async function runExample() {
  const input = {
    messages: [{
      role: "user",
      content: "What is the latest news about AI agent frameworks?"
    }]
  };

  console.log("Running LangGraph agent example...");
  const result = await app.invoke(input);
  console.log("Final response:", result.messages[result.messages.length - 1].content);
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample().catch(console.error);
}

export { app };