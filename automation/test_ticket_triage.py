#!/usr/bin/env python3
"""
Unit tests for the Customer Support Ticket Triage MVP.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ticket_triage_mvp import Ticket, classify, triage_tickets

def test_ticket_classification():
    """Test basic ticket classification logic."""
    # Test urgent auth ticket
    ticket1 = Ticket(id="TEST1", subject="URGENT: Can't login", body="Cannot access my account")
    result1 = classify(ticket1)
    assert result1["category"] == "auth"
    assert result1["priority"] == "high"
    assert result1["route"] == "tier1"
    
    # Test bug report
    ticket2 = Ticket(id="TEST2", subject="App crashes", body="Application crashes when saving")
    result2 = classify(ticket2)
    assert result2["category"] == "bug"
    assert result2["priority"] == "medium"
    assert result2["route"] == "tier2"
    
    # Test feature request
    ticket3 = Ticket(id="TEST3", subject="Feature request", body="Please add export functionality")
    result3 = classify(ticket3)
    assert result3["category"] == "feature"
    assert result3["priority"] == "low"
    assert result3["route"] == "tier2"
    
    # Test general inquiry
    ticket4 = Ticket(id="TEST4", subject="Question about billing", body="When will I be charged?")
    result4 = classify(ticket4)
    assert result4["category"] == "general"
    assert result4["priority"] == "normal"
    assert result4["route"] == "tier2"
    
    # Test auth precedence over bug when both keywords present
    ticket5 = Ticket(id="TEST5", subject="Login not working", body="Cannot login to my account")
    result5 = classify(ticket5)
    assert result5["category"] == "auth"  # Should be auth, not bug
    assert result5["priority"] == "medium"
    
    print("✓ All classification tests passed")

def test_triage_multiple_tickets():
    """Test triage function with multiple tickets."""
    tickets = [
        Ticket(id="M1", subject="Login issue", body="Can't sign in"),
        Ticket(id="M2", subject="App freezes", body="Application freezes"),
        Ticket(id="M3", subject="Feature", body="Add dark mode please"),
    ]
    
    results = triage_tickets(tickets)
    assert len(results) == 3
    assert all("ticket_id" in r for r in results)
    assert all("category" in r for r in results)
    assert all("priority" in r for r in results)
    assert all("route" in r for r in results)
    
    print("✓ Multiple ticket triage test passed")

def test_edge_cases():
    """Test edge cases in classification."""
    # Empty ticket
    ticket = Ticket(id="E1", subject="", body="")
    result = classify(ticket)
    assert result["category"] == "general"
    assert result["priority"] == "normal"
    
    # Mixed keywords
    ticket = Ticket(id="E2", subject="URGENT BUG", body="Critical bug needs fixing ASAP")
    result = classify(ticket)
    assert result["category"] == "bug"
    assert result["priority"] == "high"
    
    print("✓ Edge case tests passed")

if __name__ == "__main__":
    print("Running Ticket Triage MVP tests...")
    test_ticket_classification()
    test_triage_multiple_tickets()
    test_edge_cases()
    print("\n✅ All tests passed successfully!")