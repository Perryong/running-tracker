# Architecture Research

**Domain:** Running tracker revamp (incremental UX + typed API + Garmin HR analytics)
**Researched:** 2026-03-21
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Frontend (React + Vite)                           │
├──────────────────────────────────────────────────────────────────────────────┤
│  New UX Surfaces                                                             │
│  ┌──────────────────────┐  ┌────────────────────────┐  ┌──────────────────┐ │
│  │ Dashboard v2         │  │ Activity Detail v2     │  │ HR Trends Panel  │ │
│  │ (cards + trends)     │  │ (metrics + zones)      │  │ (weekly/monthly) │ │
│  └─────────┬────────────┘  └───────────┬────────────┘  └─────────┬────────┘ │
│            │                            │                         │          │
│  ┌─────────┴────────────────────────────┴─────────────────────────┴────────┐ │
│  │ New Typed API Client + Query Hooks (feature-flagged per surface)        │ │
│  └───────────────────────────────┬──────────────────────────────────────────┘ │
├──────────────────────────────────┴────────────────────────────────────────────┤
│                         Backend API Layer (NEW)                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌────────────────────────┐  ┌──────────────────┐ │
│  │ Activities API       │  │ Analytics API          │  │ Contract Models  │ │
│  │ (list/detail)        │  │ (zones/trends)         │  │ (schema source)  │ │
│  └─────────┬────────────┘  └───────────┬────────────┘  └─────────┬────────┘ │
│            │                            │                         │          │
│  ┌─────────┴────────────────────────────┴─────────────────────────┴────────┐ │
│  │ Service Layer (NEW): activity_service + hr_analytics_service            │ │
│  └───────────────────────────────┬──────────────────────────────────────────┘ │
├──────────────────────────────────┴────────────────────────────────────────────┤
│                  Existing Data/Sync Pipeline (MODIFIED, not replaced)        │
├──────────────────────────────────────────────────────────────────────────────┤
│  CLI Sync (main.py) → Garmin Sync (garmin_sync.py) → FIT/GPX parse          │
│        ↓                                                                      │
│  SQLite activities table + data/activities.json + FIT files                  │
│        ↓                                                                      │
│  NEW: Derived analytics store/table(s) for zone/time-series rollups          │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `frontend/src/pages` + new dashboard/detail modules | Render UX surfaces and user interactions | Existing React routes + new page modules, progressively switched to API data |
| `frontend/src/api` (NEW) | Typed boundary to backend endpoints | Generated types + thin fetch client + query hooks |
| `backend/api` (NEW) | HTTP entrypoint and endpoint composition | FastAPI-style routers/controllers (or equivalent Python API module) |
| `backend/services/activity_service` (NEW) | Canonical read models for activity list/detail | Query SQLite + map to contract DTOs |
| `backend/services/hr_analytics_service` (NEW) | Compute/read HR zone breakdowns and trends | Read FIT-derived streams/metrics, produce precomputed aggregates |
| `backend/run_page/*` (MODIFIED) | Existing Garmin ingestion + raw normalization | Keep current CLI pipeline; add hooks for analytics backfill/materialization |
| `backend/run_page/generator/db.py` (MODIFIED) | Base activity persistence | Keep `activities`; add derived analytics tables (separate from base row) |

## Recommended Project Structure

```
frontend/src/
├── api/                          # NEW: typed client boundary
│   ├── contracts/                # generated API types from backend schema
│   ├── client.ts                 # fetch wrapper + error normalization
│   ├── activities.ts             # activity endpoints
│   └── analytics.ts              # HR endpoints
├── features/                     # NEW: domain slices for incremental UX
│   ├── dashboard/
│   ├── activity-detail/
│   └── heart-rate/
├── hooks/                        # existing hooks; gradually move data hooks to features/*
├── pages/                        # existing routes; migrate one route at a time
└── static/                       # legacy JSON/static artifacts (temporary compatibility)

backend/
├── api/                          # NEW: HTTP API entrypoint
│   ├── main.py
│   ├── routers/
│   │   ├── activities.py
│   │   └── analytics.py
│   └── schemas/                  # canonical request/response models
├── services/                     # NEW: domain services behind API
│   ├── activity_service.py
│   └── hr_analytics_service.py
├── repositories/                 # NEW: DB query boundary
│   ├── activity_repo.py
│   └── analytics_repo.py
├── run_page/                     # existing ingestion/generation pipeline
│   ├── garmin_sync.py            # MODIFIED: emit status + trigger derived recompute
│   ├── gpxtrackposter/
│   └── generator/
└── main.py                       # existing CLI entrypoint (unchanged contract)
```

