# Phase 4: heart-rate-analytics-transparency - Research

**Researched:** 2026-03-22  
**Domain:** Heart-rate analytics contract design, confidence signaling, and cross-view filter continuity  
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Zone Methodology & Provenance Disclosure
- Default zone methodology is a fixed 5-zone model based on percentage of max HR.
- Max HR source is user-configured value with sensible default fallback.
- UI must include a persistent Methodology panel showing formula, zone boundaries, and source tags.
- If using fallback/default inputs, show a visible **Estimated zones** badge with concise warning copy.

### Per-Run Zone Breakdown Presentation
- Per-run zone analytics use a stacked horizontal bar plus table, both showing time and percentage.
- Zone rows are ordered Z1 → Z5 (low to high intensity).
- Per-run zone section appears in activity detail page under core metrics.
- For partial HR sampling, show analyzed-duration total plus coverage percentage badge.

### Weekly/Monthly Trend Behavior
- Trend periods in scope: weekly and monthly only.
- Default trend metric: average HR by period with sample-count overlay.
- Trend analytics must obey shared filters already used across dashboard/detail contexts.
- Low-sample periods are rendered with a warning marker and low-confidence legend note.

### Missing/Low-Confidence HR Data Handling
- For runs with zero HR samples, show explicit empty-state card with reason and no fabricated values.
- For low-quality/sparse HR samples, render analytics with confidence warning and coverage metric.
- For periods with no qualifying runs after filters, show explicit no-data state while preserving filters.
- Methodology panel and confidence indicators appear in both per-run and trend contexts.

### Claude's Discretion
- Exact zone boundary percentages (while preserving fixed 5-zone model requirement).
- Threshold logic for low-confidence markers and sparse-sample warnings.
- Final visual treatment of methodology/confidence chips within existing style system.

### Deferred Ideas (OUT OF SCOPE)
- Rule-based coaching/insight cards (INS-01..03).
- Advanced physiology models (LTHR adaptation, HRV-based scoring).
- Next/previous activity browsing enhancements.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HR-01 | User can view per-run heart rate zone breakdown (time and percentage by zone) | New analytics contract sections for `run_zone_breakdown`; activity-detail insertion pattern under existing metric shell; explicit no-HR and low-coverage states |
| HR-02 | User can view weekly and monthly heart rate trend analytics based on Garmin-derived data | Reuse shared filter model (`useDashboardFilters` + `selectFilteredRuns`) to drive trend query inputs; define periodized trend schema with sample counts + confidence |
| HR-03 | Heart rate analytics clearly indicate zone methodology/provenance used for calculations | Add mandatory `methodology` metadata block in contract and render persistent panel + estimated/fallback badges in both per-run and trend views |
</phase_requirements>

## Summary

Phase 4 should be implemented as an **analytics contract expansion** (backend schemas + `/api/v1/analytics/summary` payload) plus **two frontend render surfaces**: (1) activity-detail per-run zone panel and (2) dashboard/summary trend panel that reuses the existing shared filter provider. The current data boundary only exposes `average_heartrate`; there is no per-sample HR series in `data/activities.json`, so zone/time computation cannot be accurately produced from current API payload alone.

The safest implementation path is to keep existing route/filter architecture intact: do not fork filtering logic. Build trend inputs from existing shared filter state and keep all HR transparency elements as first-class UI states (ready / no data / low confidence), mirroring the explicit state patterns already used in activity detail and freshness trust signals.

Primary delivery risk is data availability: repository-visible activity data currently lacks HR samples needed for time-in-zone calculations. This phase therefore needs an explicit backend strategy for HR sample sourcing (from Garmin-derived persisted data or a deterministic approximation path with mandatory “Estimated zones” signaling). Without this, HR-01 cannot be fulfilled with high confidence.

