---
phase: 04-heart-rate-analytics-transparency
plan: 02
subsystem: ui
tags: [react, fastapi, heart-rate, analytics, transparency, testing]
requires:
  - phase: 04-01
    provides: HR transparency envelope contract/types and feasibility semantics
provides:
  - Per-run HR zone payload with ordered Z1→Z5 durations/percentages and per-run confidence metadata
  - Activity detail HR zone UI (stacked bar + table) with empty/sparse trust states and coverage details
  - Persistent methodology/provenance panel with Estimated zones badge behavior
affects: [phase-04-03, activity-detail, analytics-contracts]
tech-stack:
  added: []
  patterns:
    - Per-run HR transparency is rendered with explicit empty/low-confidence states rather than inferred certainty
    - Activity detail consumes typed analytics summary contract and resolves per-run row by run_id
key-files:
  created:
    - frontend/src/features/activity-detail/components/HeartRateZoneBreakdown.tsx
    - frontend/src/features/activity-detail/components/HeartRateMethodologyPanel.tsx
    - frontend/src/pages/activity.hrZones.test.tsx
    - frontend/src/components/hrMethodologyPanel.test.tsx
  modified:
    - backend/api/schemas/analytics.py
    - backend/api/services/analytics_service.py
    - backend/tests/api/test_analytics_hr_contract.py
    - frontend/src/pages/activity.tsx
    - frontend/src/api/analytics.ts
    - frontend/src/api/types.ts
    - frontend/src/api/contracts/schema.d.ts
    - backend/api/openapi.json
key-decisions:
  - "Per-run zone rows are always normalized to Z1→Z5 order in both backend payload and UI rendering path."
  - "Methodology/provenance stays visible in activity detail even when zone confidence is low, with explicit Estimated zones fallback signaling."
patterns-established:
  - "Trust-first HR rendering: explicit no-data/sparse states with analyzed duration and coverage badge."
  - "Per-run HR payload contracts are validated in backend tests before UI consumption."
requirements-completed: [HR-01, HR-03]
duration: 10min
completed: 2026-03-22
---

# Phase 4 Plan 02: Per-Run HR Transparency Summary

**Activity detail now ships per-run Z1→Z5 zone distribution with explicit confidence/coverage trust states and a persistent methodology/provenance panel including Estimated zones behavior.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-22T02:03:30Z
- **Completed:** 2026-03-22T02:13:50Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- Added failing-first frontend/backend tests for zone ordering, trust states (empty/sparse), and methodology disclosure behavior.
- Extended backend analytics contracts/service with per-run zone breakdown entries and per-run confidence/coverage fields.
- Integrated activity detail HR zone section (stacked bar + table) and persistent methodology panel with Estimated zones badge and coverage details.

## Task Commits

1. **Task 1: Write per-run HR zone and methodology disclosure tests (RED→GREEN)** - `acbc7ef` (test)
2. **Task 2: Implement per-run zone analytics payload assembly and typed fetch mapping** - `5fdb527` (feat)
3. **Task 3: Add activity detail per-run HR UI (stacked bar + table + methodology panel)** - `55a8076` (feat)

## Files Created/Modified
- `backend/api/schemas/analytics.py` - Added per-run HR analytics schema (`per_run` + zone entries).
- `backend/api/services/analytics_service.py` - Built per-run zone/time/coverage/confidence assembly with deterministic Z1→Z5 output.
- `backend/tests/api/test_analytics_hr_contract.py` - Added per-run contract and ordering assertions.
- `frontend/src/api/analytics.ts` - Added typed per-run analytics helper path.
- `frontend/src/api/types.ts` - Exported generated per-run analytics aliases.
- `frontend/src/api/contracts/schema.d.ts` - Regenerated to include new per-run schemas.
- `frontend/src/features/activity-detail/components/HeartRateZoneBreakdown.tsx` - Added stacked bar/table + empty/low-confidence states.
- `frontend/src/features/activity-detail/components/HeartRateMethodologyPanel.tsx` - Added persistent methodology/provenance panel with estimated badge.
- `frontend/src/pages/activity.tsx` - Wired per-run HR analytics section under core metrics.
- `frontend/src/pages/activity.hrZones.test.tsx` - Added integration tests for ready/empty/sparse behaviors and ordering.
- `frontend/src/components/hrMethodologyPanel.test.tsx` - Added methodology panel behavior tests.

## Decisions Made
- Kept scope to per-run HR detail only (no trend UI/filters), aligned with 04-02 boundaries.
- Rendered low-confidence and missing-HR states as explicit cards/messages with coverage details instead of hiding or fabricating values.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Activity detail tests failed after introducing React Query hook**
- **Found during:** Task 3 verification
- **Issue:** Existing activity detail tests do not provide `QueryClientProvider`, causing runtime failures.
- **Fix:** Switched activity-level HR summary fetch to local `useEffect` + typed API call while preserving plan behavior and tests.
- **Files modified:** `frontend/src/pages/activity.tsx`
- **Verification:** `pnpm run test -- src/pages/activity.hrZones.test.tsx src/components/hrMethodologyPanel.test.tsx src/pages/activityDetail.route.test.tsx src/pages/activityDetail.states.test.tsx`
- **Committed in:** `55a8076`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** No scope creep; fix was required to keep existing test baseline stable while delivering planned behavior.

## Issues Encountered
- Existing frontend build output artifacts in `frontend/dist/*` were dirty/untracked before execution and remained out of scope.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Per-run HR transparency surface is complete and contract-tested.
- Phase 04-03 can reuse the methodology/confidence patterns for weekly/monthly trend context.

## Self-Check: PASSED
- FOUND: .planning/phases/04-heart-rate-analytics-transparency/04-02-SUMMARY.md
- FOUND: commit acbc7ef
- FOUND: commit 5fdb527
- FOUND: commit 55a8076

