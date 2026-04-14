#!/usr/bin/env python3
"""
Simple API endpoint for the Customer Support Ticket Triage MVP.
"""
from flask import Flask, request, jsonify
from ticket_triage_mvp import Ticket, triage_tickets, push_to_langgraph
import json
import os

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy", 
        "service": "ticket-triage-mvp",
        "version": "1.0.0"
    })

@app.route('/triage', methods=['POST'])
def triage():
    """
    Triage a single ticket or batch of tickets.
    
    Request body should be JSON with either:
    - Single ticket: {"id": "T1", "subject": "...", "body": "..."}
    - Batch: [{"id": "T1", ...}, {"id": "T2", ...}]
    
    Optional query parameters:
    - project_id: Project ID for LangGraph storage (default: "default")
    - langgraph_enabled: Set to "0" to disable LangGraph persistence (default: "1")
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Handle single ticket or batch
        if isinstance(data, dict):
            tickets = [Ticket(**data)]
        elif isinstance(data, list):
            tickets = [Ticket(**ticket) for ticket in data]
        else:
            return jsonify({"error": "Invalid data format. Expected object or array"}), 400
        
        # Process tickets
        results = triage_tickets(tickets)
        
        # Persist to LangGraph if enabled
        langgraph_path = None
        langgraph_enabled = request.args.get('langgraph_enabled', '1') == '1'
        if langgraph_enabled:
            project_id = request.args.get('project_id', 'default')
            langgraph_path = push_to_langgraph(results, project_id)
        
        response = {
            "success": True,
            "count": len(results),
            "results": results
        }
        
        if langgraph_path:
            response["langgraph_path"] = langgraph_path
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/demo', methods=['GET'])
def demo():
    """Demo endpoint with sample tickets."""
    sample_tickets = [
        {"id": "DEMO1", "subject": "URGENT: Can't access my account", "body": "Login keeps failing"},
        {"id": "DEMO2", "subject": "Bug report: App freezes", "body": "Application freezes when opening large files"},
        {"id": "DEMO3", "subject": "Feature suggestion", "body": "Please add keyboard shortcuts"},
        {"id": "DEMO4", "subject": "Billing question", "body": "When is my next payment due?"}
    ]
    
    tickets = [Ticket(**ticket) for ticket in sample_tickets]
    results = triage_tickets(tickets)
    
    # Persist demo results to LangGraph
    langgraph_path = None
    if os.environ.get('LANGGRAPH_ENABLED', '1') == '1':
        langgraph_path = push_to_langgraph(results, 'demo')
    
    response = {
        "description": "Ticket Triage MVP Demo",
        "sample_tickets": sample_tickets,
        "triage_results": results,
        "classification_rules": {
            "auth": ["login", "password", "authentication", "signin"],
            "bug": ["bug", "crash", "freeze", "error", "broken", "not working"],
            "feature": ["feature", "request"],
            "priority_escalation": ["urgent", "asap", "as soon as possible"]
        },
        "api_endpoints": {
            "health": "GET /health",
            "triage": "POST /triage",
            "demo": "GET /demo",
            "stats": "GET /stats"
        }
    }
    
    if langgraph_path:
        response["langgraph_path"] = langgraph_path
    
    return jsonify(response)

@app.route('/stats', methods=['GET'])
def stats():
    """Get statistics about the triage service."""
    return jsonify({
        "service": "ticket-triage-mvp",
        "version": "1.0.0",
        "langgraph_enabled": os.environ.get('LANGGRAPH_ENABLED', '1') == '1',
        "langgraph_store": os.environ.get('LANGGRAPH_STORE', os.path.join(os.getcwd(), 'storage', 'langgraph')),
        "status": "operational"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)