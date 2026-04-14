# JAMA-6 Plan: Build first automation prototype

- Objective: Deliver a minimal viable automation for Customer Support Ticket Triage.
- Scope: classification, prioritization, and routing hints; no external dependencies yet.
- MVP Approach:
  - Implement a simple rule-based classifier (high/medium/low priority)
  - Derive routing target tiers (tier1, tier2) from priority
  - Provide a small CLI demo for local validation
- Deliverables:
  - automation/ticket_triage_mvp.py
  - README with how to run the MVP (or a short usage guide)
- Milestones:
 1) Scaffolding and basic classifier (1-2 days)
 2) Local validation with sample tickets (1 day)
 3) Integrate LangGraph mock store and adapter (2-3 days)
 4) Docker/docker-compose scaffolding and local demo (1-2 days)
 5) QA review and stakeholder demo preparation (ongoing until sign-off)

- Risks:
  - MVP is heuristic; needs product feedback to adjust rules
- Stakeholders:
  - CTO (you)
- Next update: Confirm MVP rules and provide sample tickets for QA review.
- Next update: Confirm MVP rules and provide sample tickets for QA review.
- Blockers:
  - Need QA to validate classification rules against representative ticket data and provide feedback on routing semantics.
  - Need boss sign-off on MVP scope and timelines before deeper integration work.
- Actions assigned:
  - QA: Review MVP triage rules and provide test cases.
  - CTO/You: Approve MVP integration plan with LangGraph and Docker scaffolding.
