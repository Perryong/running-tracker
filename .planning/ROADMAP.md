# Roadmap: Running Tracker Revamp (Milestone v1.0)

## Overview

This roadmap delivers v1.0 in dependency order: first establish a trustworthy typed API boundary and freshness metadata, then ship the modern dashboard workflow with persistent filtering, then upgrade activity detail UX robustness, and finally deliver heart-rate analytics/trends with clear methodology disclosure so insights are both useful and trustworthy.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Typed API Foundation** - Establish typed backend/frontend API contracts with freshness metadata.
- [ ] **Phase 2: Dashboard Workflow & Persistent Filters** - Deliver modern KPI dashboard and shared/persistent filtering behavior.
- [ ] **Phase 3: Activity Detail Experience** - Deliver clear activity detail hierarchy with resilient empty/loading/error handling.
- [ ] **Phase 4: Heart Rate Analytics & Transparency** - Deliver per-run zone analytics and weekly/monthly HR trends with methodology disclosure.

## Phase Details

### Phase 1: Typed API Foundation
**Goal**: Users can rely on a stable, typed data boundary between frontend and backend, including visibility into data freshness/completeness.
**Depends on**: Nothing (first phase)
**Requirements**: API-01, API-02
**Success Criteria** (what must be TRUE):
  1. Frontend screens retrieve activity and analytics data through generated typed API contracts without ad-hoc schema assumptions.
  2. Users can see when data was last synced and whether returned datasets are complete/incomplete.
  3. API-backed views handle contract-valid responses consistently so users do not encounter mismatched or missing fields due to schema drift.
**Plans**: 3 plans
Plans:
- [x] 01-01-PLAN.md — Build `/api/v1` FastAPI contract foundation with mandatory freshness metadata and contract tests
- [x] 01-02-PLAN.md — Generate frontend API types and migrate `useActivities` to typed API-first boundary with fallback
- [x] 01-03-PLAN.md — Close verification gap by wiring visible freshness/completeness trust signal UI to `useActivities().freshness`

### Phase 2: Dashboard Workflow & Persistent Filters
**Goal**: Users can review key training KPIs in a modern dashboard and apply one consistent filter model across views without losing context.
**Depends on**: Phase 1
**Requirements**: DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. User can open the dashboard and see KPI cards for selected period (distance, duration, runs, average heart rate).
  2. User can apply date/activity filters that affect dashboard and detail-related views through one shared filtering behavior.
  3. User filter selections remain intact after navigation and browser reload.
**Plans**: 3 plans
Plans:
- [x] 02-01-PLAN.md — Build centralized shared filter contracts/provider with URL-first persistence and replay test coverage
- [x] 02-02-PLAN.md — Implement KPI selectors/cards + explicit empty-state and wire dashboard KPI rendering to shared filters
- [ ] 02-03-PLAN.md — Migrate cross-view filter controls/routes (`/` + `/summary`) to shared synchronization and persistence behavior

### Phase 3: Activity Detail Experience
**Goal**: Users can open an activity and quickly understand performance through clear metric hierarchy, with robust non-happy-path states.
**Depends on**: Phase 1, Phase 2
**Requirements**: ACT-01, ACT-02
**Success Criteria** (what must be TRUE):
  1. User can open any activity detail screen and see a clear metric hierarchy including headline stats, pace, elevation, and average HR.
  2. User sees a stable, readable loading state while activity detail data is being fetched.
  3. User sees intentional empty/error states (not broken layout) when activity data is missing or fetch fails.
**Plans**: TBD

### Phase 4: Heart Rate Analytics & Transparency
**Goal**: Users can trust and act on heart-rate analytics through per-run zone breakdowns, period trends, and explicit methodology disclosure.
**Depends on**: Phase 1, Phase 2, Phase 3
**Requirements**: HR-01, HR-02, HR-03
**Success Criteria** (what must be TRUE):
  1. User can view per-run heart rate zone breakdown with both time and percentage by zone.
  2. User can view heart rate trend analytics for weekly and monthly periods derived from Garmin data.
  3. User can clearly identify which heart-rate zone methodology/provenance is used for displayed calculations.
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Typed API Foundation | 3/3 | Complete | 2026-03-21 |
| 2. Dashboard Workflow & Persistent Filters | 2/3 | In Progress | - |
| 3. Activity Detail Experience | 0/TBD | Not started | - |
| 4. Heart Rate Analytics & Transparency | 0/TBD | Not started | - |
