# Phase 1: Typed API Foundation - Research

**Researched:** 2026-03-21  
**Domain:** Typed frontend/backend API contract foundation for running activity + analytics reads  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### API Contract Shape & Versioning
- Use a versioned HTTP API surface (`/api/v1`) as the canonical contract boundary.
- Treat backend schema definitions as source-of-truth and generate frontend types from OpenAPI output.
- Contract changes must be additive/backward-compatible within v1 unless explicitly version-bumped.

### Freshness & Completeness Metadata
- Include freshness metadata in API responses consumed by dashboard/detail surfaces: last sync timestamp + completeness status flags.
- Freshness metadata is required for primary activity/analytics read responses, not optional per endpoint.
- Expose freshness as user-facing trust signal in downstream phases (this phase only guarantees schema availability).

### Migration Strategy (Static JSON → API)
- Use incremental migration: introduce API path first while preserving current static-data fallback during transition.
- New typed client/hook boundary should be introduced early to avoid spreading direct static JSON coupling.
- Preserve existing frontend behavior parity while switching data source plumbing.

### Error & Missing-Data Semantics
- Define explicit typed states for success, partial/incomplete, and unavailable data conditions.
- Avoid ad-hoc null/undefined field interpretation in frontend; represent missingness in contract fields.
- Keep response semantics deterministic so downstream UI states remain consistent.

### Claude's Discretion
- Exact DTO naming conventions and file/module layout within frontend/backend.
- Specific OpenAPI type-generation tooling command wiring.
- Internal endpoint decomposition across activity vs analytics resources.

### Deferred Ideas (OUT OF SCOPE)
- Detailed dashboard UX redesign decisions (Phase 2).
- Activity detail interaction/layout refinements (Phase 3).
- Heart-rate zone/trend rendering behaviors and methodology UI details (Phase 4).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| API-01 | Frontend can consume activity and analytics data through a typed HTTP API contract generated from backend schemas | `/api/v1` contract-first pattern, FastAPI+Pydantic schema source, OpenAPI generation, frontend typegen wiring, additive v1 compatibility rules |
| API-02 | API responses expose explicit freshness metadata (last sync timestamp and data completeness flags) | Required response envelope/metadata pattern, typed completeness states, sync provenance integration from existing Garmin pipeline |
</phase_requirements>

## Summary

Phase 1 should be planned as a **contract and migration foundation**, not as a UX phase. The immediate goal is to introduce a stable `/api/v1` boundary backed by typed backend schemas and generated frontend types, while preserving current behavior through temporary static JSON fallback. Existing code already has centralized frontend data access (`useActivities`) and backend sync/data generation (`backend/main.py`, `run_page/*`), which gives a safe path for incremental adoption.

The most important planning decision is to establish a single response convention early: versioned DTOs plus mandatory freshness/completeness metadata for primary activity and analytics reads. This directly satisfies API-02 and prevents ad-hoc `null` interpretation in frontend logic. Given the current repository has no HTTP API framework and no test infrastructure, Wave 0 work should explicitly include API skeleton, schema definitions, OpenAPI export, frontend codegen script, and baseline contract tests.

**Primary recommendation:** Plan Phase 1 around a minimal but production-shaped vertical slice: one `/api/v1/activities` endpoint + typed client + freshness envelope + generated types + contract tests, then extend to analytics reads using the same contract pattern.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| FastAPI | 0.135.1 | HTTP API layer with OpenAPI output | Clean schema-first API development and automatic OpenAPI generation for frontend codegen |
| Pydantic | 2.12.5 | Backend request/response DTO schemas | Typed source-of-truth contracts and strong serialization/validation |
| openapi-typescript | 7.13.0 | Generate TypeScript types from OpenAPI | Eliminates frontend/backend contract drift from hand-written interfaces |
| @tanstack/react-query | 5.91.3 | Frontend server-state handling for typed API hooks | Standard caching/loading/error handling for API-backed UIs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| uvicorn | 0.42.0 | ASGI server for local/dev API runtime | Running backend API locally and in deployment |
| httpx | existing (backend dependency) | Integration testing and HTTP client | Backend API tests and internal service calls |
| pytest | 8.x (recommended) | Contract and endpoint behavior tests | Required for validation architecture in this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| openapi-typescript (types only) | Orval (types + client generation) | Orval reduces boilerplate but adds extra generator complexity; openapi-typescript is simpler for initial Phase 1 adoption |

**Installation:**
```bash
# backend
pip install "fastapi==0.135.1" "pydantic==2.12.5" "uvicorn[standard]==0.42.0"
pip install "pytest>=8" "httpx>=0.27" "pytest-asyncio>=0.23"

# frontend
npm install @tanstack/react-query@5.91.3
npm install -D openapi-typescript@7.13.0
```

