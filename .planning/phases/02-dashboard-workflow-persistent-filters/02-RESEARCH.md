# Phase 2: Dashboard Workflow & Persistent Filters - Research

**Researched:** 2026-03-21
**Domain:** React dashboard state orchestration, URL/localStorage persistence, shared filter model
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Filter Persistence Model
- URL query params are primary source of truth; localStorage is fallback.
- Deep links with URL filters always override saved localStorage filters.
- One global filter state applies across dashboard/detail views.
- Invalid or stale persisted values must be sanitized to safe defaults and rendering continues.

### KPI Card Set & Layout Density
- Primary KPI set: distance, duration, run count, average heart rate.
- Desktop layout: 4 compact cards in a single row.
- Mobile layout: wrap cards into 2 columns while keeping KPI order.
- Phase 2 KPI cards show values only (no delta/sparkline trend cues yet).

### Filter Defaults & Empty Results
- Default date range is All time.
- Baseline filter dimensions in phase 2: year, activity type, city/title buckets.
- “All time” means literal full dataset, not current-year alias.
- Zero-result states must show an explicit empty-state card while preserving current filter selections.

### Cross-View Sync Behavior
- Filter changes sync immediately via shared state plus URL update.
- If a filter excludes a currently focused single run, exit single-run focus and show the filtered set.
- Browser back/forward must replay exact historical filter state from URL.
- Filter orchestration lives in a centralized hook/store used by dashboard and detail surfaces.

### Claude's Discretion
- Exact naming and placement of URL query keys.
- Internal reducer/store implementation style for centralized filter orchestration.
- Final visual spacing/typography details for KPI card section within existing style system.

### Deferred Ideas (OUT OF SCOPE)
- KPI delta trends/sparklines and advanced trend analytics (future phase).
- Activity detail metric hierarchy redesign (Phase 3 scope).
- HR zone/trend UI methodology details (Phase 4 scope).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | User can view a modern dashboard with KPI cards for selected period (distance, duration, runs, average heart rate) | KPI cards should be computed from shared filtered dataset; use `Activity` shape from `frontend/src/utils/utils.ts` and analytics math consistent with existing data model. |
| DASH-02 | User can filter dashboard and detail views by date range and activity attributes using one shared filter model | Centralized filter state hook/store with reducer + selectors, consumed by dashboard (`index.tsx`) and detail-related pages/components. |
| DASH-03 | User filter selections persist across navigation/reload | URL query params as canonical state, localStorage fallback, deterministic hydration/sanitization and popstate replay. |
</phase_requirements>

## Summary

Phase 2 should be planned as a **state-orchestration phase**, not just a UI phase. The existing dashboard page (`frontend/src/pages/index.tsx`) currently owns filter state locally and mixes filtering, URL hash deep-link behavior, and map/table interactions. To satisfy DASH-02 and DASH-03 reliably, filter state needs to move into a centralized hook/store with deterministic serialization to URL query params and fallback persistence in localStorage.

The backend/API work from Phase 1 already provides what this phase needs for KPI math: stable activity fields and freshness metadata (`frontend/src/api/contracts/schema.d.ts`, `useActivities.ts`). No new API endpoint is strictly required for KPI cards because distance, duration, run count, and average heart rate can be computed from filtered activities client-side in selectors.

Validation is currently frontend-light (Vitest exists; backend tests are minimal and not relevant for dashboard filtering). Plan should include Wave 0 test scaffolding for filter serialization, hydration precedence (URL over localStorage), back/forward replay, and empty-state behavior to prevent regressions in cross-view sync.