**Primary recommendation:** Extend analytics response with explicit HR analytics sub-objects (`run_zone_breakdown`, `trend`, `methodology`, `confidence`) and render them via existing activity/detail + shared-filter patterns, while explicitly signaling estimated/fallback calculations.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| FastAPI | 0.128.0 (installed) | Backend typed API + OpenAPI emission | Already powers `/api/v1`; phase needs schema-first contract extension |
| Pydantic | 2.12.3 (installed) | API response modeling/validation | Existing schemas use Pydantic models; easiest way to enforce HR contract shape |
| React + TypeScript | React 18.2.0, TS 5.2.2 (package) | UI rendering + strict contract consumption | Current frontend baseline and test suite assumes this stack |
| @tanstack/react-query | 5.91.3 (package) | Data-fetch caching for detail/trend analytics | Already used in activity detail hook; good fit for new analytics hook(s) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-router-dom | 6.15.0 (package) | Route/query continuity for dashboard/detail flows | Preserve query-based filter continuity and back behavior |
| recharts | 2.15.2 (package) | Weekly/monthly trend chart rendering | Trend chart with sample-count overlays and confidence markers |
| vitest + @testing-library/react | 3.2.4 / 16.3.0 (package) | Frontend contract/render tests | State rendering and filter continuity regression coverage |
| pytest + fastapi.testclient | 8.3.5 / bundled | Backend contract tests | Validate new response keys and freshness/confidence invariants |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Extending `/analytics/summary` | New HR-specific endpoint(s) | Cleaner separation, but introduces extra client orchestration and duplicate freshness plumbing |
| Recharts trend + custom zone bar | All-chart approach in recharts | More chart consistency, but tabular zone detail still needed for exact percentages/time |
| Shared filters reuse | HR-local filter state | Faster isolated implementation, but breaks DASH-02/DASH-03 continuity guarantees |

**Installation:**
```bash
# no new mandatory packages required for baseline Phase 4 implementation
```

**Version verification:**
- Frontend registry check (npm):  
  - `@tanstack/react-query` latest `5.94.5` (published 2026-03-21)  
  - `react-router-dom` latest `7.13.1` (published 2026-02-23)  
  - `recharts` latest `3.8.0` (published 2026-03-06)  
  - `vitest` latest `4.1.0` (published 2026-03-12)  
  - `openapi-typescript` latest `7.13.0` (published 2026-02-11)
- Backend registry check (PyPI):  
  - `fastapi` latest `0.135.1` (published 2026-03-01), installed `0.128.0`  
  - `pydantic` latest `2.12.5` (published 2025-11-26), installed `2.12.3`  
  - `pytest` latest `9.0.2` (published 2025-12-06), installed `8.3.5`

Recommendation: **do not combine framework major/minor upgrades with Phase 4 scope**; use current project versions for delivery stability.

## Architecture Patterns

### Recommended Project Structure
```text
backend/
└── api/
    ├── schemas/
    │   └── analytics.py                # add HR analytics models
    ├── services/
    │   └── analytics_service.py        # build zone/trend/methodology payloads
    └── routers/
        └── analytics.py                # keep single summary endpoint (expanded response)

frontend/src/
├── api/
│   ├── analytics.ts                    # add typed HR analytics fetch helper(s)
│   └── types.ts                        # map new OpenAPI schemas
├── features/
│   ├── activity-detail/
│   │   ├── components/
│   │   │   └── HeartRateZoneBreakdown.tsx
│   │   └── hooks/
│   │       └── useActivityDetail.ts    # compose activity + per-run HR analytics
│   └── dashboard/
│       └── components/
│           └── HeartRateTrendPanel.tsx # weekly/monthly trend UI
└── pages/
    ├── activity.tsx                    # insert per-run section under core metrics
    └── index.tsx|total.tsx             # place trend panel where filters already exist
```

### Pattern 1: Contract-first expansion with mandatory transparency metadata
**What:** Extend `AnalyticsSummaryResponse` with nested HR objects that always include methodology + confidence context.  
**When to use:** Every HR analytic result (per-run and trend), including empty/partial states.  
**Example:**
```typescript
// Source: project contract pattern in frontend/src/api/contracts/schema.d.ts + backend/api/schemas/analytics.py
interface HrMethodology {
  model: 'max_hr_percentage_5_zone';
  max_hr_source: 'user_configured' | 'default_fallback';
  max_hr_value: number;
  estimated: boolean;
  zone_boundaries_pct: { z1: [number, number]; z2: [number, number]; z3: [number, number]; z4: [number, number]; z5: [number, number] };
}
```