### Structure Rationale

- **`frontend/src/api/`**: isolates contract changes and prevents API logic leaking into UI components.
- **`frontend/src/features/`**: allows shipping new UX surfaces independently without rewriting all current pages.
- **`backend/api/` + `services/` + `repositories/`**: enforces typed boundary and keeps ingestion scripts decoupled from read APIs.
- **Keep `backend/run_page/` intact**: protects existing sync workflow while adding analytics incrementally.

## Architectural Patterns

### Pattern 1: Strangler-Fig Data Access (Static JSON → Typed API)

**What:** Keep legacy `activities.json` path alive while adding new API-backed hooks per screen.
**When to use:** Incremental migration where current pages must keep working.
**Trade-offs:** Slight temporary duplication, but avoids all-at-once rewrite risk.

**Example:**
```typescript
// useActivitiesData.ts
export function useActivitiesData() {
  return useFeatureFlag('apiActivities')
    ? useActivitiesQuery()      // NEW typed API path
    : useLegacyStaticActivities(); // existing JSON import path
}
```

### Pattern 2: Derived Analytics Read Model

**What:** Compute HR zones/trends into dedicated derived tables, not in request path.
**When to use:** Analytics that are expensive or involve sample-level FIT data.
**Trade-offs:** Requires background recompute/backfill logic, but keeps UX fast and stable.

**Example:**
```python
# after sync completes for new activity_ids
for activity_id in new_activity_ids:
    samples = fit_repo.load_hr_samples(activity_id)
    zone_breakdown = zones.compute(samples, profile)
    analytics_repo.upsert_zone_breakdown(activity_id, zone_breakdown)
analytics_repo.refresh_trend_rollups()
```

### Pattern 3: Contract-First DTO Mapping

**What:** API response models are explicit contracts; services map DB/raw fields into DTOs.
**When to use:** Typed frontend/backend boundary with long-lived maintainability goals.
**Trade-offs:** Extra mapping code, but prevents raw schema leakage and drift.

## Data Flow

### Request Flow (New UX surface)

```
[User opens Dashboard v2]
    ↓
[React feature module]
    ↓
[Typed query hook]
    ↓
[Backend /api/v1/dashboard or /analytics/trends]
    ↓
[Service layer composes activity + HR rollups]
    ↓
[SQLite base tables + derived analytics tables]
    ↓
[DTO response]
    ↓
[Frontend renders cards/charts with loading/error states]
```

### Ingestion + Analytics Flow (Modified existing pipeline)

```
[Manual/Cron sync command: python backend/main.py sync-garmin --format fit]
    ↓
[run_page/garmin_sync.py downloads new FIT/GPX]
    ↓
[generator sync updates activities table + data/activities.json]
    ↓
[NEW analytics materializer parses FIT HR samples]
    ↓
[Derived tables updated: zone_breakdown, trend_points, refresh metadata]
    ↓
[API reads precomputed analytics for UX]
```

### Key Data Flows

1. **Legacy-compatible activity flow:** Garmin sync → SQLite activities + JSON snapshot → existing pages continue functioning.
2. **New typed UX flow:** Dashboard/detail pages → typed API client → contract DTOs from backend API.
3. **HR analytics flow:** FIT record messages → zone/trend derivation → cached/derived read models → charts.

## New vs Modified Components (Explicit)

