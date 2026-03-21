# Project Research Summary

**Project:** Running Tracker Revamp  
**Domain:** Single-user running analytics dashboard (Garmin-first)  
**Researched:** 2026-03-21  
**Confidence:** MEDIUM

## Executive Summary

This is a single-user running tracker modernization effort, not a net-new product build. The research converges on an incremental revamp: keep the existing React/Vite + Python foundation, introduce a typed HTTP API boundary, and deliver a dashboard/detail UX overhaul centered on trustworthy heart-rate analytics. The recommended implementation style is contract-first (Pydantic/OpenAPI → generated TypeScript types), with a gradual migration away from static JSON data paths so current functionality remains stable while new surfaces ship.

The strongest recommendation is to sequence work around dependencies rather than UI-first enthusiasm: establish typed contracts first, then harden Garmin ingestion and HR derivation, then ship new UX surfaces on top of precomputed analytics read models. This order directly reduces the two biggest failure modes identified across research: “typed-in-name-only” contract drift and misleading HR trends built from incomplete or ambiguous data.

Primary risks are data correctness (zone method ambiguity, timezone normalization, duplicate/partial sync) and perceived trust (stale/incomplete data presented as authoritative). Mitigation is explicit: idempotent sync, sample-level HR provenance, persisted zone-method metadata, DST/travel test coverage, and visible sync freshness/confidence signals in the UI.

## Key Findings

### Recommended Stack

Use FastAPI + Pydantic on the backend to formalize API contracts and OpenAPI generation, then generate frontend types (`openapi-typescript`) and consume data with TanStack Query. Keep DuckDB/SQLite analytical posture and precompute HR rollups instead of request-time computation.

**Core technologies:**
- **FastAPI (0.115+)**: HTTP API layer — rapid schema-driven endpoints and docs.
- **Pydantic (2.8+)**: canonical request/response contracts — prevents schema ambiguity.
- **openapi-typescript (7.x)**: generated TS contracts — eliminates frontend/backend drift.
- **TanStack Query (5.x)**: server-state handling for dashboard/trends — robust loading/caching/error behavior.
- **DuckDB (1.1+)**: analytical rollups for zones/trends — good fit for local, read-heavy aggregations.

Critical compatibility: FastAPI must be aligned with Pydantic v2 syntax; React Query 5 assumes React 18+; shadcn/Tailwind integration needs verification against current Tailwind v4 setup.

### Expected Features

The launch bar (P1) is clear: modern KPI dashboard + unified filters, redesigned activity detail, per-run HR zone breakdown, weekly/monthly HR trends, and sync freshness indicators. These are table-stakes for the stated milestone and should be treated as “definition of done” for v1.

**Must have (table stakes):**
- Dashboard KPI cards with persistent filter/navigation state
- Activity detail redesign with clear metric hierarchy
- Per-run HR zone breakdown (% + time in zone)
- HR trend analytics (weekly/monthly)
- Data freshness/sync health indicators

**Should have (competitive):**
- Rule-based HR insights feed
- Session auto-classification (recovery/easy/threshold/hard)
- Aerobic efficiency trend (pace at comparable HR band)

**Defer (v2+):**
- Multi-provider ingestion (Strava/Apple/etc.)
- Social/community features
- Generative AI coaching chat

### Architecture Approach

Adopt a strangler-style migration: preserve current CLI sync and legacy JSON compatibility while introducing `backend/api` + service/repository layers and `frontend/src/api` + feature modules. Compute HR zones/trends into derived tables/materialized read models after sync, and keep request handlers read-optimized. This enables incremental rollout via feature flags and avoids a brittle full rewrite.

**Major components:**
1. **Backend API + schemas (`backend/api`)** — versioned contract surface (`/api/v1`) for activities and analytics.
2. **Domain services + repositories (`backend/services`, `backend/repositories`)** — canonical mapping and analytics logic, decoupled from controllers.
3. **Analytics materializer (sync post-step)** — sample-level HR parsing and derived trend/zone rollups.
4. **Frontend typed client + query hooks (`frontend/src/api`)** — contract-safe data access.
5. **Frontend feature slices (`frontend/src/features/*`)** — dashboard/detail/heart-rate surfaces migrated incrementally.

### Critical Pitfalls

1. **Typed boundary drift** — Prevent with shared schema + generated types + runtime validation on ingress/egress.
2. **Using summary HR as analytics truth** — Use sample-level FIT HR as primary source; label provenance/confidence.
3. **Zone model ambiguity** — Choose and persist one v1 method with metadata and UI disclosure.
4. **Timezone/DST errors in trends** — Normalize UTC + local timezone fields and test DST/travel boundaries.
5. **Non-idempotent sync/duplicates** — Enforce unique source keys + deterministic upserts + reconciliation checks.

## Implications for Roadmap

Based on cross-file dependencies, the roadmap should be organized into five phases:

