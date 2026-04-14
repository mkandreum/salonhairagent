#!/usr/bin/env python3
"""
Validation script for Ticket Triage MVP.
Tests classification accuracy against realistic support ticket data.
"""
import json
import random
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from ticket_triage_mvp import Ticket, classify, triage_tickets

@dataclass
class ValidationTicket:
    """Ticket with expected classification for validation."""
    ticket: Ticket
    expected_category: str
    expected_priority: str
    expected_route: str

def generate_validation_dataset(size: int = 100) -> List[ValidationTicket]:
    """Generate realistic validation tickets with expected classifications."""
    validation_tickets = []
    
    # Define realistic ticket templates with expected classifications
    templates = [
        # Auth tickets
        {
            "subject": "URGENT: Cannot login to my account",
            "body": "I've tried multiple times but keep getting authentication errors.",
            "category": "auth",
            "priority": "high",
            "route": "tier1"
        },
        {
            "subject": "Password reset not working",
            "body": "The password reset link doesn't work.",
            "category": "auth",
            "priority": "medium",
            "route": "tier2"
        },
        {
            "subject": "Two-factor authentication issue",
            "body": "Not receiving 2FA codes.",
            "category": "auth",
            "priority": "medium",
            "route": "tier2"
        },
        # Bug tickets
        {
            "subject": "ASAP: App crashes when uploading files",
            "body": "Application crashes immediately when trying to upload any file.",
            "category": "bug",
            "priority": "high",
            "route": "tier1"
        },
        {
            "subject": "Bug: Dashboard not loading",
            "body": "Dashboard shows blank screen after login.",
            "category": "bug",
            "priority": "medium",
            "route": "tier2"
        },
        {
            "subject": "Error message when saving",
            "body": "Getting 'Internal server error' when saving changes.",
            "category": "bug",
            "priority": "medium",
            "route": "tier2"
        },
        # Feature requests
        {
            "subject": "Feature request: Export functionality",
            "body": "Please add export to CSV feature.",
            "category": "feature",
            "priority": "low",
            "route": "tier2"
        },
        {
            "subject": "Request: Mobile app version",
            "body": "Would love to have a mobile app version.",
            "category": "feature",
            "priority": "low",
            "route": "tier2"
        },
        # General inquiries
        {
            "subject": "Question about pricing",
            "body": "What are your pricing plans?",
            "category": "general",
            "priority": "normal",
            "route": "tier2"
        },
        {
            "subject": "How to cancel subscription",
            "body": "Need instructions to cancel my subscription.",
            "category": "general",
            "priority": "normal",
            "route": "tier2"
        },
        # Edge cases
        {
            "subject": "",
            "body": "",
            "category": "general",
            "priority": "normal",
            "route": "tier2"
        },
        {
            "subject": "URGENT BUG: Login broken AND app crashes",
            "body": "Critical issue: can't login and app crashes on startup.",
            "category": "bug",  # Bug takes precedence over auth in current logic
            "priority": "high",
            "route": "tier1"
        },
    ]
    
    for i in range(size):
        template = random.choice(templates)
        # Add some variation
        subject_variations = [
            template["subject"],
            template["subject"].replace("URGENT", "ASAP"),
            template["subject"].replace("Bug:", "Issue:"),
            template["subject"] + " - please help",
        ]
        
        ticket = Ticket(
            id=f"VAL-{i+1:03d}",
            subject=random.choice(subject_variations),
            body=template["body"]
        )
        
        validation_tickets.append(ValidationTicket(
            ticket=ticket,
            expected_category=template["category"],
            expected_priority=template["priority"],
            expected_route=template["route"]
        ))
    
    return validation_tickets

