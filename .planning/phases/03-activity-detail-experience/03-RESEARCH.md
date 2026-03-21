# Phase 3: Activity Detail Experience - Research

**Researched:** 2026-03-21  
**Domain:** React route architecture, activity detail UX states, and deterministic navigation continuity  
**Confidence:** MEDIUM-HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Detail Entry & Layout
- Activity detail opens on a dedicated route: `/activity/:runId`.
- Detail page uses a single-column layout with metric sections stacked.
- Detail route preserves active shared filters in query params for continuity.
- No auto-scroll on load; page starts at top summary.

### Metric Hierarchy & Content
- Headline metric row order: distance, moving time, average pace, average heart rate.
- Elevation gain appears in a secondary metrics section below headline.
- If HR data is missing, show placeholder `—` and subtle helper text: "No HR data".
- Include a route map block below headline metrics in Phase 3.

### Loading, Empty, and Error States
- Use a structured skeleton layout matching final detail sections while loading.
- For valid-format run ID with no matching activity, show explicit "Activity not found" empty state.
- Empty state includes a "Back to Dashboard" CTA.
- On fetch/network failure, show inline error state with Retry button and Back to Dashboard link.
- Keep page structure stable (header/section spacing) across loading/empty/error states to minimize layout jump.

### Navigation & Back Behavior
- Back action returns users to dashboard with prior filters and scroll context when possible.
- If detail route is entered directly (no dashboard history), Back CTA falls back to dashboard route with current query filters.
- No next/previous run navigation controls in Phase 3 (deferred).
- Header uses Back link only (no breadcrumb) in Phase 3.

### Claude's Discretion
- URL key naming for detail route query preservation (must remain compatible with shared filter model).
- Internal state strategy for restoring dashboard scroll context.
- Exact skeleton visual tokens and spacing values consistent with current style system.

### Deferred Ideas (OUT OF SCOPE)
- Adjacent run previous/next controls.
- Full breadcrumb hierarchy.
- Heart-rate zone breakdown/trends/provenance messaging (Phase 4).
- Advanced split analysis and coaching overlays.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ACT-01 | User can open an activity detail view with clear metric hierarchy (headline stats, pace, elevation, average HR) | Dedicated `/activity/:runId` route + single-column detail composition + ordered KPI row + map block reuse strategy |
| ACT-02 | Activity detail view supports loading, empty, and error states without broken layout | Query-driven loading/error states + explicit not-found empty state + stable container/skeleton pattern + retry/back controls |
</phase_requirements>

## Summary

The current codebase already contains most primitives needed for Phase 3: shared URL/localStorage filters (`DashboardFiltersProvider`), stable metric rendering patterns (`KpiCards`, `EmptyKpiState`), and reusable route visualization (`TemplateMap`, `geoJsonForRuns`). The key gap is that detail interaction is currently hash-based single-run focus on `/` (`#run_{id}`), not a dedicated route.

Recommended implementation is to introduce a new page-level route (`/activity/:runId`) and reuse existing selector/utility stack instead of introducing new filtering/state models. Keep filter continuity by carrying the current query string unchanged. For deterministic back UX, use explicit navigation state (source + fallback path + optional scroll token), and fall back to `/?<current-filter-query>` when direct-entry history is absent.

For ACT-02, treat loading/empty/error as first-class, explicit states in the detail page container. Do not rely on implicit fallback behavior in `useActivities` (which currently swallows API failures and uses static JSON). Use explicit fetch status for detail retrieval so network failures can render retry/back controls predictably.

