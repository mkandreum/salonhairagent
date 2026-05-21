# Ticket Triage API Documentation

## Overview

The Ticket Triage API provides AI-powered classification and routing for customer support tickets. It uses rule-based classification with LangGraph integration for state management.

## Base URL

```
http://localhost:5000
```

## Authentication

Currently, the API runs without authentication for prototype purposes. In production, add API key authentication.

## Endpoints

### Health Check

**GET /health**

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "ticket-triage-mvp",
  "version": "1.0.0"
}
```

### Classify Single Ticket

**POST /classify**

Classify a single support ticket.

**Request Body:**
```json
{
  "ticket_id": "T123",
  "subject": "URGENT: Can't login to account",
  "body": "I cannot access my account despite multiple attempts. This is urgent."
}
```

**Response:**
```json
{
  "ticket_id": "T123",
  "category": "auth",
  "priority": "high",
  "route": "tier1",
  "confidence": 0.95,
  "store_path": "langgraph://triage-ticket-triage-mvp/nodes/123e4567-e89b-12d3-a456-426614174000"
}
```

**Categories:**
- `auth`: Authentication/login issues
- `bug`: Software bugs and crashes
- `feature`: Feature requests
- `general`: General inquiries

**Priorities:**
- `high`: Urgent issues requiring immediate attention
- `medium`: Important issues
- `low`: Non-urgent issues
- `normal`: Standard priority

**Routes:**
- `tier1`: Urgent support team
- `tier2`: Standard support team

### Batch Triage

**POST /triage/batch**

Classify multiple tickets in a single request.

**Request Body:**
```json
{
  "tickets": [
    {
      "ticket_id": "T123",
      "subject": "URGENT: Can't login",
      "body": "Cannot access my account"
    },
    {
      "ticket_id": "T124",
      "subject": "Feature request",
      "body": "Please add export functionality"
    },
    {
      "ticket_id": "T125",
      "subject": "App crashes on save",
      "body": "Application crashes when saving files"
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "ticket_id": "T123",
      "category": "auth",
      "priority": "high",
      "route": "tier1",
      "confidence": 0.95
    },
    {
      "ticket_id": "T124",
      "category": "feature",
      "priority": "low",
      "route": "tier2",
      "confidence": 0.90
    },
    {
      "ticket_id": "T125",
      "category": "bug",
      "priority": "medium",
      "route": "tier2",
      "confidence": 0.92
    }
  ],
  "summary": {
    "total_tickets": 3,
    "by_category": {
      "auth": 1,
      "feature": 1,
      "bug": 1
    },
    "by_priority": {
      "high": 1,
      "low": 1,
      "medium": 1
    }
  },
  "store_path": "langgraph://triage-ticket-triage-batch/nodes/123e4567-e89b-12d3-a456-426614174001"
}
```

### Metrics

**GET /metrics**

Get service performance metrics.

**Response:**
```json
{
  "total_classifications": 150,
  "accuracy_rate": 0.92,
  "average_response_time_ms": 45,
  "categories_processed": ["auth", "bug", "feature", "general"],
  "uptime_hours": 24.5
}
```

## Classification Rules

### Category Detection

| Category | Keywords | Description |
|----------|----------|-------------|
| **auth** | `login`, `password`, `authentication`, `signin`, `account`, `access` | Authentication and access issues |
| **bug** | `bug`, `crash`, `freeze`, `error`, `broken`, `not working`, `fails`, `issue` | Software defects and failures |
| **feature** | `feature`, `request`, `suggestion`, `improvement`, `enhancement` | New feature requests |
| **general** | (default) | All other inquiries |

### Priority Escalation

Tickets are automatically escalated to **high** priority if they contain:
- `urgent`
- `asap` 
- `as soon as possible`
- `critical`
- `emergency`

### Routing Logic

- **tier1**: High priority tickets (urgent issues)
- **tier2**: Medium, low, and normal priority tickets

## LangGraph Integration

The API integrates with LangGraph for state management:

1. **Graph Creation**: Each classification creates/updates a LangGraph
2. **Node Storage**: Classification results are stored as graph nodes
3. **State Tracking**: Graph state tracks processing status
4. **Persistence**: Results are persisted to disk (simulated)

**Store Path Format:**
```
langgraph://{graph_id}/nodes/{node_id}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "error": "Missing required field: ticket_id"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Classification failed: [error details]"
}
```

## Running the API

### Local Development

```bash
# Install dependencies
pip install -r automation/requirements.txt

# Run the API
cd automation
python app.py
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run directly
docker build -t ticket-triage-api .
docker run -p 5000:5000 ticket-triage-api
```

### Testing

```bash
# Run unit tests
cd automation
python test_ticket_triage.py

# Test API endpoints
curl http://localhost:5000/health
curl -X POST http://localhost:5000/classify \
  -H "Content-Type: application/json" \
  -d '{"ticket_id":"TEST1","subject":"Login issue","body":"Cannot login"}'
```

## Sample Requests

### cURL Examples

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Single Ticket Classification:**
```bash
curl -X POST http://localhost:5000/classify \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "T123",
    "subject": "URGENT: App crashes on startup",
    "body": "Application crashes immediately after launching"
  }'
```

**Batch Classification:**
```bash
curl -X POST http://localhost:5000/triage/batch \
  -H "Content-Type: application/json" \
  -d '{
    "tickets": [
      {
        "ticket_id": "T123",
        "subject": "Login problem",
        "body": "Cannot sign in to account"
      },
      {
        "ticket_id": "T124",
        "subject": "Export feature",
        "body": "Requesting CSV export functionality"
      }
    ]
  }'
```

## Next Steps

1. **Add Authentication**: API key or OAuth2
2. **Database Integration**: Persistent storage for metrics
3. **Machine Learning**: Replace rule-based with ML classification
4. **Webhook Support**: Real-time notifications
5. **Monitoring**: Prometheus metrics and Grafana dashboards
6. **Rate Limiting**: Protect against abuse
7. **Swagger/OpenAPI**: Interactive API documentation