def calculate_metrics(predictions: List[Dict[str, Any]], 
                     validation_tickets: List[ValidationTicket]) -> Dict[str, float]:
    """Calculate precision, recall, and F1-score for each category."""
    categories = ["auth", "bug", "feature", "general"]
    metrics = {}
    
    for category in categories:
        # True positives, false positives, false negatives
        tp = fp = fn = 0
        
        for pred, val in zip(predictions, validation_tickets):
            pred_category = pred["category"]
            true_category = val.expected_category
            
            if pred_category == category and true_category == category:
                tp += 1
            elif pred_category == category and true_category != category:
                fp += 1
            elif pred_category != category and true_category == category:
                fn += 1
        
        # Calculate metrics
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        metrics[f"{category}_precision"] = precision
        metrics[f"{category}_recall"] = recall
        metrics[f"{category}_f1"] = f1
    
    # Overall accuracy
    correct = sum(1 for pred, val in zip(predictions, validation_tickets) 
                  if pred["category"] == val.expected_category)
    metrics["overall_accuracy"] = correct / len(validation_tickets)
    
    # Priority accuracy
    priority_correct = sum(1 for pred, val in zip(predictions, validation_tickets) 
                          if pred["priority"] == val.expected_priority)
    metrics["priority_accuracy"] = priority_correct / len(validation_tickets)
    
    # Route accuracy
    route_correct = sum(1 for pred, val in zip(predictions, validation_tickets) 
                       if pred["route"] == val.expected_route)
    metrics["route_accuracy"] = route_correct / len(validation_tickets)
    
    return metrics

def analyze_false_positives_negatives(predictions: List[Dict[str, Any]], 
                                     validation_tickets: List[ValidationTicket]) -> Tuple[List[Dict], List[Dict]]:
    """Analyze false positives and false negatives."""
    false_positives = []
    false_negatives = []
    
    for pred, val in zip(predictions, validation_tickets):
        if pred["category"] != val.expected_category:
            if pred["category"] in ["auth", "bug", "feature"] and val.expected_category == "general":
                # False positive: classified as specific category but should be general
                false_positives.append({
                    "ticket_id": pred["ticket_id"],
                    "subject": pred["subject"],
                    "predicted": pred["category"],
                    "expected": val.expected_category,
                    "priority_predicted": pred["priority"],
                    "priority_expected": val.expected_priority,
                    "reason": f"Over-classified as {pred['category']}"
                })
            elif val.expected_category in ["auth", "bug", "feature"] and pred["category"] == "general":
                # False negative: should be specific category but classified as general
                false_negatives.append({
                    "ticket_id": pred["ticket_id"],
                    "subject": pred["subject"],
                    "predicted": pred["category"],
                    "expected": val.expected_category,
                    "priority_predicted": pred["priority"],
                    "priority_expected": val.expected_priority,
                    "reason": f"Missed {val.expected_category} keywords"
                })
            else:
                # Misclassification between specific categories
                false_positives.append({
                    "ticket_id": pred["ticket_id"],
                    "subject": pred["subject"],
                    "predicted": pred["category"],
                    "expected": val.expected_category,
                    "priority_predicted": pred["priority"],
                    "priority_expected": val.expected_priority,
                    "reason": f"Confusion between {pred['category']} and {val.expected_category}"
                })
    
    return false_positives, false_negatives

