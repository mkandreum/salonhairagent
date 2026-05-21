#!/usr/bin/env python3
"""
Flask API for Customer Support Ticket Triage MVP.
Provides REST endpoints for ticket classification and triage.
"""
from flask import Flask, request, jsonify
import json
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ticket_triage_mvp import Ticket, classify, triage_tickets
from langgraph_adapter import write_to_store

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "ticket-triage-mvp",
        "version": "1.0.0"
    })

@app.route('/classify', methods=['POST'])
def classify_ticket():
    """
    Classify a single ticket.
    
    Request body:
    {
        "ticket_id": "T123",
        "subject": "URGENT: Can't login",
        "body": "Cannot access my account"
    }
    
    Returns:
    {
        "ticket_id": "T123",
        "category": "auth",
        "priority": "high",
        "route": "tier1",
        "confidence": 0.95
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['ticket_id', 'subject', 'body']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}"
                }), 400
        
        # Create ticket object
        ticket = Ticket(
            id=data['ticket_id'],
            subject=data['subject'],
            body=data['body']
        )
        
        # Classify ticket
        result = classify(ticket)
        
        # Add confidence score (simulated for now)
        result['confidence'] = 0.95
        
        # Store result in LangGraph (mock)
        store_path = write_to_store(
            project_id="ticket-triage-mvp",
            data={
                "ticket": data,
                "classification": result,
                "timestamp": "2024-01-01T00:00:00Z"  # Would use actual timestamp
            }
        )
        
        result['store_path'] = store_path
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "error": f"Classification failed: {str(e)}"
        }), 500

@app.route('/triage/batch', methods=['POST'])
def triage_batch():
    """
    Triage multiple tickets in batch.
    
    Request body:
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
            }
        ]
    }
    
    Returns:
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
            }
        ],
        "summary": {
            "total_tickets": 2,
            "by_category": {"auth": 1, "feature": 1},
            "by_priority": {"high": 1, "low": 1}
        }
    }
    """
    try:
        data = request.get_json()
        
        if 'tickets' not in data:
            return jsonify({
                "error": "Missing required field: tickets"
            }), 400
        
        tickets_data = data['tickets']
        
        # Convert to Ticket objects
        tickets = []
        for ticket_data in tickets_data:
            if 'ticket_id' not in ticket_data or 'subject' not in ticket_data or 'body' not in ticket_data:
                return jsonify({
                    "error": "Each ticket must have ticket_id, subject, and body fields"
                }), 400
            
            tickets.append(Ticket(
                id=ticket_data['ticket_id'],
                subject=ticket_data['subject'],
                body=ticket_data['body']
            ))
        
        # Triage tickets
        results = triage_tickets(tickets)
        
        # Add confidence scores and store results
        summary = {
            "total_tickets": len(results),
            "by_category": {},
            "by_priority": {}
        }
        
        for result in results:
            result['confidence'] = 0.95  # Simulated confidence
            
            # Update summary counts
            category = result['category']
            priority = result['priority']
            
            summary['by_category'][category] = summary['by_category'].get(category, 0) + 1
            summary['by_priority'][priority] = summary['by_priority'].get(priority, 0) + 1
        
        # Store batch results in LangGraph
        store_path = write_to_store(
            project_id="ticket-triage-batch",
            data={
                "batch": data,
                "results": results,
                "summary": summary,
                "timestamp": "2024-01-01T00:00:00Z"
            }
        )
        
        return jsonify({
            "results": results,
            "summary": summary,
            "store_path": store_path
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Batch triage failed: {str(e)}"
        }), 500

@app.route('/metrics', methods=['GET'])
def get_metrics():
    """
    Get service metrics.
    
    Returns:
    {
        "total_classifications": 150,
        "accuracy_rate": 0.92,
        "average_response_time_ms": 45,
        "categories_processed": ["auth", "bug", "feature", "general"]
    }
    """
    # Simulated metrics - in production would query database
    return jsonify({
        "total_classifications": 150,
        "accuracy_rate": 0.92,
        "average_response_time_ms": 45,
        "categories_processed": ["auth", "bug", "feature", "general"],
        "uptime_hours": 24.5
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)