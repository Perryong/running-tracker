---
phase: 02-dashboard-workflow-persistent-filters
plan: 02
subsystem: ui
tags: [react, selectors, dashboard, filters, vitest]
requires:
  - phase: 02-01
    provides: shared dashboard filter provider, URL/localStorage persistence contracts
provides:
  - Shared filtered-run selector bound to DashboardFilters
  - KPI aggregation selector for distance/duration/run count/average HR
  - KPI cards + explicit zero-results empty state UI
  - Index page wiring to shared filters/selectors with single-run exclusion guard
affects: [dashboard, map-table-flow, filter-sync, phase-02-plan-03]
tech-stack:
  added: []
  patterns:
    - Pure selectors for dashboard derivations (filtered runs + KPI payload)
    - Value-only KPI card presentation with locked responsive density classes
    - Single-run URL hash focus clears when filters exclude focused run
key-files:
  created:
    - frontend/src/features/dashboard/selectors/selectFilteredRuns.ts
    - frontend/src/features/dashboard/selectors/selectKpis.ts
    - frontend/src/features/dashboard/components/KpiCards.tsx
    - frontend/src/features/dashboard/components/EmptyKpiState.tsx
    - frontend/src/features/dashboard/components/KpiCards.test.tsx
    - frontend/src/pages/index.singleRunFocus.test.ts
  modified:
    - frontend/src/pages/index.tsx
key-decisions:
  - "Dashboard derivations moved into reusable pure selectors consumed by index.tsx."
  - "KPI cards remain value-only with fixed order and fixed 2-col mobile / 4-col desktop layout."
  - "When filtered runs exclude the currently focused hash run, clear hash/focus and show filtered dataset."
patterns-established:
  - "Selector-first dashboard computation: UI consumes computed data, not ad-hoc inline math."
  - "Explicit empty-state rendering for valid zero-result filter combinations."
requirements-completed: [DASH-01, DASH-02]
duration: 6min
completed: 2026-03-21
---

# Phase 02 Plan 02: KPI Selectors and Dashboard Wiring Summary

**Shared dashboard filters now drive reusable filtered/KPI selectors and a locked KPI card surface with explicit zero-results handling, while preserving existing map/table interactions.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-21T13:58:00Z
- **Completed:** 2026-03-21T14:04:05Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Implemented `selectFilteredRuns` and `selectKpis` so dashboard filtering and KPI math are centralized and reusable.
- Delivered KPI UI contract with four fixed cards, responsive density behavior, and explicit empty-state messaging.
- Refactored `index.tsx` to consume shared filter context/selectors and added focused-run exclusion handling when filters change.

## Task Commits

1. **Task 1: Implement filtered-run and KPI selectors from shared filter contracts** - `ed0c702` (feat)
2. **Task 2: Build KPI cards + explicit empty-state components with locked responsive layout (TDD RED)** - `551354b` (test)
3. **Task 2: Build KPI cards + explicit empty-state components with locked responsive layout (TDD GREEN)** - `1e5bd68` (feat)
4. **Task 3: Wire index page to shared selectors and KPI components (TDD RED)** - `3bee2bd` (test)
5. **Task 3: Wire index page to shared selectors and KPI components (TDD GREEN)** - `ae803ff` (feat)

## Files Created/Modified
- `frontend/src/features/dashboard/selectors/selectFilteredRuns.ts` - Pure selector for all shared filter dimensions and sorted run output.
- `frontend/src/features/dashboard/selectors/selectKpis.ts` - KPI aggregation for distance, duration seconds, run count, and nullable average HR.
- `frontend/src/features/dashboard/components/KpiCards.tsx` - Value-only KPI cards with locked responsive layout classes.
- `frontend/src/features/dashboard/components/EmptyKpiState.tsx` - Explicit zero-results card preserving filter context.
- `frontend/src/features/dashboard/components/KpiCards.test.tsx` - Tests for KPI order, value rendering, layout class contract, and empty copy.
- `frontend/src/pages/index.singleRunFocus.test.ts` - Guard tests for focused-run exclusion behavior.
- `frontend/src/pages/index.tsx` - Dashboard wiring to shared filters/selectors, KPI rendering, and single-run hash clearing logic.

## Decisions Made
- Used selector-driven derivations (`selectFilteredRuns`, `selectKpis`) instead of page-local filtering/math to keep behavior reusable and deterministic.
- Kept KPI presentation strictly value-only (no trends/deltas) per phase lock while enforcing `grid-cols-2 lg:grid-cols-4`.
- Added explicit single-run focus exit behavior whenever filter updates remove the focused run from the filtered dataset.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build/test verification generated `frontend/dist` artifacts; cleaned generated files after each verification run to keep commits source-only.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Dashboard KPI rendering contract is now shared-filter-driven and regression-tested.
- Phase 02-03 can focus on cross-route filter synchronization behavior without reworking KPI/filter derivation.

## Self-Check: PASSED

