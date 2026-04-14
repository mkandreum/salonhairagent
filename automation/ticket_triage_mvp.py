#!/usr/bin/env python3
"""
Minimal MVP for Customer Support Ticket Triage automation.
This prototype classifies incoming tickets and suggests routing priorities.
Intended as the first automation prototype per the JAMA-6 guidance.
"""
from dataclasses import dataclass
from typing import List, Dict, Any
import os
import json

@dataclass
class Ticket:
    id: str
    subject: str
    body: str

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
    # "issue" is included but we check context to avoid false positives
    has_explicit_bug = any(word in ["bug", "crash", "freeze", "broken", "issue"] for word in subject_words)
    # But if it's just "issue" without other bug context, be careful
    if "issue" in subject_words and not any(word in ["bug", "crash", "freeze", "broken"] for word in subject_words):
        # Check if "issue" appears in a technical context
        technical_context = any(phrase in subject_lower for phrase in [
            "issue:", "issue with", "issue in", "technical issue", "software issue"
        ])
        if not technical_context:
            has_explicit_bug = False
    
    # Rule 2: Check for auth vs bug based on keyword strength and context
    has_auth = any(k in text for k in auth_keywords)
    has_bug = any(k in text for k in bug_keywords)
    has_feature = any(k in text for k in feature_keywords)
    
    # Determine category with improved precedence
    if has_explicit_bug:
        # Explicit bug mention takes highest precedence
        category = "bug"
        if priority != "high":
            priority = "medium"
    elif has_auth and has_bug:
        # Both auth and bug keywords present - use context analysis
        # Check if it's clearly an auth issue
        auth_phrases = ["can't login", "cannot login", "login failed", "login issue", 
                       "password reset", "authentication problem", "2fa not working",
                       "two-factor authentication", "2-factor authentication"]
        bug_phrases = ["bug with", "crash when", "error during", "broken feature",
                      "app crashes", "system crash", "software bug"]
        
        auth_context = any(phrase in text for phrase in auth_phrases)
        bug_context = any(phrase in text for phrase in bug_phrases)
        
        if bug_context and not auth_context:
            category = "bug"
        else:
            # Default to auth for ambiguous cases with auth keywords
            category = "auth"
        
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
    # else: general (default)
    
    # Routing hint
    route = "tier1" if priority in ["high", "urgent"] else "tier2"
    return {
        "ticket_id": ticket.id,
        "category": category,
        "priority": priority,
        "route": route,
        "subject": ticket.subject,
    }

def push_to_langgraph(results: List[Dict[str, Any]], project_id: str = "JAMA-6") -> str:
    # Simple filesystem-based LangGraph mock to persist triage results per project
    base = os.environ.get("LANGGRAPH_STORE", os.path.join(os.getcwd(), "storage", "langgraph"))
    dirpath = os.path.join(base, project_id)
    os.makedirs(dirpath, exist_ok=True)
    patch_path = os.path.join(dirpath, "triage_results.json")
    with open(patch_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    return patch_path

def triage_tickets(tickets: List[Ticket]) -> List[Dict[str, Any]]:
    return [classify(t) for t in tickets]

def main():
    # Simple CLI demo: python3 automation/ticket_triage_mvp.py <tickets.json
    import json, sys
    if len(sys.argv) < 2:
        print("Usage: ticket_triage_mvp.py <tickets.json>")
        sys.exit(2)
    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    tickets = [Ticket(**t) for t in data]
    results = triage_tickets(tickets)
    # Persist results to LangGraph mock store if enabled
    langgraph_path = None
    if os.environ.get("LANGGRAPH_ENABLED", "1") == "1":
        langgraph_path = push_to_langgraph(results)
    print(json.dumps(results, indent=2))
    if langgraph_path:
        print(f"LangGraph updated: {langgraph_path}")

if __name__ == "__main__":
    main()
