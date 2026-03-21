---
phase: 03-activity-detail-experience
plan: 01
subsystem: ui
tags: [react, react-router, react-query, vitest, activity-detail]
requires:
  - phase: 01-typed-api-foundation
    provides: typed activities API contract and frontend API client
  - phase: 02-dashboard-workflow-persistent-filters
    provides: query-driven shared filter continuity model
provides:
  - Dedicated /activity/:runId route and detail page shell
  - Explicit loading/error/not-found/ready detail state machine
  - ACT-01 metric hierarchy, elevation secondary section, and map block
  - ACT-01/ACT-02 regression coverage for route + state behavior
affects: [03-02-navigation, activity-detail, ui-testing]
tech-stack:
  added: []
  patterns:
    - Stable outer shell wrappers with state-specific inner content swapping
    - Error-capable detail data boundary via useActivityDetail + React Query
key-files:
  created:
    - frontend/src/features/activity-detail/hooks/useActivityDetail.ts
    - frontend/src/features/activity-detail/components/ActivityDetailSkeleton.tsx
    - frontend/src/features/activity-detail/components/ActivityDetailNotFound.tsx
    - frontend/src/features/activity-detail/components/ActivityDetailError.tsx
    - frontend/src/pages/activity.tsx
    - frontend/src/pages/activityDetail.route.test.tsx
    - frontend/src/pages/activityDetail.states.test.tsx
  modified:
    - frontend/src/main.tsx
key-decisions:
  - "Use a dedicated useActivityDetail hook over useActivities fallback so network failures can render explicit ACT-02 error state with retry."
  - "Keep activity-detail-shell and activity-detail-content-shell wrappers mounted across loading/error/not-found/ready states to prevent layout jump and enable deterministic tests."
  - "Lock ACT-01 metric hierarchy to distance, moving time, average pace, average heart rate, with elevation in a separate secondary section and map below headline metrics."
patterns-established:
  - "Detail state machine: loading | error | not-found | ready"
  - "State-specific components (skeleton/error/not-found) inside a shared stable page shell"
requirements-completed: [ACT-01, ACT-02]
duration: 14min
completed: 2026-03-21
---

# Phase 3 Plan 01: Activity Detail Route + State Foundation Summary

**Dedicated activity detail route with explicit resilient state machine and locked ACT-01 metric/map hierarchy shipped behind deterministic regression coverage.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-21T23:30:00Z
- **Completed:** 2026-03-21T23:44:26Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Added `/activity/:runId` route registration and dedicated `activity.tsx` page shell.
- Implemented `useActivityDetail` query boundary exposing `isLoading`, `isError`, `refetch`, and `activity | null` to drive explicit state branching.
- Added stable state wrappers and ACT-02 state components (`ActivityDetailSkeleton`, `ActivityDetailError`, `ActivityDetailNotFound`) with required test IDs.
- Implemented ACT-01 ready-state hierarchy: distance, moving time, average pace, average heart rate, secondary elevation section, and map block.
- Added route/state regression tests proving route render, shell stability, state coverage, metric order, HR placeholder copy, and map presence.

## Task Commits

1. **Task 1: Add dedicated `/activity/:runId` route with stable single-column shell and explicit state machine** - `6523f0c` (feat)
2. **Task 2: Render ACT-01 metric hierarchy and map block with HR placeholder behavior** - `5f73ee8` (test)
3. **Task 3: Finalize ACT-01/ACT-02 route and state regression coverage** - `d2a7b9b` (test)

## Files Created/Modified
- `frontend/src/main.tsx` - Registers `/activity/:runId` route.
- `frontend/src/pages/activity.tsx` - Detail page shell, explicit state machine, ACT-01 metric sections, and map block.
- `frontend/src/features/activity-detail/hooks/useActivityDetail.ts` - Error-capable React Query detail data boundary.
- `frontend/src/features/activity-detail/components/ActivityDetailSkeleton.tsx` - Structured loading skeleton state.
- `frontend/src/features/activity-detail/components/ActivityDetailNotFound.tsx` - Explicit not-found state with Back CTA.
- `frontend/src/features/activity-detail/components/ActivityDetailError.tsx` - Explicit error state with Retry + Back controls.
- `frontend/src/pages/activityDetail.route.test.tsx` - ACT-01 hierarchy/map route assertions.
- `frontend/src/pages/activityDetail.states.test.tsx` - ACT-02 loading/error/not-found stable shell assertions.

## Decisions Made
- Enforced explicit detail fetch state management through `useActivityDetail` so network failures are visible rather than silently falling back.
- Preserved stable shell wrappers (`activity-detail-shell`, `activity-detail-content-shell`, header wrapper) across all UI states for deterministic UX and testing.
- Kept Phase 3 scope strict: no adjacent-run controls, no HR zone analytics, no Phase 4 messaging.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ambiguous Back link assertions in state tests**
- **Found during:** Task 1 verification
- **Issue:** Both header and state panels contain “Back to Dashboard”; role query was non-unique and caused failing tests.
- **Fix:** Scoped not-found/error CTA assertions to state containers via test IDs/selectors.
- **Files modified:** `frontend/src/pages/activityDetail.states.test.tsx`
- **Verification:** `pnpm run test -- src/pages/activityDetail.states.test.tsx`
- **Committed in:** `6523f0c` (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** No scope creep; fix was required for deterministic ACT-02 verification.

## Issues Encountered
- None beyond the test selector ambiguity auto-fix above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Detail route/state foundation is complete and validated for ACT-01/ACT-02 requirements.
- Phase 03-02 can now focus on dashboard-to-detail navigation continuity/back behavior without reworking page state architecture.

## Self-Check: PASSED
