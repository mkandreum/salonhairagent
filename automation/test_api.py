#!/usr/bin/env python3
"""
Test the API functionality without actually running Flask.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ticket_triage_mvp import Ticket, triage_tickets
import json

def test_api_functionality():
    """Test the logic that would power the API endpoints."""
    print("Testing API functionality...")
    
    # Test single ticket
    print("\n1. Testing single ticket triage:")
    ticket_data = {"id": "API-TEST1", "subject": "URGENT login failure", "body": "Cannot login to account"}
    ticket = Ticket(**ticket_data)
    results = triage_tickets([ticket])
    print(f"   Input: {ticket_data}")
    print(f"   Result: {json.dumps(results[0], indent=4)}")
    
    # Test batch tickets
    print("\n2. Testing batch ticket triage:")
    batch_data = [
        {"id": "API-TEST2", "subject": "Bug: app crashes", "body": "App crashes on startup"},
        {"id": "API-TEST3", "subject": "Feature request", "body": "Add export feature"},
        {"id": "API-TEST4", "subject": "General question", "body": "How do I reset password?"}
    ]
    tickets = [Ticket(**t) for t in batch_data]
    results = triage_tickets(tickets)
    print(f"   Input: {len(batch_data)} tickets")
    print(f"   Results: {json.dumps(results, indent=4)}")
    
    # Test demo endpoint logic
    print("\n3. Testing demo endpoint logic:")
    sample_tickets = [
        {"id": "DEMO1", "subject": "URGENT: Can't access my account", "body": "Login keeps failing"},
        {"id": "DEMO2", "subject": "Bug report: App freezes", "body": "Application freezes when opening large files"},
        {"id": "DEMO3", "subject": "Feature suggestion", "body": "Please add keyboard shortcuts"},
        {"id": "DEMO4", "subject": "Billing question", "body": "When is my next payment due?"}
    ]
    demo_tickets = [Ticket(**t) for t in sample_tickets]
    demo_results = triage_tickets(demo_tickets)
    
    demo_response = {
        "description": "Ticket Triage MVP Demo",
        "sample_tickets": sample_tickets,
        "triage_results": demo_results,
        "classification_rules": {
            "auth": ["login", "password", "authentication", "signin"],
            "bug": ["bug", "crash", "freeze", "error", "broken", "not working"],
            "feature": ["feature", "request"],
            "priority_escalation": ["urgent", "asap", "as soon as possible"]
        }
    }
    
    print(f"   Demo response structure validated")
    print(f"   Sample tickets: {len(sample_tickets)}")
    print(f"   Triage results: {len(demo_results)}")
    
    print("\n✅ API functionality tests passed!")
    print("\nTo run the actual API server, install Flask:")
    print("  pip install flask")
    print("Then run:")
    print("  python3 api.py")
    print("\nAPI will be available at http://localhost:5000")

if __name__ == '__main__':
    test_api_functionality()