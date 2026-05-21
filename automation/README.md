# Customer Support Ticket Triage MVP

First automation prototype for process automation company. Classifies incoming support tickets and suggests routing priorities.

## Features

- **Rule-based classification**: Categorizes tickets as auth, bug, feature, or general
- **Priority assignment**: High, medium, low, or normal based on content
- **Routing suggestions**: Tier1 (urgent) vs Tier2 (standard)
- **LangGraph integration**: Mock persistence layer for triage results
- **Docker support**: Containerized deployment

## How to Use

### Local Execution
```bash
# Run with sample tickets (CLI mode)
python3 automation/ticket_triage_mvp.py samples/sample_tickets.json

# Run tests
cd automation && python3 test_ticket_triage.py

# Start API server
cd automation && python3 api.py
# API will be available at http://localhost:5000
```

### Docker Execution
```bash
# Build and run with Docker Compose (API mode by default)
docker-compose up --build
# API will be available at http://localhost:5000

# Or directly with Docker
docker build -t triage-mvp .
docker run -p 5000:5000 -v $(pwd)/samples:/app/samples -v $(pwd)/storage:/app/storage triage-mvp

# To run CLI mode with Docker Compose:
docker-compose run triage-mvp python3 /app/automation/ticket_triage_mvp.py /app/samples/sample_tickets.json
```

## Classification Rules

| Category | Keywords | Default Priority |
|----------|----------|------------------|
| **auth** | login, password, authentication, signin | medium (high if urgent) |
| **bug** | bug, crash, freeze, error, broken, not working | medium (high if urgent) |
| **feature** | feature, request | low |
| **general** | (default) | normal |

**Priority escalation**: Tickets with "urgent", "asap", or "as soon as possible" become high priority.

## Architecture

- `ticket_triage_mvp.py`: Main classification logic
- `langgraph_adapter.py`: Mock LangGraph persistence adapter  
- `test_ticket_triage.py`: Unit tests
- `api.py`: REST API endpoint for real-time triage
- `Dockerfile` / `docker-compose.yml`: Container configuration

## API Endpoints

- `GET /health` - Health check
- `GET /demo` - Demo with sample tickets and classification rules
- `POST /triage` - Triage single ticket or batch
  ```json
  // Single ticket
  {"id": "T1", "subject": "Login issue", "body": "Can't sign in"}
  
  // Batch
  [{"id": "T1", "subject": "...", "body": "..."}, ...]
  ```

## Next Steps

1. **Integrate with actual LangGraph** (currently mocked)
2. **Add machine learning classification** for improved accuracy
3. **Add monitoring and metrics** for performance tracking
4. **Integrate with ticketing systems** (Zendesk, Jira, etc.)
5. **Add authentication and rate limiting** for production use

## Stakeholder Demo

To demonstrate the prototype:
1. Show classification of sample tickets
2. Demonstrate Docker deployment
3. Explain how results persist to LangGraph
4. Discuss roadmap for production deployment