### Phase 1: Contract Baseline & API Skeleton
**Rationale:** Everything else depends on trustworthy contracts.  
**Delivers:** FastAPI entrypoint, versioned DTO schemas, OpenAPI generation, frontend type generation, one parity activities endpoint behind flag.  
**Addresses:** Typed API boundary requirement; starts migration safely.  
**Avoids:** Contract drift, secret leakage in early API rollout.

### Phase 2: Garmin Data Normalization & HR Pipeline Integrity
**Rationale:** HR features are only as good as data quality.  
**Delivers:** Idempotent sync semantics, sample-level HR extraction, explicit zone methodology metadata, timezone normalization, failure accounting/retries.  
**Addresses:** Per-run HR zone breakdown prerequisite and trustworthy trends foundation.  
**Avoids:** Misleading analytics, duplicate ingestion corruption, DST/trend inaccuracies.

### Phase 3: Derived Analytics Read Models & Endpoints
**Rationale:** Performance and stability require precomputed analytics before rich UI rollout.  
**Delivers:** Derived tables/materialized rollups, analytics service, `/analytics/zones` + `/analytics/trends` endpoints, contract/integration tests.  
**Uses:** DuckDB/SQLite analytical path, TanStack Query-ready payloads.  
**Implements:** Architecture pattern of read-optimized services.

### Phase 4: UX Revamp (Dashboard + Activity Detail)
**Rationale:** Ship user-visible wins once data and APIs are reliable.  
**Delivers:** Modern dashboard cards, unified filters, redesigned detail panel, HR trend/zone visualizations, freshness indicators with loading/error states.  
**Addresses:** All P1 experience goals from FEATURES.md.  
**Avoids:** UX regressions from heavy compute in render paths via precomputed APIs.

### Phase 5: Insight Layer & Stabilization
**Rationale:** Differentiators should build on validated baseline metrics.  
**Delivers:** Rule-based insight cards, optional session classification, perf hardening, removal of legacy JSON paths where migrated.  
**Addresses:** P2 differentiation without jeopardizing v1 trust.  
**Avoids:** Premature complexity and hard-to-debug inference behavior.

### Phase Ordering Rationale

- Contract-first prevents costly rework in frontend and analytics interfaces.
- Data integrity before charts prevents “polished but wrong” heart-rate insights.
- Precompute-first architecture avoids request-time FIT parsing and dashboard latency spikes.
- UX rollout after API/data hardening maximizes confidence and minimizes regression risk.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Zone methodology choices (max HR vs LTHR/reserve), Garmin sample completeness, and timezone edge-case validation strategy.
- **Phase 5:** Efficiency trend/statistical normalization design (pace-at-HR comparability assumptions).

Phases with standard patterns (can likely skip extra research-phase):
- **Phase 1:** FastAPI + OpenAPI + generated TS contract workflow is established.
- **Phase 3:** Derived read model/materialization pattern is standard for analytics dashboards.
- **Phase 4:** React dashboard UX patterns with TanStack Query + component library are well documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Strong ecosystem-fit recommendations and repo-aware integration points; exact package versions need implementation-time verification. |
| Features | MEDIUM-HIGH | Milestone-aligned and grounded in current project goals/components; some competitor context is directional. |
| Architecture | MEDIUM | Clear, dependency-aware incremental pattern based on existing codebase; operational details (migrations/materializer scheduling) still need design decisions. |
| Pitfalls | MEDIUM-HIGH | Risks are concrete and codebase-relevant; external corroboration was limited in this run. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Zone method finalization:** pick v1 physiological model and profile assumptions; define reprocessing policy when profile changes.
- **Data provenance model:** explicitly define how sample-derived vs summary-derived metrics are represented in contracts/UI.
- **Migration cutoff policy:** decide when each screen fully drops `activities.json` fallback.
- **Operational cadence:** define sync/materialization scheduling and alert thresholds for partial failures.
- **Security hardening specifics:** finalize auth posture for any sync/admin endpoints if exposed beyond local-only usage.

## Sources

### Primary (HIGH confidence)
- `.planning/PROJECT.md` — milestone scope, constraints, out-of-scope boundaries.
- `.planning/research/STACK.md` — recommended stack and compatibility notes.
- `.planning/research/FEATURES.md` — table stakes/differentiators/defer list and dependency map.
- `.planning/research/ARCHITECTURE.md` — system patterns, build order, boundary definitions.
- `.planning/research/PITFALLS.md` — failure modes, prevention tactics, phase mapping.
- Referenced repository files across research docs (frontend hooks/pages/static data, backend sync/parser/db/CLI modules).

### Secondary (MEDIUM confidence)
- Garmin support documentation on heart-rate zones (as cited in FEATURES.md) — domain context for zone expectations.

### Tertiary (LOW confidence)
- Directional competitor references (Strava/Garmin ecosystem comparisons) from FEATURES.md — useful for framing, not implementation authority.

---
*Research completed: 2026-03-21*  
*Ready for roadmap: yes*