**Version verification:** Verified against package registries on 2026-03-21.
```bash
npm view @tanstack/react-query version
npm view openapi-typescript version
python -m pip index versions fastapi
python -m pip index versions pydantic
python -m pip index versions uvicorn
```

## Architecture Patterns

### Recommended Project Structure
```text
backend/
├── api/
│   ├── main.py                # FastAPI app + /api/v1 mounting
│   ├── routers/
│   │   ├── activities.py
│   │   └── analytics.py
│   └── schemas/
│       ├── common.py          # freshness/completeness envelope
│       ├── activity.py
│       └── analytics.py
├── services/
│   ├── activity_service.py
│   └── analytics_service.py
└── main.py                    # existing CLI remains intact

frontend/src/
├── api/
│   ├── contracts/             # generated OpenAPI TS types
│   ├── client.ts              # typed fetch wrapper
│   ├── activities.ts
│   └── analytics.ts
└── hooks/
    └── useActivities.ts       # migrates from static JSON to typed client
```

### Pattern 1: Contract-First Versioned API
**What:** Define DTOs in backend schemas, expose `/api/v1/*`, generate TS from OpenAPI.  
**When to use:** All activity/analytics read contracts in this phase.  
**Example:**
```python
# Source: https://fastapi.tiangolo.com/tutorial/response-model/
from fastapi import APIRouter
from pydantic import BaseModel

class Freshness(BaseModel):
    last_sync_at: str
    completeness: str  # "complete" | "partial" | "unavailable"

class ActivitiesResponse(BaseModel):
    freshness: Freshness
    items: list[dict]

router = APIRouter(prefix="/api/v1")

@router.get("/activities", response_model=ActivitiesResponse)
def get_activities():
    ...
```

### Pattern 2: Incremental Strangler Migration (Static JSON fallback)
**What:** Keep existing static path while introducing typed API path behind a single hook boundary.  
**When to use:** During Phase 1 rollout to preserve behavior parity.  
**Example:**
```typescript
// Source: internal pattern from frontend/src/hooks/useActivities.ts
export function useActivitiesData() {
  return useApiFlag()
    ? useActivitiesQuery()   // typed HTTP API path
    : useLegacyActivities(); // @data/activities.json fallback
}
```

### Anti-Patterns to Avoid
- **Raw dict responses from handlers:** causes contract drift; always use schema response models.
- **Endpoint-specific freshness field names:** creates inconsistent UI parsing; enforce one shared metadata schema.
- **Breaking field renames in v1:** violates locked additive/backward-compatible decision.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OpenAPI parsing + TS type emitter | Custom script to transform JSON schema manually | openapi-typescript | Mature handling of schema edge cases and less maintenance risk |
| API caching/loading/error state in React | Custom `useEffect` fetch + local state everywhere | TanStack Query | Handles retries, caching, stale state, loading/error patterns correctly |
| Schema validation logic | Ad-hoc runtime field checks | Pydantic response models | Centralized validation at the contract boundary |

**Key insight:** Typed boundary quality fails quickly when codegen, validation, and caching are custom and inconsistent. Use ecosystem standards immediately in Phase 1.

## Common Pitfalls

### Pitfall 1: “Typed frontend” but untyped backend payloads
**What goes wrong:** TS compiles while runtime breaks on missing/renamed fields.  
**Why it happens:** Separate, manually maintained models on each side.  
**How to avoid:** Backend schema source-of-truth + OpenAPI typegen in CI + response_model enforcement.  
**Warning signs:** Frequent null-guards and UI fixes for undefined fields.

### Pitfall 2: Freshness metadata only on some endpoints
**What goes wrong:** UI trust indicators are inconsistent and unreliable.  
**Why it happens:** Freshness treated as optional per endpoint.  
**How to avoid:** Shared response envelope with mandatory freshness/completeness for primary read endpoints.  
**Warning signs:** Endpoint-specific freshness keys and missing timestamps.

### Pitfall 3: Non-deterministic missing-data semantics
**What goes wrong:** Frontend can’t distinguish partial vs unavailable data.  
**Why it happens:** Overloading null/undefined meanings.  
**How to avoid:** Explicit typed state enum and completeness flags in contract.  
**Warning signs:** UI conditions depend on multiple scattered null checks.

## Code Examples

Verified patterns from official sources and repository:

### OpenAPI type generation script
```json
// Source: https://openapi-ts.dev/introduction
{
  "scripts": {
    "generate:api-types": "openapi-typescript http://localhost:8000/openapi.json -o src/api/contracts/schema.d.ts"
  }
}
```

### FastAPI response model for stable contract output
```python
# Source: https://fastapi.tiangolo.com/tutorial/response-model/
@router.get("/api/v1/analytics/trends", response_model=TrendResponse)
def trends():
    return TrendResponse(...)
```

### Existing frontend hook boundary to evolve (migration anchor)
```typescript
// Source: frontend/src/hooks/useActivities.ts
import activities from '@data/activities.json';
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Frontend imports static JSON directly (`@data/activities.json`) | Typed API client generated from backend OpenAPI contracts | Planned in Phase 1 | Prevents schema drift and supports freshness metadata |
| CLI-only backend data flow | CLI retained + new HTTP API read surface (`/api/v1`) | Planned in Phase 1 | Enables incremental modernization without breaking sync workflows |
| Implicit null/missing semantics | Explicit completeness/freshness metadata in response contracts | Planned in Phase 1 | Deterministic UI behavior for partial/unavailable data |

**Deprecated/outdated:**
- Static JSON as the canonical contract boundary for active UI reads (retain only as temporary fallback during migration).

## Open Questions

1. **Freshness source-of-truth timestamp**
   - What we know: sync pipeline currently updates DB/JSON via CLI.
   - What's unclear: single authoritative field location for `last_sync_at`.
   - Recommendation: define one backend source (e.g., sync status table or metadata file) before endpoint implementation.

2. **Completeness flags taxonomy**
   - What we know: requirements demand explicit completeness flags.
   - What's unclear: exact enum (`complete|partial|unavailable` vs richer states).
   - Recommendation: finalize minimal enum now and reserve additive extension fields for v1.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 8.x + httpx (recommended for this phase) |
| Config file | none — see Wave 0 |
| Quick run command | `python -m pytest tests/api/test_contracts.py -q -x` |
| Full suite command | `python -m pytest tests -q` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| API-01 | `/api/v1` responses match schema and frontend-generated types | integration/contract | `python -m pytest tests/api/test_contracts.py::test_activities_contract -q -x` | ❌ Wave 0 |
| API-02 | Required freshness metadata (`last_sync_timestamp`, completeness flags) is present on primary read responses | integration | `python -m pytest tests/api/test_freshness.py::test_freshness_fields_required -q -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `python -m pytest tests/api/test_contracts.py -q -x`
- **Per wave merge:** `python -m pytest tests -q`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/api/test_contracts.py` — covers REQ-API-01
- [ ] `tests/api/test_freshness.py` — covers REQ-API-02
- [ ] `tests/conftest.py` — shared API fixtures/test app factory
- [ ] `pytest.ini` — test discovery and markers
- [ ] Framework install: `pip install "pytest>=8" "httpx>=0.27" "pytest-asyncio>=0.23"`

## Sources

### Primary (HIGH confidence)
- Internal context:
  - `.planning/phases/01-typed-api-foundation/01-CONTEXT.md`
  - `.planning/REQUIREMENTS.md`
  - `.planning/ROADMAP.md`
  - `.planning/research/STACK.md`
  - `.planning/research/ARCHITECTURE.md`
  - `.planning/research/PITFALLS.md`
- Repository evidence:
  - `frontend/src/hooks/useActivities.ts` (static JSON coupling)
  - `frontend/src/pages/index.tsx` (existing useActivities integration point)
  - `backend/main.py` (CLI-first entrypoint and secret handling)
  - `backend/run_page/config.py`, `backend/run_page/generator/db.py`, `backend/run_page/garmin_sync.py`, `backend/run_page/utils.py` (sync, persistence, timestamp handling)
- Package registries/version checks (2026-03-21):
  - npm registry (`npm view`) for `@tanstack/react-query`, `openapi-typescript`
  - PyPI (`pip index versions`, `https://pypi.org/pypi/<pkg>/json`) for FastAPI, Pydantic, Uvicorn

### Secondary (MEDIUM confidence)
- FastAPI docs: https://fastapi.tiangolo.com/tutorial/response-model/
- OpenAPI TypeScript docs: https://openapi-ts.dev/introduction
- TanStack Query docs: https://tanstack.com/query/latest/docs/framework/react/overview

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified via package registries; tooling aligns with locked decisions.
- Architecture: HIGH - directly grounded in repository structure and context constraints.
- Pitfalls: MEDIUM-HIGH - strongly supported by repo evidence and prior project research, but not all mitigations are yet implemented.

**Research date:** 2026-03-21  
**Valid until:** 2026-04-20