**Primary recommendation:** Implement a `useDashboardFilters` + provider/reducer architecture with URL-first hydration, shared selectors, and explicit sanitizer functions before adding KPI UI polish.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 18.2.0 (installed) | UI composition + shared state/provider model | Already project baseline; supports reducer/context pattern cleanly. |
| react-router-dom | 6.15.0 (installed) | Navigation + location integration for query param persistence | Already used in app routing; avoids adding new routing/persistence library. |
| @tanstack/react-query | 5.91.3 (installed) | Server-state fetching for activity data | Existing data boundary in app root; keep filter state separate from server-state. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 3.2.4 (installed) | Filter-model unit/integration tests | Required for URL/localStorage precedence and replay tests. |
| @testing-library/react | 16.3.0 (installed) | Rendering + interaction tests for dashboard/filter UX | Use for cross-component filter sync and empty-state assertions. |
| recharts | 2.15.2 (installed) | Existing charting infra (not required for KPI cards) | Keep for future chart expansion; Phase 2 KPI cards are value-only. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React reducer/context for filters | Zustand/Jotai | Adds dependency; unnecessary for current scope and existing app complexity. |
| URLSearchParams + manual serializer | query-string | Cleaner API possible, but extra dependency for modest benefit. |

**Installation:**
```bash
# No new packages required for Phase 2 baseline.
```

**Version verification:** (npm registry checked 2026-03-21)
- `react@18.2.0` published 2022-06-14; latest now `19.2.4`
- `react-router-dom@6.15.0` published 2023-08-10; latest now `7.13.1`
- `@tanstack/react-query@5.91.3` published 2026-03-20; latest now `5.91.3`
- `recharts@2.15.2` published 2025-04-03; latest now `3.8.0`
- `vitest@3.2.4` published 2025-06-17; latest now `4.1.0`

## Architecture Patterns

### Recommended Project Structure
```text
frontend/src/
├── features/dashboard/
│   ├── filters/
│   │   ├── model.ts           # Filter types/defaults/sanitizers
│   │   ├── serialize.ts       # URL/localStorage encode/decode
│   │   ├── reducer.ts         # Centralized filter reducer/actions
│   │   └── useDashboardFilters.ts
│   ├── selectors/
│   │   ├── selectFilteredRuns.ts
│   │   └── selectKpis.ts
│   └── components/
│       ├── KpiCards.tsx
│       └── EmptyKpiState.tsx
└── pages/
    ├── index.tsx              # consume provider + selectors
    └── total.tsx              # hook into shared filter model as needed
```

### Pattern 1: URL-First Hydration with Fallback Persistence
**What:** On initial load, parse query params first; if absent, hydrate from localStorage; always sanitize before use.
**When to use:** App boot and route change hydration.
**Example:**
```typescript
// Source: project pattern from frontend/src/pages/index.tsx + Phase 2 context decisions
const initial = sanitizeFilters(
  hasUrlParams(window.location.search)
    ? decodeFromUrl(window.location.search)
    : decodeFromStorage(localStorage.getItem('dashboard.filters.v1'))
);
```

### Pattern 2: Derived Selectors for KPI + View Data
**What:** Keep raw activities immutable; derive filtered runs and KPI aggregates from shared filter state.
**When to use:** Every render path that needs filtered data (KPI cards, map, table).
**Example:**
```typescript
// Source: existing Activity model in frontend/src/utils/utils.ts
const kpis = useMemo(() => {
  const distance = filteredRuns.reduce((sum, r) => sum + r.distance, 0);
  const durationSec = filteredRuns.reduce((sum, r) => sum + convertMovingTime2Sec(r.moving_time), 0);
  const runCount = filteredRuns.length;
  const hrValues = filteredRuns.map(r => r.average_heartrate).filter((v): v is number => v != null);
  const avgHr = hrValues.length ? hrValues.reduce((a, b) => a + b, 0) / hrValues.length : null;
  return { distance, durationSec, runCount, avgHr };
}, [filteredRuns]);
```

### Pattern 3: Hash + Query Coexistence Contract
**What:** Keep existing single-run hash behavior (`#run_{id}`) while query params represent filters.
**When to use:** On filter changes and popstate/hashchange handling.
**Example:**
```typescript
// Source: existing hash logic in frontend/src/pages/index.tsx
// Filter update should only mutate search params; hash is preserved/cleared by focus rules.
const nextUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
window.history.pushState(null, '', nextUrl);
```