**Primary recommendation:** Implement `/activity/:runId` with query-preserving navigation + explicit status state machine (`loading | error | not-found | ready`) while reusing `geoJsonForRuns`, formatting utilities, and existing section styling patterns.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router-dom | 6.15.0 (project), latest registry 7.13.1 (modified 2026-03-21) | Route definition, param parsing, navigation state | Already wired in `main.tsx`; supports param routes + `navigate(-1)` + fallback navigation |
| @tanstack/react-query | 5.91.3 (project), latest registry 5.94.4 (modified 2026-03-21) | Async fetch state machine for loading/error/retry | Already provided at root via `QueryClientProvider`; ideal for ACT-02 state handling |
| vitest + @testing-library/react | vitest 3.2.4 / testing-library 16.3.0 in project (latest 4.1.0 / 16.3.2) | Component/integration test coverage | Existing phase-2 tests already follow this stack and data-testid conventions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Existing dashboard filter model (`serialize.ts`) | internal | Canonical query keys: `dateRange`, `year`, `activityType`, `city`, `title` | Always for query continuity; do not introduce route-specific aliases |
| `TemplateMap` + `geoJsonForRuns` | internal | Single-run map rendering + animation/replay | Detail map block under headline metrics |
| Utility formatters (`formatPace`, `formatRunTime`) | internal | Consistent metric formatting | Headline/secondary metric rows |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New detail-specific filter/query schema | Existing shared filter query keys | Shared keys avoid drift and preserve DASH-02/03 guarantees |
| Reusing `useActivities` fallback-only behavior | Explicit detail fetch status with retry | `useActivities` fallback hides network errors, conflicting with ACT-02 error UX |
| Reusing full `RunMap` component | `TemplateMap` for detail | `RunMap` has broader controls/state; `TemplateMap` is simpler and already proven in dashboard |

**Installation:**
```bash
# No new dependency required for recommended approach
```

**Version verification:** Verified through npm registry commands (`npm view ... version` and `npm view ... time.modified`) on 2026-03-21.

## Architecture Patterns

### Recommended Project Structure
```text
frontend/src/
├── pages/
│   ├── activity.tsx                  # /activity/:runId container + state machine
│   └── __tests__/activityDetail...   # route/state/back behavior tests
├── features/activity-detail/
│   ├── components/                   # back link, skeleton, error, not-found, metric blocks
│   └── hooks/                        # optional useActivityDetail query hook
└── components/
    └── RunTable/RunRow.tsx           # row click navigates to detail route (query-preserving)
```

### Pattern 1: Query-preserving route transition
**What:** Push to `/activity/:runId` while retaining shared filter query string unchanged.  
**When to use:** Any dashboard-to-detail transition.  
**Example:**
```typescript
// Source: repository pattern from useDashboardFilters serialize.ts + index.tsx history usage
const openDetail = (runId: number) => {
  navigate(
    {
      pathname: `/activity/${runId}`,
      search: location.search, // preserve dateRange/year/activityType/city/title
    },
    {
      state: {
        fromDashboard: true,
        fallbackTo: `/${location.search}`,
        dashboardScrollY: window.scrollY,
      },
    }
  );
};
```

### Pattern 2: Explicit detail state machine for ACT-02
**What:** Render one of `loading`, `error`, `not-found`, `ready` within stable shell.  
**When to use:** Initial load, retry, invalid/missing run case, successful fetch.  
**Example:**
```typescript
// Source: recommended from existing API client + ACT-02 constraints
if (isLoading) return <ActivityDetailSkeleton />;
if (isError) return <ActivityDetailError onRetry={refetch} onBack={handleBack} />;
if (!activity) return <ActivityDetailNotFound onBack={handleBack} />;
return <ActivityDetailContent activity={activity} />;
```

### Pattern 3: Deterministic back behavior with fallback
**What:** Prefer history back only for known dashboard-origin transitions, otherwise fallback to dashboard + query.  
**When to use:** Detail header/back CTA, error-state back CTA, not-found back CTA.  
**Example:**
```typescript
const handleBack = () => {
  if (location.state?.fromDashboard) {
    navigate(-1);
    return;
  }
  navigate({ pathname: '/', search: location.search });
};
```

### Anti-Patterns to Avoid
- **Hash-driven detail (`#run_123`) for Phase 3:** conflicts with locked dedicated route decision.
- **Mutating run arrays in detail workflow:** `RunTable` currently uses in-place `runs.sort(...)`; avoid carrying this into detail selection logic.
- **Implicit fallback-only fetch handling:** hides API failure, preventing explicit ACT-02 error state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Filter query serialization | New manual query key parser/encoder | Existing `serialize.ts` (`encodeFiltersToUrl`, `decodeFiltersFromUrl`) | Already tested for deterministic back/forward replay |
| Route map rendering | New SVG/map renderer for detail | `TemplateMap` + `geoJsonForRuns([activity])` | Existing animation + rendering path already in production page |
| Metric formatting | New pace/time conversion helpers | `formatPace`, `formatRunTime` in `utils.ts` | Avoid unit/format inconsistency with dashboard |
| Back fallback logic | Browser-history heuristics only (`history.length` checks) | Explicit `location.state.fromDashboard` + deterministic fallback URL | Removes ambiguous behavior across direct-entry/navigation types |

