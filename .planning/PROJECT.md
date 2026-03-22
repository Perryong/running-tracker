# Running Tracker Revamp

## What This Is

A revamped personal running tracker focused on a modern, polished UI/UX and cleaner architecture. It keeps the existing React/Vite frontend and Python backend stack, while improving data flow with clearer frontend/backend boundaries and typed API contracts. v1 prioritizes easier daily use (dashboard/navigation) plus richer Garmin-derived insights, especially heart rate zone trends.

## Core Value

Daily training review should feel effortless and visually clear, with trustworthy heart-rate-centric insights.

## Current State

✅ **v1.0 Running Tracker Revamp shipped (2026-03-22)**.

Shipped milestone outcomes:
- Typed backend/frontend API boundary with contract-generated frontend types and freshness trust metadata.
- Shared, URL-first persistent filter model across dashboard and detail-related experiences.
- Dedicated activity detail route with clear metric hierarchy and resilient loading/empty/error behavior.
- Heart-rate analytics with per-run zone breakdowns, weekly/monthly trends, and explicit methodology/provenance + confidence signaling.

## Next Milestone Goals

- Define new milestone requirements based on current shipped baseline (`/gsd-new-milestone`).
- Prioritize any post-v1.0 polish or debt from milestone retrospective/audit.
- Keep trust and clarity as primary product lenses for next roadmap decisions.

## Requirements

### Validated

- ✓ Modern, intuitive dashboard and navigation for daily use — v1.0
- ✓ Typed API boundary between frontend and backend data services — v1.0
- ✓ Heart rate zones and trend analytics from Garmin activity data — v1.0
- ✓ Improved activity detail views with clearer metrics presentation — v1.0

### Active

- [ ] Define vNext requirement set from post-ship priorities

### Out of Scope

- Multi-user accounts, collaboration, and public social features — project is single-user personal tracker
- Full backend stack replacement/framework migration — keep React/Vite + Python where possible

## Context

v1.0 is now shipped as a full four-phase milestone (13 plans, 35 tasks) with all scoped requirements completed. The current codebase includes typed APIs, cross-view persistent filters, robust activity detail route states, and HR analytics transparency primitives. Next milestone planning can start from this validated baseline, with requirements re-scoped to new goals rather than carrying forward already-shipped work.

## Constraints

- **Tech stack**: Keep existing core stack (React/Vite + Python) — minimizes disruption and preserves working foundations
- **User scope**: Single-user experience first — avoids complexity not needed for current goals
- **Architecture direction**: Stronger frontend/backend contract with typed APIs — improves maintainability and confidence in data handling

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prioritize UI/UX polish in v1 | Immediate daily usability impact for primary user | ✓ Shipped in Phase 2/3 |
| Focus analytics on heart rate zones/trends first | Most requested insight area from Garmin data | ✓ Shipped in Phase 4 |
| Keep current stack, improve boundaries via typed APIs | Modernize architecture without costly full rewrite | ✓ Shipped in Phase 1 |
| Use explicit methodology/provenance + confidence signaling for HR analytics | Build user trust and avoid false certainty | ✓ Shipped in Phase 4 |

---
*Last updated: 2026-03-22 after milestone v1.0 completion*