### Pattern 2: Shared-filter continuity for trend analytics
**What:** Build trend request inputs from the existing `DashboardFiltersProvider` state rather than creating HR-local filters.  
**When to use:** Weekly/monthly trend panels in dashboard/summary contexts and any deep-link navigation to trend states.  
**Example:**
```typescript
// Source: frontend/src/features/dashboard/filters/useDashboardFilters.tsx
const { filters } = useDashboardFilters();
const runs = selectFilteredRuns(activities, filters);
// trend query keys should include normalized shared filters
```

### Pattern 3: Explicit state shells for trust-sensitive analytics
**What:** Render loading/error/empty/low-confidence states as explicit cards, not silent nulls.  
**When to use:** Per-run no-HR, sparse sampling, and no-period-data outcomes.  
**Example:**
```tsx
// Source: frontend/src/pages/activity.tsx and ActivityDetail* components
{state === 'error' && <ActivityDetailError onBack={handleBack} onRetry={() => void refetch()} />}
{state === 'not-found' && <ActivityDetailNotFound onBack={handleBack} />}
```

### Anti-Patterns to Avoid
- **Duplicating filter logic for HR trends:** causes drift from existing dashboard/summary behavior.
- **Computing zones from `average_heartrate` only:** cannot produce trustworthy time-in-zone; violates transparency intent.
- **Hiding fallback assumptions:** if max HR/defaults are inferred, output must expose `estimated`/source badges.
- **Embedding methodology copy separately in each widget:** centralize one shared methodology component per context.

## Sequencing (Planner-ready)

1. **Wave 0 – Contract + data viability**
   - Confirm HR sample availability path (source of time-in-zone truth).
   - Extend backend schema models and OpenAPI.
   - Regenerate frontend API types.
2. **Wave 1 – Backend analytics construction**
   - Implement per-run zone breakdown + confidence + methodology metadata.
   - Implement weekly/monthly trend aggregates with sample counts and low-confidence marker fields.
   - Add backend contract tests.
3. **Wave 2 – Activity detail integration**
   - Add per-run zone section under existing core metric block.
   - Handle no-HR / sparse-HR / estimated-zone badges.
4. **Wave 3 – Trend panel integration + filter continuity**
   - Add trend panel in existing filter-scoped page.
   - Ensure query keys and rendering reflect shared filters without divergence.
5. **Wave 4 – Regression + trust messaging polish**
   - End-to-end validation of continuity, confidence copy, and methodology panel persistence.

## Don’t Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-view filter sync | Custom URL parser for HR pages | Existing `DashboardFiltersProvider` + serialize/hydrate utilities | Already handles URL/localStorage/popstate deterministically |
| API typing | Manual TS interfaces for new HR responses | OpenAPI-generated `schema.d.ts` + `frontend/src/api/types.ts` mapping | Prevents schema drift and keeps API-01 guarantees |
| Async loading states | Ad-hoc booleans scattered in components | Established activity detail state shell pattern | Keeps UI stable across loading/error/empty transitions |
| Confidence messaging rules | Per-component if/else text fragments | Shared confidence/methodology presentation model | Ensures consistent trust language across per-run and trend views |

**Key insight:** Reuse existing typed boundary + filter infrastructure; hand-rolled parallel paths will break continuity and trust guarantees.

## Common Pitfalls

### Pitfall 1: No source for per-run time-in-zone
**What goes wrong:** Backend can only access `average_heartrate`, so zone time breakdown is fabricated or impossible.  
**Why it happens:** Current `data/activities.json` and `api.schemas.activity.Activity` contain no HR time series.  
**How to avoid:** Gate implementation with explicit HR-sample source decision; expose estimated/fallback explicitly when used.  
**Warning signs:** Zone percentages always mirror average HR bucket or look unnaturally uniform.