**Key insight:** The codebase already solved continuity and visualization primitives; Phase 3 should compose them, not replace them.

## Common Pitfalls

### Pitfall 1: Losing filter continuity on detail navigation
**What goes wrong:** Detail opens without `?dateRange=...&year=...` query; back flow loses context.  
**Why it happens:** Navigation to pathname only, ignoring `location.search`.  
**How to avoid:** Always navigate with `search: location.search`; keep shared filter keys unchanged.  
**Warning signs:** Dashboard filters reset after return, URL query disappears.

### Pitfall 2: Non-deterministic back action
**What goes wrong:** Back CTA sometimes exits app history or lands on unexpected route.  
**Why it happens:** Unconditional `navigate(-1)` without source state.  
**How to avoid:** Gate history-back with explicit `state.fromDashboard`; otherwise fallback to `/{search}`.  
**Warning signs:** Deep-link entry user cannot return to dashboard with filters.

### Pitfall 3: Error state never appears
**What goes wrong:** API failures silently render fallback activity data; ACT-02 unmet.  
**Why it happens:** Using current `useActivities` behavior for detail fetch path.  
**How to avoid:** Use explicit detail fetch status (query or dedicated hook) and render inline error with retry.
**Warning signs:** Turning off API still shows “normal” detail with no retry control.

### Pitfall 4: Layout jumping across states
**What goes wrong:** Loading/empty/error screens shift major blocks abruptly.  
**Why it happens:** Rendering different outer wrappers per state.  
**How to avoid:** Keep one stable page shell and swap only inner section content (same spacing/containers).  
**Warning signs:** CLS-like visual jump between skeleton and loaded view.

## Code Examples

Verified patterns from existing repository:

### Preserve query while updating URL
```typescript
// Source: frontend/src/features/dashboard/filters/serialize.ts
const nextSearch = encodeFiltersToUrl(filters);
const nextUrl = withUpdatedSearch(window.location.href, nextSearch);
window.history.pushState(null, '', nextUrl);
```

### Stable empty-state component pattern
```tsx
// Source: frontend/src/features/dashboard/components/EmptyKpiState.tsx
<section className="mb-6 rounded-md border border-dashed ...">
  <h2>No runs match your current filters.</h2>
  <p>Adjust ... while keeping your current filter context.</p>
</section>
```

### Detail map data reuse
```typescript
// Source: frontend/src/utils/utils.ts + frontend/src/components/RunMap/TemplateMap.tsx
const geoData = geoJsonForRuns([activity]);
<TemplateMap title={titleForRun(activity)} geoData={geoData} />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hash-based single-run focus on dashboard (`#run_{id}`) | Dedicated route `/activity/:runId` with query continuity | Phase 3 target | Cleaner deep-linking, explicit page semantics, easier testability |
| Implicit fallback data rendering for hook failures | Explicit loading/error/not-found state machine | Phase 3 target | Meets ACT-02 and improves resilience transparency |

**Deprecated/outdated (for Phase 3 detail entry):**
- Hash-only run focus as primary entry (`#run_`) for activity detail UX.

## Implementation Sequencing (Planner-Oriented)

1. **Route + page shell first**
   - Add `/activity/:runId` route in `main.tsx` using existing GA wrapper.
   - Create `pages/activity.tsx` with stable shell and back-link header.
2. **Navigation wiring from dashboard**
   - Update table row interaction (or callback path) to navigate to detail route with `location.search` preserved and dashboard source state.
3. **Detail data + state machine**
   - Implement explicit fetch/load/error/retry/not-found rendering and run lookup by `runId`.
4. **Metric hierarchy + map block**
   - Render headline order exactly: distance, moving time, avg pace, avg HR.
   - Secondary section: elevation gain; HR placeholder `—` + “No HR data” helper text.
   - Add `TemplateMap` block below headline.
5. **Back behavior hardening**
   - `fromDashboard -> navigate(-1)`, otherwise dashboard fallback with current query.