### Anti-Patterns to Avoid
- **Per-component filter state duplication:** Causes dashboard/detail drift and breaks DASH-02.
- **Unsanitized persisted state:** Breaks rendering on schema/key drift; violates locked decision.
- **Mixing server-state and UI-state in React Query cache:** Filter state is UI concern; keep in reducer/context.
- **Auto-resetting filters when no results:** Violates explicit empty-state requirement.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Query parsing/encoding | Manual string split/join parser | `URLSearchParams` | Native, predictable encoding, fewer edge-case bugs. |
| Time math | Ad-hoc duration parsing per component | `convertMovingTime2Sec` in `utils.ts` | Existing utility already handles current moving_time format. |
| KPI aggregation in components | Repeated map/reduce in UI leaves | Central selector utilities | One source of truth, easier testability. |
| Persisted schema migration | Implicit JSON shape assumptions | Versioned storage key + sanitizer | Handles stale/invalid persisted filters safely. |

**Key insight:** Most failure risk here is consistency and replay semantics, not rendering. Centralized model + serializer/sanitizer prevents rewrite-causing bugs.

## Common Pitfalls

### Pitfall 1: Query/Hash Collision
**What goes wrong:** Updating filters wipes `#run_{id}` or run focus logic wipes query params.
**Why it happens:** URL writes are done with partial strings rather than full URL composition.
**How to avoid:** Always update URL via a single helper that preserves or intentionally clears hash by rule.
**Warning signs:** Back button changes focus but not filters, or vice versa.

### Pitfall 2: Invalid Persisted Values Crash Filtering
**What goes wrong:** Unknown year/type/city/title from old localStorage or external deep links causes empty UI or runtime errors.
**Why it happens:** No sanitize pass against current activity-derived option sets.
**How to avoid:** Clamp/normalize unknown values to defaults (`All time`, `all`, empty buckets) before reducer initialization.
**Warning signs:** White screen or permanently empty dashboard after reload.

### Pitfall 3: Infinite URL Sync Loops
**What goes wrong:** state→URL effect triggers URL→state effect repeatedly.
**Why it happens:** Missing equality guard between current and next serialized state.
**How to avoid:** Compare serialized strings before push/replace.
**Warning signs:** Rapid history growth, repeated renders, sluggish UI.

### Pitfall 4: Cross-View Filter Drift
**What goes wrong:** `/` and `/summary` show different filters for same session.
**Why it happens:** Separate local state islands.
**How to avoid:** Shared provider at app/root route level and single hook consumption.
**Warning signs:** Switching pages resets selection unexpectedly.

## Code Examples

Verified patterns from repository sources:

### Shared filtered data pipeline
```typescript
// Source: frontend/src/pages/index.tsx (memoized filtering pattern)
const runs = useMemo(() => {
  return filterAndSortRuns(activities, currentFilter.item, currentFilter.func, sortDateFunc);
}, [activities, currentFilter.item, currentFilter.func]);
```

