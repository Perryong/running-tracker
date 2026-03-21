---
phase: 03-activity-detail-experience
plan: 02
subsystem: ui
tags: [react, react-router, vitest, navigation, activity-detail]
requires:
  - phase: 03-01
    provides: dedicated activity detail route/state shell foundation
provides:
  - Dashboard run row navigation to `/activity/:runId` with preserved filter query string
  - Deterministic back/fallback behavior using dashboard-origin state across ready/error/not-found states
  - Navigation regression coverage for route entry, back/fallback, and retry continuity
affects: [phase-03-navigation, activity-detail, dashboard-entry]
tech-stack:
  added: []
  patterns:
    - Dashboard-origin route transitions pass `fromDashboard` state + fallback metadata
    - Activity detail uses one shared `handleBack` callback for all Back controls
key-files:
  created:
    - frontend/src/pages/activityDetail.navigation.test.tsx
  modified:
    - frontend/src/components/RunTable/RunRow.tsx
    - frontend/src/components/RunTable/index.tsx
    - frontend/src/pages/index.tsx
    - frontend/src/pages/activity.tsx
    - frontend/src/features/activity-detail/components/ActivityDetailError.tsx
    - frontend/src/features/activity-detail/components/ActivityDetailNotFound.tsx
    - frontend/src/pages/activityDetail.route.test.tsx
    - frontend/src/pages/activityDetail.states.test.tsx
    - frontend/src/pages/index.singleRunFocus.test.ts
key-decisions:
  - "Run row clicks now route directly to `/activity/:runId` and preserve `location.search` unchanged to keep dashboard filter continuity."
  - "Back behavior is centralized in `handleBack`: use `navigate(-1)` only for `fromDashboard`, otherwise deterministic fallback to `/` with current query."
  - "Error/not-found Back controls invoke the same shared callback so navigation semantics remain identical across all detail states."
patterns-established:
  - "Origin-aware back strategy: location.state.fromDashboard gate + query-preserving fallback"
  - "Navigation regression tests reset router mocks per case to keep assertions deterministic"
requirements-completed: [ACT-01, ACT-02]
duration: 7min
completed: 2026-03-21
---

# Phase 3 Plan 02: Dashboard-to-Detail Navigation Continuity Summary

**Dashboard row clicks now open route-based activity detail with preserved filter query context and deterministic back/fallback behavior across ready, error, and not-found states.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-21T15:47:25Z
- **Completed:** 2026-03-21T15:54:45Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Replaced row hash-focus entry with route navigation to `/activity/:runId` while carrying shared filter query params unchanged.
- Implemented shared `handleBack` logic in detail page and reused it for header, error, and not-found Back controls.
- Added and finalized `activityDetail.navigation.test.tsx` coverage for dashboard-origin history back, direct-entry fallback, state CTA parity, and retry query continuity.

## Task Commits

1. **Task 1: Replace row hash-focus entry with query-preserving route navigation to detail** - `c2171b5` (feat)
2. **Task 2: Implement deterministic Back/Fallback handling across ready/error/not-found detail states** - `4490746` (feat)
3. **Task 3: Phase-level navigation regression run (route/state/back/fallback)** - `09003ff` (test)

## Files Created/Modified
- `frontend/src/components/RunTable/RunRow.tsx` - row click now routes to detail with preserved query + dashboard origin state.
- `frontend/src/components/RunTable/index.tsx` - removed now-unused row focus props and passed minimal row data.
- `frontend/src/pages/index.tsx` - updated `RunTable` invocation to match route-entry row behavior.
- `frontend/src/pages/activity.tsx` - added shared deterministic `handleBack` branching and button-based Back header.
- `frontend/src/features/activity-detail/components/ActivityDetailError.tsx` - swapped link-based back for callback-based button.
- `frontend/src/features/activity-detail/components/ActivityDetailNotFound.tsx` - swapped link-based back for callback-based button.
- `frontend/src/pages/activityDetail.navigation.test.tsx` - new navigation matrix tests for entry/back/fallback/retry.
- `frontend/src/pages/activityDetail.route.test.tsx` - aligned header back assertion to button control.
- `frontend/src/pages/activityDetail.states.test.tsx` - aligned error/not-found assertions to callback-based Back controls.
- `frontend/src/pages/index.singleRunFocus.test.ts` - aligned describe label to plan-targeted test filter.

## Decisions Made
- Kept Phase 3 scope strict by only wiring entry/back continuity and navigation tests; no adjacent-run controls or Phase 4 analytics behavior were added.
- Preserved dashboard filter model canonical keys by forwarding `location.search` unchanged during row-to-detail navigation.
- Standardized Back semantics through one page-level callback to eliminate state-specific navigation drift.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed targeted single-run-focus verification selector mismatch**
- **Found during:** Task 1 verification
- **Issue:** Plan verification command filtered by `"single run focus"` but test suite name did not include that phrase, causing all cases to skip.
- **Fix:** Renamed test describe block to include `"single run focus"` so targeted verification executes real assertions.
- **Files modified:** `frontend/src/pages/index.singleRunFocus.test.ts`
- **Verification:** `pnpm run test -- src/pages/index.singleRunFocus.test.ts -t "single run focus"`
- **Committed in:** `c2171b5` (part of Task 1 commit)

**2. [Rule 1 - Bug] Removed cross-test mock leakage in navigation suite**
- **Found during:** Task 3 verification
- **Issue:** `navigateMock` call counts leaked across tests, breaking retry-only assertion determinism.
- **Fix:** Added `beforeEach` reset for `navigateMock` and `locationMock`.
- **Files modified:** `frontend/src/pages/activityDetail.navigation.test.tsx`
- **Verification:** `pnpm run test -- src/pages/activityDetail.route.test.tsx src/pages/activityDetail.states.test.tsx src/pages/activityDetail.navigation.test.tsx src/pages/index.singleRunFocus.test.ts`
- **Committed in:** `09003ff` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes were required to execute plan-specified verification deterministically. No scope creep.

## Issues Encountered
- None beyond the auto-fixed verification/test determinism issues above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 entry/back continuity is complete and validated with route/state/navigation tests.
- Phase 4 can rely on stable activity detail navigation semantics while adding HR analytics content.

## Self-Check: PASSED
- FOUND: frontend/src/components/RunTable/RunRow.tsx
- FOUND: frontend/src/pages/activity.tsx
- FOUND: frontend/src/pages/activityDetail.navigation.test.tsx
- FOUND: .planning/phases/03-activity-detail-experience/03-02-SUMMARY.md
- FOUND: commit c2171b5
- FOUND: commit 4490746
- FOUND: commit 09003ff

