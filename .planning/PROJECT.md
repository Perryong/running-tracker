# Running Tracker Revamp

## What This Is

A revamped personal running tracker focused on a modern, polished UI/UX and cleaner architecture. It keeps the existing React/Vite frontend and Python backend stack, while improving data flow with clearer frontend/backend boundaries and typed API contracts. v1 prioritizes easier daily use (dashboard/navigation) plus richer Garmin-derived insights, especially heart rate zone trends.

## Core Value

Daily training review should feel effortless and visually clear, with trustworthy heart-rate-centric insights.

## Current Milestone: v1.0 Running Tracker Revamp

**Goal:** Modernize the running tracker with cleaner UX and heart-rate-centric Garmin insights while tightening frontend/backend boundaries.

**Target features:**
- Modern, intuitive dashboard and navigation for daily review
- Typed API boundary between frontend and backend data services
- Heart rate zone and trend analytics from Garmin activity data
- Improved activity detail views with clearer metric presentation

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Modern, intuitive dashboard and navigation for daily use
- [ ] Typed API boundary between frontend and backend data services
- [ ] Heart rate zones and trend analytics from Garmin activity data
- [ ] Improved activity detail views with clearer metrics presentation

### Out of Scope

- Multi-user accounts, collaboration, and public social features — project is single-user personal tracker
- Full backend stack replacement/framework migration — keep React/Vite + Python where possible

## Context

This work is a revamp of an existing running tracker codebase. The current app already visualizes activities, and the next iteration should modernize UX while improving architecture quality for ongoing maintenance. The primary user is the project owner, so decisions should optimize personal workflow speed, clarity, and reliability over broad product-market concerns.

## Constraints

- **Tech stack**: Keep existing core stack (React/Vite + Python) — minimizes disruption and preserves working foundations
- **User scope**: Single-user experience first — avoids complexity not needed for current goals
- **Architecture direction**: Stronger frontend/backend contract with typed APIs — improves maintainability and confidence in data handling

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prioritize UI/UX polish in v1 | Immediate daily usability impact for primary user | — Pending |
| Focus analytics on heart rate zones/trends first | Most requested insight area from Garmin data | — Pending |
| Keep current stack, improve boundaries via typed APIs | Modernize architecture without costly full rewrite | — Pending |

---
*Last updated: 2026-03-21 after milestone v1.0 start*