### Existing run focus URL hash contract
```typescript
// Source: frontend/src/pages/index.tsx (single run deep-link behavior)
const newHash = `#run_${runId}`;
if (window.location.hash !== newHash) {
  window.history.pushState(null, '', newHash);
}
```

### Typed API activity shape already supports KPI inputs
```typescript
// Source: frontend/src/api/contracts/schema.d.ts
type AnalyticsSummary = {
  average_heartrate?: number | null;
  total_activities: number;
  total_distance: number;
  total_moving_time_seconds: number;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static JSON-only consumption in UI | Typed API-first with fallback (`useActivities`) | Phase 1 (2026-03-21) | Safer data contracts; enables reliable KPI/filter logic planning. |
| Page-local filter callbacks (`changeYear/changeCity/changeTitle`) | Planned centralized filter store/hook | Phase 2 target | Enables DASH-02 shared behavior + DASH-03 persistence. |
| Hash-only deep-link behavior for run focus | Planned hash + query coexistence | Phase 2 target | Maintains run focus while enabling replayable filter history. |

**Deprecated/outdated:**
- Component-local duplicated filter logic for dashboard/detail synchronization.

## Open Questions

1. **Should “activity type” map to raw `type` values (`Run`, `walking`, `cycling`) or normalized labels?**
   - What we know: Data contains mixed-case/mixed taxonomy in `data/activities.json`.
   - What's unclear: Exact normalization contract for query keys and UI labels.
   - Recommendation: Define a canonical enum in filter model and map raw values via adapter.

2. **How much of `/summary` must participate in shared filter state during Phase 2?**
   - What we know: Requirement says dashboard + detail-related views, and `/summary` exists.
   - What's unclear: Whether `/summary` is in-scope “detail-related” for Phase 2 implementation.
   - Recommendation: Treat `/summary` as consumer of shared filter defaults at minimum; full parity can be scoped explicitly in PLAN tasks.

3. **Date range model granularity**
   - What we know: Locked default is “All time”; baseline filters include year.
   - What's unclear: Whether arbitrary start/end picker is required now or year-centric presets are sufficient.
   - Recommendation: Implement extensible date-range structure now (`mode: all|year|custom`) but ship `all` + `year` behavior in Phase 2.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + Testing Library (`@testing-library/react` 16.3.0) |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && npm test -- src/pages/index.freshness.test.tsx` |
| Full suite command | `cd frontend && npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | KPI cards render distance/duration/run count/avg HR for current filtered set | component/integration | `cd frontend && npm test -- src/features/dashboard/components/KpiCards.test.tsx` | ❌ Wave 0 |
| DASH-02 | One shared filter model drives dashboard + detail-related views | integration | `cd frontend && npm test -- src/features/dashboard/filters/sharedFilterModel.test.tsx` | ❌ Wave 0 |
| DASH-03 | URL-first persistence + localStorage fallback + reload/back-forward replay | integration | `cd frontend && npm test -- src/features/dashboard/filters/persistence.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `cd frontend && npm test -- src/features/dashboard/filters/*.test.ts`
- **Per wave merge:** `cd frontend && npm test`
- **Phase gate:** Full frontend suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `frontend/src/features/dashboard/filters/persistence.test.ts` — covers DASH-03 precedence/replay/sanitization
- [ ] `frontend/src/features/dashboard/filters/sharedFilterModel.test.tsx` — covers DASH-02 cross-view synchronization
- [ ] `frontend/src/features/dashboard/components/KpiCards.test.tsx` — covers DASH-01 KPI value rendering and empty state
- [ ] Optional shared test helpers: `frontend/src/test/urlState.ts` for consistent URL/history/localStorage mocking

## Sources

### Primary (HIGH confidence)
- Repository source: `frontend/src/pages/index.tsx` — current filter/hash orchestration and integration points
- Repository source: `frontend/src/hooks/useActivities.ts` — typed API-first + fallback data boundary
- Repository source: `frontend/src/utils/utils.ts` — activity model and filtering/time utilities
- Repository source: `frontend/src/api/contracts/schema.d.ts` — typed API fields available for KPI/filter logic
- Repository source: `.planning/phases/02-dashboard-workflow-persistent-filters/02-CONTEXT.md` — locked decisions and scope constraints
- npm registry commands (`npm view`, `npm ls`) executed locally for version and publish-date verification

### Secondary (MEDIUM confidence)
- https://reactrouter.com/ (query/search param patterns assumed but not re-fetched in this run)
- https://tanstack.com/query/latest (server-state separation guidance aligns with existing app use)

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified from repository lock/package manifests + npm registry checks.
- Architecture: MEDIUM - strongly grounded in current code + locked context, but external pattern docs were not re-fetched in-session.
- Pitfalls: MEDIUM - based on observed current URL/hash/filter coupling and common failure modes in this architecture.

**Research date:** 2026-03-21
**Valid until:** 2026-04-20