def main():
    print("=== Ticket Triage MVP Validation ===\n")
    
    # Generate validation dataset
    print("Generating validation dataset...")
    validation_tickets = generate_validation_dataset(size=100)
    print(f"Generated {len(validation_tickets)} validation tickets\n")
    
    # Run classification
    print("Running classification...")
    tickets = [vt.ticket for vt in validation_tickets]
    predictions = triage_tickets(tickets)
    
    # Calculate metrics
    print("Calculating metrics...")
    metrics = calculate_metrics(predictions, validation_tickets)
    
    # Analyze errors
    print("Analyzing errors...")
    false_positives, false_negatives = analyze_false_positives_negatives(predictions, validation_tickets)
    
    # Print results
    print("\n" + "="*60)
    print("VALIDATION RESULTS")
    print("="*60)
    
    print(f"\nOverall Accuracy: {metrics['overall_accuracy']:.2%}")
    print(f"Priority Accuracy: {metrics['priority_accuracy']:.2%}")
    print(f"Route Accuracy: {metrics['route_accuracy']:.2%}")
    
    print("\nCategory-wise Metrics:")
    categories = ["auth", "bug", "feature", "general"]
    for cat in categories:
        print(f"  {cat.upper():8} - Precision: {metrics[f'{cat}_precision']:.2%}, "
              f"Recall: {metrics[f'{cat}_recall']:.2%}, F1: {metrics[f'{cat}_f1']:.2%}")
    
    print(f"\nError Analysis:")
    print(f"  False Positives: {len(false_positives)}")
    print(f"  False Negatives: {len(false_negatives)}")
    
    if false_positives:
        print(f"\nTop False Positives (over-classification):")
        for fp in false_positives[:5]:
            print(f"  - {fp['ticket_id']}: {fp['subject'][:50]}...")
            print(f"    Predicted: {fp['predicted']} ({fp['priority_predicted']}), "
                  f"Expected: {fp['expected']} ({fp['priority_expected']})")
            print(f"    Reason: {fp['reason']}")
    
    if false_negatives:
        print(f"\nTop False Negatives (under-classification):")
        for fn in false_negatives[:5]:
            print(f"  - {fn['ticket_id']}: {fn['subject'][:50]}...")
            print(f"    Predicted: {fn['predicted']} ({fn['priority_predicted']}), "
                  f"Expected: {fn['expected']} ({fn['priority_expected']})")
            print(f"    Reason: {fn['reason']}")
    
    # Rule improvement suggestions
    print("\n" + "="*60)
    print("RULE IMPROVEMENT SUGGESTIONS")
    print("="*60)
    
    suggestions = []
    
    # Analyze common patterns in errors
    auth_fp = [fp for fp in false_positives if fp['predicted'] == 'auth']
    auth_fn = [fn for fn in false_negatives if fn['expected'] == 'auth']
    
    if auth_fp or auth_fn:
        suggestions.append("1. Auth classification: Consider adding more specific auth keywords "
                          "(e.g., '2fa', 'mfa', 'otp', 'verification') and exclude false triggers.")
    
    bug_fp = [fp for fp in false_positives if fp['predicted'] == 'bug']
    bug_fn = [fn for fn in false_negatives if fn['expected'] == 'bug']
    
    if bug_fp or bug_fn:
        suggestions.append("2. Bug classification: Expand bug keywords to include "
                          "'freezing', 'hanging', 'slow', 'performance', 'glitch'.")
    
    feature_fp = [fp for fp in false_positives if fp['predicted'] == 'feature']
    feature_fn = [fn for fn in false_negatives if fn['expected'] == 'feature']
    
    if feature_fp or feature_fn:
        suggestions.append("3. Feature requests: Add keywords like 'suggestion', 'improvement', "
                          "'enhancement', 'would be nice', 'please add'.")
    
    # Priority escalation suggestions
    priority_errors = sum(1 for pred, val in zip(predictions, validation_tickets) 
                         if pred["priority"] != val.expected_priority)
    
    if priority_errors > 0:
        suggestions.append("4. Priority escalation: Review 'urgent' keyword detection - "
                          "consider case-insensitive matching and additional urgency indicators "
                          "like 'critical', 'emergency', 'blocking'.")
    
    # Category precedence
    mixed_errors = [fp for fp in false_positives if 'Confusion between' in fp['reason']]
    if mixed_errors:
        suggestions.append("5. Category precedence: Define clear precedence rules when "
                          "multiple category keywords are present (e.g., auth vs bug).")
    
    if suggestions:
        for i, suggestion in enumerate(suggestions, 1):
            print(f"\n{i}. {suggestion}")
    else:
        print("\nNo major rule improvements needed based on current validation.")
    
    # Save detailed report
    report = {
        "metrics": metrics,
        "false_positives": false_positives,
        "false_negatives": false_negatives,
        "sample_predictions": predictions[:10],
        "validation_summary": {
            "total_tickets": len(validation_tickets),
            "accuracy_target": 0.90,
            "accuracy_achieved": metrics["overall_accuracy"],
            "meets_target": metrics["overall_accuracy"] >= 0.90
        }
    }
    
    with open("validation_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    
    print(f"\nDetailed report saved to validation_report.json")
    
    # Final verdict
    print("\n" + "="*60)
    print("VALIDATION VERDICT")
    print("="*60)
    
    if metrics["overall_accuracy"] >= 0.90:
        print(f"\n✅ PASS: Accuracy of {metrics['overall_accuracy']:.2%} meets 90% target.")
        print("The Ticket Triage MVP is ready for production deployment.")
    else:
        print(f"\n❌ FAIL: Accuracy of {metrics['overall_accuracy']:.2%} below 90% target.")
        print("Rule improvements are needed before production deployment.")
    
    return metrics["overall_accuracy"] >= 0.90

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)