# Contributing Guidelines

Thank you for your interest in contributing to our process automation AI agent system! Please follow these guidelines to help maintain code quality and consistency.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/process-automation-ai-agents.git`
3. Install dependencies: `npm install`
4. Set up environment variables (see `.env.example`)
5. Run tests: `npm test`

## Code Style

- Follow existing code patterns in the repository
- Use meaningful variable and function names
- Write clear, concise comments where necessary
- Keep functions focused on a single responsibility
- Use ES6+ features consistently

## Git Workflow

1. Create a new branch for your feature/fix: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Commit with descriptive messages: `git commit -m "Add feature: description"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

## Testing

- Write unit tests for new functionality
- Ensure all tests pass before submitting PR
- Run tests with: `npm test`
- Run tests in watch mode during development: `npm run test:watch`

## Documentation

- Update README.md if your changes affect usage
- Add JSDoc comments for new functions/classes
- Keep documentation in sync with code changes

## Reporting Issues

- Use the issue tracker to report bugs or suggest features
- Include steps to reproduce for bug reports
- Provide expected vs actual behavior