### Pitfall 2: Filter drift between trend panel and existing pages
**What goes wrong:** HR trends show counts/periods that don’t match dashboard or summary after same filters.  
**Why it happens:** Separate filtering logic or inconsistent type normalization (`Run` vs `running`).  
**How to avoid:** Reuse `selectFilteredRuns` normalization and shared filter state.  
**Warning signs:** Same URL query yields different run counts across panels.

### Pitfall 3: Hidden confidence degradation
**What goes wrong:** Users see precise numbers with no signal that data coverage is partial or estimated.  
**Why it happens:** Confidence modeled only internally, not in API/UI.  
**How to avoid:** Include coverage/confidence fields in contract and mandatory visual badges/legend notes.  
**Warning signs:** No visible difference between full and sparse-sample runs.

### Pitfall 4: Contract changes without regenerated frontend types
**What goes wrong:** Frontend compiles against stale contract assumptions.  
**Why it happens:** Skipping `generate:api-types` after backend schema update.  
**How to avoid:** Make schema generation part of backend contract change task definition.  
**Warning signs:** Runtime undefined fields for newly-added analytics keys.

## Code Examples

Verified patterns from existing project sources:

### Shared filter reuse for dataset shaping
```typescript
// Source: frontend/src/features/dashboard/selectors/selectFilteredRuns.ts
export const selectFilteredRuns = (
  activities: Activity[],
  filters: DashboardFilters
): Activity[] => {
  return activities
    .filter((run) => matchesDateRange(run, filters.dateRange))
    .filter((run) => matchesYear(run, filters.year))
    .filter((run) => matchesActivityType(run, filters.activityType))
    .filter((run) => matchesCity(run, filters.city))
    .filter((run) => matchesTitle(run, filters.title))
    .sort(sortDateFunc);
};
```

### Explicit state-shell rendering in activity detail
```tsx
// Source: frontend/src/pages/activity.tsx
if (isLoading) state = 'loading';
else if (isError) state = 'error';
else if (!activity) state = 'not-found';
```

### Backend summary assembly pattern (extend this, don’t replace)
```python
# Source: backend/api/services/analytics_service.py
def get_analytics_summary_data() -> tuple[FreshnessMetadata, AnalyticsSummary]:
    freshness, activities = get_activities_data()
    summary = build_summary(activities)
    return freshness, summary
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Untyped/ad-hoc API assumptions | OpenAPI-generated frontend types + Pydantic response models | Phase 1 (2026-03-21) | HR analytics should ship via typed contracts, not ad-hoc JSON |
| Per-view filter behavior drift | Shared provider with URL/localStorage/popstate sync | Phase 2 (2026-03-21) | HR trends must reuse same filter model |
| Ambiguous loading/error in detail context | Explicit loading/error/not-found state components | Phase 3 (2026-03-21) | HR sub-panels should follow same explicit state strategy |

**Deprecated/outdated:**
- Analytics limited to aggregate average HR only (`AnalyticsSummary.average_heartrate`) is insufficient for Phase 4 goals.

## Open Questions

1. **What is the canonical HR sample source for time-in-zone per run?**
   - What we know: API-visible activity payload currently includes only `average_heartrate`.
   - What's unclear: Whether backend has persisted per-point HR traces accessible for analytics services.
   - Recommendation: Resolve as a Wave 0 blocker; if unavailable, define deterministic estimated method + explicit confidence downgrade.

2. **Where should user-configured max HR live for API consumption?**
   - What we know: Requirement mandates user-configured with fallback.
   - What's unclear: Existing user settings persistence surface is not visible in current API/routes.
   - Recommendation: Add a minimal configuration source with explicit provenance enum in response.

3. **Trend panel placement (`/` vs `/summary`)**
   - What we know: both routes already consume shared filters.
   - What's unclear: product-preferred placement for weekly/monthly HR trend.
   - Recommendation: place where KPI context already exists (dashboard-first), then mirror in summary only if needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Backend: pytest 8.3.5 + FastAPI TestClient; Frontend: Vitest 3.2.4 + Testing Library |
| Config file | `backend/pytest.ini`, `frontend/vitest.config.ts` |
| Quick run command | `cd backend && pytest tests/api/test_contracts.py -q` and `cd frontend && npm run test -- activityDetail.route.test.tsx` |
| Full suite command | `cd backend && pytest -q` and `cd frontend && npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HR-01 | Per-run zone breakdown includes zone time + percent + coverage badges/states | backend contract + frontend component | `cd backend && pytest tests/api/test_contracts.py -q` + `cd frontend && npm run test -- activity.hrZones.test.tsx` | ❌ Wave 0 (frontend test file) |
| HR-02 | Weekly/monthly trends follow shared filters and show sample-count/confidence markers | frontend integration + backend contract | `cd frontend && npm run test -- pages/hrTrend.sharedFilters.test.tsx` + `cd backend && pytest tests/api/test_contracts.py -q` | ❌ Wave 0 (new tests) |
| HR-03 | Methodology/provenance metadata always present and rendered in both contexts | backend schema/contract + frontend render | `cd backend && pytest tests/api/test_contracts.py -q` + `cd frontend && npm run test -- components/hrMethodologyPanel.test.tsx` | ❌ Wave 0 (new tests) |

