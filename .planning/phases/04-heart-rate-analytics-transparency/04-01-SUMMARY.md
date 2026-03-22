---
phase: 04-heart-rate-analytics-transparency
plan: 01
subsystem: api
tags: [fastapi, pydantic, openapi, contract-testing, heart-rate]
requires:
  - phase: 03-02
    provides: stable analytics endpoint and typed API pipeline
provides:
  - Explicit Wave-0 feasibility contract via `zone_time_basis` and estimated semantics
  - Mandatory HR methodology/provenance/confidence/coverage envelope in analytics summary
  - Regenerated backend OpenAPI and frontend generated API types for HR transparency fields
affects: [phase-04-hr-ui, analytics-contracts, frontend-api-typing]
tech-stack:
  added: []
  patterns:
    - Contract-first HR transparency metadata in summary payloads
    - Wave-0 feasibility encoded in schema fields instead of implicit assumptions
key-files:
  created:
    - backend/tests/api/test_analytics_hr_contract.py
    - .planning/phases/04-heart-rate-analytics-transparency/04-01-SUMMARY.md
  modified:
    - backend/api/schemas/analytics.py
    - backend/api/services/analytics_service.py
    - backend/tests/api/test_contracts.py
    - backend/api/openapi.json
    - frontend/src/api/contracts/schema.d.ts
    - frontend/src/api/types.ts
key-decisions:
  - "Wave-0 feasibility is explicit: zone time basis is declared as `estimated_from_average_hr` when only average HR exists, otherwise `unavailable` when no HR data exists."
  - "Methodology/provenance/confidence/coverage are mandatory contract fields on `summary.heart_rate` for trust messaging before UI implementation."
patterns-established:
  - "Expose fallback assumptions in API contracts (`max_hr_source`, `estimated`, `zone_time_basis`) instead of inferring in UI."
  - "Keep frontend API types generated from OpenAPI and export aliases from `frontend/src/api/types.ts`."
requirements-completed: [HR-03]
duration: 3min
completed: 2026-03-22
---

# Phase 4 Plan 01: Heart-Rate Analytics Transparency Contract Summary

**Analytics summary now ships a mandatory HR transparency envelope with explicit zone-time feasibility basis, provenance, confidence, and coverage fields generated end-to-end into frontend contract types.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-22T01:57:56Z
- **Completed:** 2026-03-22T02:00:41Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Added backend contract tests that enforce the Wave-0 trust surface for HR methodology/provenance/confidence/coverage.
- Extended backend analytics schema/service to emit `summary.heart_rate` with explicit `zone_time_basis`, `max_hr_source`, `estimated`, confidence, and coverage semantics.
- Regenerated OpenAPI and frontend generated schema types, then exported new HR contract aliases for downstream UI work.

## Task Commits

1. **Task 1: Add Wave-0 feasibility + transparency contract tests first** - `852253f` (test)
2. **Task 2: Extend backend analytics schemas/services with explicit Wave-0 feasibility outcome** - `b8f3fea` (feat)
3. **Task 3: Regenerate OpenAPI and frontend contract types for HR transparency fields** - `a4dbb4f` (chore)

## Files Created/Modified
- `backend/tests/api/test_analytics_hr_contract.py` - Contract tests for methodology/provenance/confidence/coverage and Wave-0 basis declaration.
- `backend/tests/api/test_contracts.py` - Analytics contract smoke test now requires `summary.heart_rate`.
- `backend/api/schemas/analytics.py` - Added typed HR envelope models (`HrMethodology`, `HrConfidence`, `HrCoverage`).
- `backend/api/services/analytics_service.py` - Builds HR coverage, methodology, and confidence with explicit fallback semantics.
- `backend/api/openapi.json` - Exported updated contract schemas for HR transparency.
- `frontend/src/api/contracts/schema.d.ts` - Regenerated OpenAPI-based frontend contracts including HR envelope types.
- `frontend/src/api/types.ts` - Added exported aliases for `ApiHrMethodology`, `ApiHrConfidence`, and `ApiHrCoverage`.

## Decisions Made
- Encoded feasibility truth directly in the API contract by declaring `zone_time_basis` rather than implying data quality from averages.
- Used `estimated_from_average_hr` plus medium/low confidence messaging when only aggregate HR exists, avoiding fabricated per-sample certainty.
- Kept scope to contract and type propagation only (no ingestion/data-model expansion), matching the Phase 4 plan boundary.

## Deviations from Plan
None - plan executed as written within Phase 4 Plan 04-01 scope.

## Issues Encountered
- `pytest-asyncio` emitted an existing deprecation warning for unset `asyncio_default_fixture_loop_scope`; non-blocking and out of scope for this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Frontend/UI plans can now consume trust metadata through generated types without hand-written interfaces.
- Wave-0 feasibility/trust contract is explicit and test-enforced, unblocking downstream HR visualization work.

## Self-Check: PASSED
- FOUND: backend/tests/api/test_analytics_hr_contract.py
- FOUND: backend/api/schemas/analytics.py
- FOUND: backend/api/services/analytics_service.py
- FOUND: backend/api/openapi.json
- FOUND: frontend/src/api/contracts/schema.d.ts
- FOUND: frontend/src/api/types.ts
- FOUND: .planning/phases/04-heart-rate-analytics-transparency/04-01-SUMMARY.md
- FOUND: commit 852253f
- FOUND: commit b8f3fea
- FOUND: commit a4dbb4f

