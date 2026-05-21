# Technical Assessment: Founding Senior Software Engineer

## Purpose
This assessment evaluates practical problem-solving skills, AI integration thinking, and code quality for the Founding Senior Software Engineer role. The exercise should take 3-4 hours and focuses on real-world scenarios relevant to our AI automation platform.

## Assessment Overview
**Time:** 3-4 hours maximum  
**Format:** Take-home coding exercise  
**Language:** TypeScript/JavaScript (preferred) or Python  
**Submission:** GitHub repository or code file with README

## Problem Statement: AI Agent Task Orchestration

### Context
You're building a simple task orchestration system for AI agents. Agents need to execute tasks in a specific order, with some tasks depending on others. Your system should:
1. Parse a list of tasks with dependencies
2. Determine valid execution order
3. Simulate task execution
4. Handle basic error scenarios

### Requirements

#### Part 1: Task Dependency Resolution (60 minutes)
Create a function that takes an array of tasks and returns a valid execution order.

**Input:**
```typescript
interface Task {
  id: string;
  name: string;
  dependencies: string[]; // Array of task IDs that must complete before this task
  estimatedDuration: number; // in minutes
}

// Example input
const tasks: Task[] = [
  { id: 'A', name: 'Data Collection', dependencies: [], estimatedDuration: 30 },
  { id: 'B', name: 'Data Processing', dependencies: ['A'], estimatedDuration: 45 },
  { id: 'C', name: 'LLM Analysis', dependencies: ['B'], estimatedDuration: 60 },
  { id: 'D', name: 'Report Generation', dependencies: ['C'], estimatedDuration: 20 },
  { id: 'E', name: 'Quality Check', dependencies: ['B'], estimatedDuration: 15 },
  { id: 'F', name: 'Final Review', dependencies: ['D', 'E'], estimatedDuration: 10 }
];
```

**Expected Output:**
- Array of task IDs in valid execution order (topological sort)
- Handle circular dependencies (return error)
- Calculate total estimated duration

#### Part 2: AI Agent Integration Simulation (90 minutes)
Extend the system to simulate AI agent execution with:
1. **Agent Pool**: Multiple agents that can work in parallel
2. **Task Assignment**: Assign tasks to available agents based on dependencies
3. **Execution Simulation**: Simulate time passing as agents complete tasks
4. **Basic Error Handling**: Some tasks may fail with certain probability

**Requirements:**
- Create `Agent` class with `id`, `name`, and `availability` status
- Implement task assignment logic that respects dependencies
- Simulate execution with time tracking
- Handle task failures (retry logic or mark as failed)
- Calculate total completion time with parallel execution

#### Part 3: API Design (60 minutes)
Design a REST API for this system:
1. **Endpoints**:
   - `POST /tasks` - Add new tasks
   - `GET /tasks/execution-order` - Get valid execution order
   - `POST /tasks/execute` - Start execution with N agents
   - `GET /tasks/status` - Get current execution status
2. **Request/Response schemas** in TypeScript interfaces
3. **Error handling** approach
4. **Basic authentication** considerations

### Evaluation Criteria

#### Code Quality (40%)
- Clean, readable, well-structured code
- Proper TypeScript/JavaScript conventions
- Meaningful variable and function names
- Appropriate comments and documentation
- Error handling and edge cases

#### Problem Solving (30%)
- Correct dependency resolution algorithm
- Efficient task assignment logic
- Appropriate data structures and algorithms
- Handling of edge cases (circular dependencies, failures)

#### AI/ML Thinking (20%)
- Consideration of AI agent characteristics
- Design for extensibility (different agent types, capabilities)
- Error scenarios relevant to AI systems
- Scalability considerations

#### Communication (10%)
- Clear README with setup instructions
- Explanation of design decisions
- API documentation
- Any assumptions made

### Submission Instructions
1. Create a GitHub repository or zip file with your solution
2. Include:
   - Source code with Part 1, 2, and 3
   - README.md with:
     - Setup and run instructions
     - Design decisions and trade-offs
     - Time spent on each part
     - Any limitations or future improvements
   - Example usage/test cases
3. Email link to CEO with subject: "Technical Assessment - [Your Name]"

### What We're Looking For
- **Practical problem-solving** over theoretical perfection
- **Clean, maintainable code** that others can understand
- **AI system thinking** - how would this extend to real AI agents?
- **Communication skills** through documentation
- **Time management** - complete within 4 hours

### Notes for CEO Evaluation
1. **Focus on approach, not just correctness** - How do they think about the problem?
2. **Code organization** - Can you understand and extend their code?
3. **AI relevance** - Do they consider AI-specific challenges?
4. **Communication clarity** - Is their documentation helpful?
5. **Time management** - Did they complete within reasonable time?

### Sample Solution Approach (For CEO Reference)
1. **Part 1**: Use topological sort (Kahn's algorithm or DFS)
2. **Part 2**: Implement agent pool with task queue, simulate with setTimeout or similar
3. **Part 3**: Design RESTful API with clear separation of concerns
4. **Error Handling**: Consider network failures, agent crashes, dependency violations

### Red Flags
- No error handling
- Poor code organization
- Missing documentation
- Over-engineered solution
- Doesn't complete within time limit
- No consideration of AI/ML context

### Green Flags
- Clean, readable code
- Good test coverage
- Clear documentation
- Practical, working solution
- AI/ML thinking evident
- Good time management

---
**Prepared by:** Ayudante de CTO  
**For CEO Use:** Technical screening assessment  
**Difficulty Level:** Medium (appropriate for senior engineer)  
**Estimated Time:** 3-4 hours  
**Last Updated:** April 9, 2026