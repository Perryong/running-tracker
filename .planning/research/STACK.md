# Stack Research

**Domain:** Running tracker revamp (dashboard UX + typed API boundary + HR analytics)
**Researched:** 2026-03-21
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **FastAPI** | 0.115+ | Add a real HTTP API layer to the existing Python backend | Fast, batteries-included request validation/docs, and works naturally with typed models for a clean frontend/backend contract. |
| **Pydantic** | 2.8+ | Canonical request/response schemas for API contracts | Makes typed boundary explicit in Python and can drive OpenAPI schema generation used by frontend codegen. |
| **openapi-typescript** (frontend) | 7.x | Generate TypeScript types from backend OpenAPI spec | Prevents drift between frontend models and backend responses; removes hand-written API interfaces. |
| **TanStack Query** | 5.x | Server-state caching/loading/error handling in dashboard pages | Best fit for data-heavy dashboard UX (filters, refreshes, trends) without custom fetch-state plumbing. |
| **DuckDB** (keep existing) | 1.1+ | Heart-rate zone/trend aggregation over activity + time-series data | Already present in stack; excellent for analytical queries and trend rollups with minimal infra overhead. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Zod** | 3.23+ | Runtime validation for frontend request params and URL/query state | Use at browser boundaries (search params, optional API responses, feature flags) even with generated TS types. |
| **shadcn/ui + Radix UI primitives** | latest generator output | Accessible, modern dashboard components (cards, tabs, command palette, sheet, dialog) | Use for revamp UI shell/navigation instead of building primitives from scratch. |
| **React Hook Form** | 7.x | Filter/forms UX (date ranges, HR zone presets) with good performance | Use where dashboard has multi-field filter controls or settings forms. |
| **date-fns** | 3.x | Time-window and rolling trend calculations in frontend display layer | Use for presentation logic (weekly/monthly buckets, labels); keep heavy aggregations in backend SQL/Python. |
| **pytest + httpx + pytest-asyncio** | pytest 8.x | API contract/integration tests for new FastAPI endpoints | Use to lock API schema behavior and avoid frontend breakage as analytics evolve. |
| **Pandera** (optional) | 0.20+ | Dataframe/analytics schema validation in HR pipeline | Use if analytics transforms become complex and need explicit invariants (zone sums, missing HR handling). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **orval** (or keep openapi-typescript + lightweight fetch wrapper) | Generate typed API client from OpenAPI | Prefer this if you want hooks/client generation in one step; otherwise keep codegen minimal with openapi-typescript only. |
| **Ruff** | Python lint/format | Add for fast backend code quality checks as API module grows. |
| **mypy (incremental adoption)** | Static typing for Python API/analytics modules | Start in strict mode only for new API/analytics packages; do not gate legacy ingestion code initially. |

## Installation

```bash
# Frontend runtime additions
cd frontend
npm install @tanstack/react-query zod react-hook-form date-fns

# Frontend typed API generation (pick one path)
npm install -D openapi-typescript
# OR
npm install -D orval

# Backend API + testing additions
cd ../backend
pip install "fastapi>=0.115" "uvicorn[standard]>=0.30" "pydantic>=2.8"
pip install -D "pytest>=8" "pytest-asyncio>=0.23" "httpx>=0.27"

# Optional analytics schema validation + typing
pip install "pandera>=0.20" "mypy>=1.10" "ruff>=0.6"
```

## Integration Plan (Additions to Existing Stack)

1. **Backend:** add `backend/api/` module (FastAPI app) without replacing existing Garmin sync CLI.
   - Keep `main.py` CLI for ingestion/generation workflows.
   - Add API entrypoint (e.g., `backend/api/main.py`) for dashboard data serving.
2. **Contract:** define Pydantic response models for:
   - `ActivitySummary`
   - `HeartRateZoneBreakdown`
   - `HeartRateTrendPoint` (weekly/monthly)
3. **Schema pipeline:** expose `/openapi.json` from backend and generate frontend types in CI (`npm run generate:api-types`).
4. **Frontend data layer:** introduce a small `src/api/` client + TanStack Query hooks (`useDashboardSummary`, `useHeartRateTrends`).
5. **Analytics path:** keep raw ingest as-is; add DuckDB queries/materialized views for zone/trend rollups consumed by API endpoints.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| FastAPI + Pydantic + OpenAPI codegen | Flask + marshmallow + hand-written TS types | Only if you need minimal dependency change and accept weaker schema-driven contracts. |
| TanStack Query | Redux Toolkit Query | Use RTK Query if app already uses Redux globally (not currently the case). |
| DuckDB analytics | Pandas-only aggregation | Use pandas-only only for small, one-off calculations; trends/rollups are cleaner and more maintainable in SQL. |

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **GraphQL layer** | Adds schema/server complexity for a single-user, known-query dashboard; low ROI here. | REST + OpenAPI typed contracts. |
| **Microservices split** | Premature operational overhead for one-user app and small domain. | Keep monolithic Python backend with clear modules. |
| **Kafka/Celery event architecture** | Unnecessary async infra for periodic Garmin sync + read-heavy dashboard. | Cron/manual sync + in-process jobs. |
| **Heavy global state (Redux) for server data** | Duplicates caching/retry/loading concerns TanStack Query already solves better. | TanStack Query + local component state. |

## Stack Patterns by Variant

**If dashboard remains mostly read-only with occasional refresh:**
- Use FastAPI + TanStack Query default stale-while-revalidate
- Because complexity stays low and UX remains responsive

**If HR analytics becomes compute-heavy (multi-year sample-level analysis):**
- Add precomputed DuckDB tables/materialized rollups updated during sync jobs
- Because on-request recomputation will degrade dashboard latency

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| fastapi 0.115+ | pydantic 2.x | Ensure FastAPI config/examples use Pydantic v2 syntax. |
| openapi-typescript 7.x | OpenAPI 3.0/3.1 outputs | Keep generated file committed or CI-generated to avoid local drift. |
| @tanstack/react-query 5.x | React 18+ | Fits current React 18 app; no framework migration needed. |
| shadcn/ui (current) | Tailwind 4.x | Validate generated config against current Tailwind v4 setup before broad rollout. |

## Sources

- Repository inspection: `frontend/package.json`, `backend/pyproject.toml`, `backend/main.py`, existing page/components structure (HIGH confidence for current-state integration points).
- Framework/library recommendations based on established ecosystem practice for React + Python API stacks (MEDIUM confidence; verify exact latest versions before implementation).

---
*Stack research for: Running tracker revamp*
*Researched: 2026-03-21*