| Status | Component | Why |
|--------|-----------|-----|
| **NEW** | `backend/api/*` | Needed to create typed frontend/backend boundary (currently no HTTP API layer in Python source). |
| **NEW** | `backend/services/hr_analytics_service.py` | Isolates HR zone/trend domain logic from sync scripts and API controllers. |
| **NEW** | `backend/repositories/analytics_repo.py` + derived tables | Supports fast dashboard reads and avoids on-demand heavy FIT computation. |
| **NEW** | `frontend/src/api/*` | Central typed contract client and query hooks for new UX surfaces. |
| **NEW** | `frontend/src/features/dashboard`, `activity-detail`, `heart-rate` | Enables incremental UX rollout with bounded domain modules. |
| **MODIFIED** | `backend/run_page/garmin_sync.py` | Add sync status + trigger/post-step for analytics materialization. |
| **MODIFIED** | `backend/run_page/gpxtrackposter/track.py` | Reuse/extend FIT parsing output for sample-level HR extraction provenance if needed. |
| **MODIFIED** | `backend/run_page/generator/db.py` | Keep existing `activities`; add migrations for derived analytics tables. |
| **MODIFIED** | `frontend/src/pages/index.tsx`, `total.tsx`, hooks | Migrate data reads from static JSON to typed API behind flags. |
| **UNCHANGED (initially)** | `backend/main.py` CLI contract | Preserve current operational workflow; avoid disruption during migration. |

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Garmin Connect | Existing authenticated sync via `garth`/`httpx` in CLI pipeline | Keep out of frontend; credentials remain backend-only. |
| Map providers (Mapbox/tiles) | Existing frontend map rendering | No architectural change required for typed API rollout. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Frontend UI ↔ Frontend API client | typed functions/hooks | UI never fetches raw endpoints directly. |
| Frontend API client ↔ Backend API | HTTP + versioned DTO schema | Contract drift controlled by generated types and DTO mapping. |
| Backend API ↔ Services | direct Python calls with typed models | Controllers stay thin. |
| Services ↔ Repositories | query methods (no raw SQL in controllers) | Keeps read/write logic testable. |
| Sync pipeline ↔ Analytics materializer | explicit post-sync invocation/event | Guarantees derived data freshness after new activity ingestion. |

## Build Order (Dependency-Aware, Incremental)

1. **Phase A: Typed boundary skeleton (no UX rewrite yet)**
   - Build `backend/api` with one parity endpoint (`GET /api/v1/activities`) mapped from current activity model.
   - Add frontend `src/api` client + generated contracts.
   - Keep pages on static JSON by default; add feature flag switch.

2. **Phase B: Activity read migration**
   - Migrate one existing surface (recommend `/summary` first) to API-backed data hooks.
   - Add endpoint for activity detail payload used by improved detail UX.
   - Verify parity vs existing static rendering before broader rollout.

3. **Phase C: HR analytics foundation**
   - Add derived analytics tables and `hr_analytics_service`.
   - Extend sync pipeline with analytics materialization/backfill command.
   - Expose `/api/v1/analytics/zones` + `/api/v1/analytics/trends`.

4. **Phase D: New UX surfaces**
   - Ship Dashboard v2 cards and trends panel on typed API.
   - Integrate activity detail v2 HR zone/time-in-zone sections.
   - Keep legacy components available until API reliability is proven.

5. **Phase E: Consolidation**
   - Remove static JSON dependency from migrated screens.
   - Retain JSON export only as offline artifact if still needed.
   - Harden tests for contracts + sync→analytics freshness.

## Anti-Patterns

### Anti-Pattern 1: “Direct FIT parsing inside request handlers”

**What people do:** Parse FIT files and compute zones on every dashboard request.  
**Why it's wrong:** Creates latency spikes and unstable UX.  
**Do this instead:** Precompute derived analytics after sync and serve read models.

### Anti-Pattern 2: “Frontend owns authoritative HR calculations”

**What people do:** Compute zones in charts/components from raw payloads.  
**Why it's wrong:** Inconsistent formulas and untestable drift across screens.  
**Do this instead:** Keep zone/trend logic in backend service; frontend only renders.

## Sources

- Internal project context: `.planning/PROJECT.md`
- Repository inspection:
  - `frontend/src/hooks/useActivities.ts` (static JSON ingestion in frontend)
  - `frontend/src/pages/index.tsx`, `frontend/src/components/ActivityList/index.tsx` (current UX/data coupling)
  - `backend/main.py` (CLI-first backend entrypoint; no web API currently)
  - `backend/run_page/garmin_sync.py` (Garmin fetch and summary extraction)
  - `backend/run_page/gpxtrackposter/track.py` (FIT parsing and HR-related fields)
  - `backend/run_page/generator/db.py` (activity persistence model)
  - `backend/run_page/config.py` (data location and pipeline outputs)

---
*Architecture research for: Running tracker revamp (incremental integration)*
*Researched: 2026-03-21*
