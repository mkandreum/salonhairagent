Ticket: CI Kickoff for CTO Scaffold (PR-based)

Description:
- Create and merge a PR that triggers the CI workflow for the CTO scaffold to validate tests and contract. Ensure logs and results are collected and accessible in CI.

Acceptance Criteria:
- CI runs across Node 18.x and 20.x with npm ci, npm test, and npm run build.
- Test contract validated: runAgent(config) returns { config, plan, createdAt } and plan is an array with numeric steps.
- Logs and results are attached in the CI interface or linked to the ticket.
- If failures occur, remediation plan is documented with assigned owners.

Owner: QA / DevOps
Priority: High

Linked: CTO scaffold, qa_ci_cto_scaffold.md