6. **Tests + verification**
   - Add route/navigation/state tests for ACT-01/ACT-02.

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Direct-entry back behavior inconsistent across browsers/history stacks | Medium | High | Use explicit source state and deterministic fallback route |
| Reusing `useActivities` hides network failures | High | High | Use explicit status-based fetch path for detail page |
| Existing row click selection behavior conflicts with new route navigation expectations | Medium | Medium | Phase in with explicit click target/action and tests for old-vs-new behavior |
| Query drift from custom detail params | Low | Medium | Restrict to existing filter keys and keep runId in path param only |

## Open Questions

1. **Should detail use a dedicated single-run endpoint in future?**
   - What we know: Current API surface in frontend consumes list endpoint (`/api/v1/activities`).
   - What's unclear: Whether backend will add `/activities/:id` for lighter detail fetch.
   - Recommendation: For Phase 3, use existing list contract to avoid backend scope creep; flag endpoint optimization for later.

2. **How should dashboard scroll restoration be implemented when returning?**
   - What we know: Decision requires restoring scroll context when possible.
   - What's unclear: Whether browser default history restoration is sufficient for all target browsers.
   - Recommendation: Capture `window.scrollY` in navigation state as optional fallback mechanism; verify manual behavior in QA.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + @testing-library/react 16.3.0 (project-pinned) |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `pnpm --dir frontend vitest run src/pages/activityDetail.route.test.tsx` |
| Full suite command | `pnpm --dir frontend test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ACT-01 | Clicking a run opens `/activity/:runId` and renders ordered metric hierarchy + map block | integration | `pnpm --dir frontend vitest run src/pages/activityDetail.route.test.tsx -t "opens detail route and metric hierarchy"` | ❌ Wave 0 |
| ACT-02 | Detail page shows stable loading, explicit not-found, and explicit error+retry states | component/integration | `pnpm --dir frontend vitest run src/pages/activityDetail.states.test.tsx` | ❌ Wave 0 |
| ACT-02 | Back CTA uses history when dashboard-origin, fallback otherwise with query continuity | integration | `pnpm --dir frontend vitest run src/pages/activityDetail.navigation.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm --dir frontend vitest run src/pages/activityDetail*.test.tsx`
- **Per wave merge:** `pnpm --dir frontend test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `frontend/src/pages/activityDetail.route.test.tsx` — route wiring + metric hierarchy coverage for ACT-01
- [ ] `frontend/src/pages/activityDetail.states.test.tsx` — loading/empty/error state matrix for ACT-02
- [ ] `frontend/src/pages/activityDetail.navigation.test.tsx` — deterministic back/fallback behavior
- [ ] Optional helper fixtures for detail-run builders (reduce duplication across tests)

## Sources

### Primary (HIGH confidence)
- Repository code:
  - `frontend/src/main.tsx` (route/provider composition)
  - `frontend/src/pages/index.tsx` (current hash focus/navigation behavior)
  - `frontend/src/features/dashboard/filters/useDashboardFilters.tsx`
  - `frontend/src/features/dashboard/filters/serialize.ts`
  - `frontend/src/features/dashboard/components/EmptyKpiState.tsx`
  - `frontend/src/components/RunMap/TemplateMap.tsx`
  - `frontend/src/utils/utils.ts`
  - `frontend/vitest.config.ts`
- npm registry metadata via `npm view` (executed 2026-03-21):
  - react-router-dom latest `7.13.1` (modified `2026-03-21T07:18:12.316Z`)
  - @tanstack/react-query latest `5.94.4` (modified `2026-03-21T14:46:58.637Z`)
  - vitest latest `4.1.0` (modified `2026-03-12T14:06:30.975Z`)
  - @testing-library/react latest `16.3.2` (modified `2026-01-19T10:59:08.691Z`)

### Secondary (MEDIUM confidence)
- Official package docs (not re-fetched in-tool during this run; semantics inferred from established usage in repo):
  - https://reactrouter.com/
  - https://tanstack.com/query/latest
  - https://vitest.dev/
  - https://testing-library.com/docs/react-testing-library/intro/

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — verified from repository lock choices and npm registry metadata
- Architecture: **MEDIUM-HIGH** — strongly grounded in existing code patterns; some behavior remains implementation-choice dependent
- Pitfalls: **MEDIUM-HIGH** — derived from concrete current code paths (hash flow, fallback fetch, navigation state)

**Research date:** 2026-03-21  
**Valid until:** 2026-04-20 (or until major router/data-fetch architecture changes)
