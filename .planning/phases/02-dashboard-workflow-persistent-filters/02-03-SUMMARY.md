---
phase: 02-dashboard-workflow-persistent-filters
plan: 03
subsystem: ui
tags: [react, routing, dashboard, filters, persistence, vitest]
requires:
  - phase: 02-01
    provides: shared dashboard filter provider with URL/localStorage hydration
  - phase: 02-02
    provides: selector-driven dashboard filtering/KPI wiring and focused-run exclusion guard
provides:
  - Dashboard filter controls consume shared orchestration state/actions from index owner
  - Summary route (`/summary`) consumes shared dashboard filter state for cross-view continuity
  - Route-level continuity test coverage for summary shared-filter consumption
affects: [dashboard, summary-route, filter-sync, url-replay]
tech-stack:
  added: []
  patterns:
    - Presentational filter controls receive data via props; no direct hook coupling
    - Route-level shared-filter consumption without rewriting legacy ActivityList internals
key-files:
  created:
    - frontend/src/pages/total.sharedFilters.test.tsx
  modified:
    - frontend/src/components/RunMap/RunMapButtons.tsx
    - frontend/src/components/LocationStat/index.tsx
    - frontend/src/components/LocationStat/CitiesStat.tsx
    - frontend/src/components/LocationStat/PeriodStat.tsx
    - frontend/src/components/YearStat/index.tsx
    - frontend/src/components/YearsStat/index.tsx
    - frontend/src/pages/index.tsx
    - frontend/src/pages/total.tsx
key-decisions:
  - "Index page remains the single owner of focus/hash clearing behavior while child controls become prop-driven."
  - "Summary route adopts shared filter context at route shell level to preserve continuity without full ActivityList rewrite."
patterns-established:
  - "Filter control components are fed from centralized page orchestration rather than reading activities directly."
  - "Detail-related routes can participate in global filter continuity through lightweight route shell integration."
requirements-completed: [DASH-02, DASH-03]
duration: 8min
completed: 2026-03-21
---

# Phase 02 Plan 03: Cross-View Filter Synchronization Summary

**Dashboard and summary views now share one live filter model with URL replay continuity, while legacy detail rendering remains intact.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-21T14:06:00Z
- **Completed:** 2026-03-21T14:14:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Migrated year/city/title control wiring to shared-filter orchestration via `index.tsx`, removing direct hook-state duplication inside filter UI components.
- Preserved single-run focus/hash clearing contract in `index.tsx` as the sole owner when filters exclude the focused run.
- Wired `/summary` route shell to `useDashboardFilters()` for cross-view continuity and added route-level continuity test coverage.

## Task Commits

1. **Task 1: Migrate existing filter controls to consume global filter state/actions** - `be03cc1` (feat)
2. **Task 2 (TDD RED): Wire detail-related `/summary` route to shared filter model** - `39070ff` (test)
3. **Task 2 (TDD GREEN): Implement `/summary` shared filter consumption** - `389c809` (feat)
4. **Task 2 (TDD REFACTOR): Stabilize route continuity test harness** - `8cd884a` (refactor)

## Files Created/Modified
- `frontend/src/components/RunMap/RunMapButtons.tsx` - now accepts `years` via props instead of reading activities directly.
- `frontend/src/components/LocationStat/index.tsx` - receives year/city/period/activity datasets from page-level orchestration.
- `frontend/src/components/LocationStat/CitiesStat.tsx` - presentational city stats from injected data.
- `frontend/src/components/LocationStat/PeriodStat.tsx` - presentational period stats from injected data.
- `frontend/src/components/YearStat/index.tsx` - computes yearly stats from injected `activities` + `years`.
- `frontend/src/components/YearsStat/index.tsx` - passes shared data into `YearStat` and keeps ordering/info behavior.
- `frontend/src/pages/index.tsx` - single orchestration owner for shared filter wiring and focused-run hash exclusion behavior.
- `frontend/src/pages/total.tsx` - consumes `useDashboardFilters()` at route shell to preserve cross-route continuity.
- `frontend/src/pages/total.sharedFilters.test.tsx` - validates `/summary` shared filter consumption on mount.

## Decisions Made
- Kept hash/focus exclusion clearing in `index.tsx` rather than distributing URL logic into child controls.
- Integrated shared filters into `/summary` with minimal surface-area changes (route shell), explicitly avoiding broader `ActivityList` rewrites in this plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added HelmetProvider test wrapper for summary route test**
- **Found during:** Task 2 (TDD RED)
- **Issue:** Test crashed because `Helmet` requires provider context.
- **Fix:** Wrapped `HomePage` render with `HelmetProvider`.
- **Files modified:** `frontend/src/pages/total.sharedFilters.test.tsx`
- **Verification:** Targeted test executes assertions instead of crashing.
- **Committed in:** `8cd884a`

**2. [Rule 3 - Blocking] Replaced unavailable matcher usage in Vitest setup**
- **Found during:** Task 2 (TDD GREEN verification)
- **Issue:** `toHaveAttribute` matcher not configured in current test environment.
- **Fix:** Switched to native attribute assertion with `getAttribute(...).toBe(...)`.
- **Files modified:** `frontend/src/pages/total.sharedFilters.test.tsx`
- **Verification:** Targeted + plan verification suites pass.
- **Committed in:** `8cd884a`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were test-harness correctness updates needed to complete planned TDD workflow; no scope creep.

## Issues Encountered
- Build steps generated `frontend/dist` artifacts repeatedly; cleaned generated files after verification runs to keep task/doc commits source-only.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 2 filter continuity expectations are now met across `/` and `/summary` route shells.
- Dashboard controls and route shells are aligned on shared model usage, reducing drift risk for Phase 3 detail-surface enhancements.


## Self-Check: PASSED