### Sampling Rate
- **Per task commit:** targeted backend/ frontend quick tests above
- **Per wave merge:** full backend + frontend suites
- **Phase gate:** full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `backend/tests/api/test_analytics_hr_contract.py` — verifies new HR analytics response shape, confidence fields, and methodology presence
- [ ] `frontend/src/pages/activity.hrZones.test.tsx` — verifies per-run zone card states (ready/empty/sparse)
- [ ] `frontend/src/pages/hrTrend.sharedFilters.test.tsx` — verifies trend data continuity under shared filters
- [ ] `frontend/src/components/hrMethodologyPanel.test.tsx` — verifies provenance + estimated badge rendering
- [ ] Optional shared test fixtures for deterministic HR coverage scenarios

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing per-point HR data | Blocks truthful zone-time analytics | Wave 0 data-source validation + explicit fallback modeling |
| Contract growth causes frontend breakage | Runtime rendering failures | Contract-first development + immediate OpenAPI type regeneration |
| Confidence thresholds tuned too strict/loose | User trust erosion | Start with explicit numeric thresholds in contract, then calibrate with fixture data |
| Duplicate trend filtering logic | Inconsistent user experience | Hard requirement: all trend shaping passes through shared filter model |

## Sources

### Primary (HIGH confidence)
- Project sources (current implementation anchors):
  - `backend/api/schemas/analytics.py`
  - `backend/api/services/analytics_service.py`
  - `backend/api/routers/analytics.py`
  - `frontend/src/pages/activity.tsx`
  - `frontend/src/features/activity-detail/hooks/useActivityDetail.ts`
  - `frontend/src/features/dashboard/filters/useDashboardFilters.tsx`
  - `frontend/src/features/dashboard/selectors/selectFilteredRuns.ts`
  - `frontend/src/api/contracts/schema.d.ts`
  - `frontend/src/components/FreshnessTrustSignal.tsx`
- Package registry verification:
  - https://www.npmjs.com/package/@tanstack/react-query
  - https://www.npmjs.com/package/react-router-dom
  - https://www.npmjs.com/package/recharts
  - https://www.npmjs.com/package/vitest
  - https://www.npmjs.com/package/openapi-typescript
  - https://pypi.org/project/fastapi/
  - https://pypi.org/project/pydantic/
  - https://pypi.org/project/pytest/
  - https://pypi.org/project/httpx/

### Secondary (MEDIUM confidence)
- Garmin-derived ingestion internals indicating HR extraction capability:
  - `backend/run_page/gpxtrackposter/track.py`
  - `backend/run_page/generator/db.py`

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — based on current repo manifests + direct npm/PyPI version verification
- Architecture: **MEDIUM** — strong reuse patterns in repo; medium due to unresolved HR-sample source
- Pitfalls: **MEDIUM** — directly observed contract/data gaps, but real data availability path still needs confirmation

**Research date:** 2026-03-22  
**Valid until:** 2026-04-21 (30 days; revalidate if data model changes sooner)
