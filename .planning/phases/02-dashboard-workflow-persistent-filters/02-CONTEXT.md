# Phase 2: Dashboard Workflow & Persistent Filters - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a modern KPI dashboard experience and one shared persistent filter model across dashboard/detail-related views. This phase defines visible KPI card behavior, filter defaults, cross-view synchronization, and persistence rules. It does not add new analytics types beyond existing phase scope.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone Scope
- `.planning/ROADMAP.md` — Phase 2 goal, requirements, and success criteria.
- `.planning/REQUIREMENTS.md` — DASH-01, DASH-02, DASH-03 definitions.
- `.planning/PROJECT.md` — product constraints and single-user scope.

### Upstream Contracts (from Phase 1)
- `.planning/phases/01-typed-api-foundation/01-CONTEXT.md` — typed API and freshness metadata decisions.
- `.planning/phases/01-typed-api-foundation/01-VERIFICATION.md` — verified trust-signal/freshness wiring outcomes.

### Existing Implementation Anchors
- `frontend/src/pages/index.tsx` — current dashboard-like view and filter interactions.
- `frontend/src/hooks/useActivities.ts` — typed API-first activities hook + freshness exposure.
- `frontend/src/utils/utils.ts` — existing filter helper functions and run processing patterns.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/pages/index.tsx`: Existing map/table page already orchestrates year/city/title filter interactions and URL hash run focus.
- `frontend/src/hooks/useActivities.ts`: Central activity data boundary ready for global filter-state integration.
- Existing utility functions (`filterYearRuns`, `filterCityRuns`, `filterTitleRuns`, `filterAndSortRuns`) can be reused in unified filtering.

### Established Patterns
- Filtering is currently in-page state with callback handlers (`changeYear`, `changeCity`, `changeTitle`).
- Single-run deep-linking uses URL hash (`#run_{id}`) and history listeners.
- UI currently composes left-column controls and right-column map/table; new KPI cards should fit this composition without redesigning unrelated surfaces.

### Integration Points
- Introduce centralized filter orchestration hook/store and migrate page-level filter callbacks to it.
- Synchronize filter state <-> URL query params while preserving existing run-hash behavior contracts.
- Wire KPI card rendering to filtered run set derived from shared filter state.

</code_context>

<specifics>
## Specific Ideas

- Keep interactions immediate and deterministic (no delayed apply step).
- Preserve user intent through navigation/history by replaying URL states exactly.
- Treat empty results as a valid state with clear feedback rather than auto-resetting filters.

</specifics>

<deferred>
## Deferred Ideas

- KPI delta trends/sparklines and advanced trend analytics (future phase).
- Activity detail metric hierarchy redesign (Phase 3 scope).
- HR zone/trend UI methodology details (Phase 4 scope).

</deferred>

---

*Phase: 02-dashboard-workflow-persistent-filters*
*Context gathered: 2026-03-21*
