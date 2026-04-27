#!/usr/bin/env python3
"""
Minimal MVP for Customer Support Ticket Triage automation.
This prototype classifies incoming tickets and suggests routing priorities.
Intended as the first automation prototype per the JAMA-6 guidance.
Now updated to use a real SQLite database for persistence.
"""
from dataclasses import dataclass
from typing import List, Dict, Any
import os
import json
import sqlite3
from datetime import datetime

@dataclass
class Ticket:
    id: str
    subject: str
    body: str

def get_db_connection():
    # Use the database in the data folder
    db_path = os.path.join(os.getcwd(), 'data', 'salon.db')
    # Ensure directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_triage_table():
    conn = get_db_connection()
    conn.execute("""CREATE TABLE IF NOT EXISTS triage_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT,
        subject TEXT,
        category TEXT,
        priority TEXT,
        route TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )""")
    conn.commit()
    conn.close()


def classify(ticket: Ticket) -> Dict[str, Any]:
    text = f"{ticket.subject} {ticket.body}".lower()
    subject_lower = ticket.subject.lower()
    
    # Simple rule-based classifier (MVP)
    priority = "normal"
    category = "general"
    
    # Check for urgency keywords first
    urgency_keywords = ["urgent", "asap", "as soon as possible", "critical", "emergency", "blocking"]
    if any(k in text for k in urgency_keywords):
        priority = "high"
    
    # Define keyword sets
    auth_keywords = ["login", "password", "authentication", "signin", "sign in", "2fa", "mfa", "otp", 
                    "verification", "credentials", "access denied", "locked out", "two-factor", "2-factor"]
    bug_keywords = ["bug", "crash", "freeze", "error", "broken", "not working", "hanging", 
                   "slow", "performance", "glitch", "defect"]
    feature_keywords = ["feature", "request", "suggestion", "improvement", "enhancement", 
                       "would be nice", "please add", "could you add"]
    
    # Check for explicit category indicators in subject
    subject_lower_no_punct = subject_lower.replace(":", " ").replace(",", " ").replace(".", " ")
    subject_words = subject_lower_no_punct.split()
    
    # Rule 1: Check for explicit bug indicators
    has_explicit_bug = any(word in ["bug", "crash", "freeze", "broken", "issue"] for word in subject_words)
    
    has_auth = any(k in text for k in auth_keywords)
    has_bug = any(k in text for k in bug_keywords)
    has_feature = any(k in text for k in feature_keywords)
    
    if has_explicit_bug:
        category = "bug"
        if priority != "high":
            priority = "medium"
    elif has_auth:
        category = "auth"
        if priority != "high":
            priority = "medium"
    elif has_bug:
        category = "bug"
        if priority != "high":
            priority = "medium"
    elif has_feature:
        category = "feature"
        if priority != "high":
            priority = "low"
    
    route = "tier1" if priority in ["high", "urgent"] else "tier2"
    return {
        "ticket_id": ticket.id,
        "category": category,
        "priority": priority,
        "route": route,
        "subject": ticket.subject,
    }

def push_to_db(results: List[Dict[str, Any]]):
    init_triage_table()
    conn = get_db_connection()
    for res in results:
        conn.execute(
            "INSERT INTO triage_results (ticket_id, subject, category, priority, route) VALUES (?, ?, ?, ?, ?)",
            (res['ticket_id'], res['subject'], res['category'], res['priority'], res['route'])
        )
    conn.commit()
    conn.close()

def triage_tickets(tickets: List[Ticket]) -> List[Dict[str, Any]]:
    results = [classify(t) for t in tickets]
    push_to_db(results)
    return results

def main():
    import json, sys
    if len(sys.argv) < 2:
        print("Usage: ticket_triage_mvp.py <tickets.json>")
        sys.exit(2)
    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    tickets = [Ticket(**t) for t in data]
    results = triage_tickets(tickets)
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()

