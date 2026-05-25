---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-running-tracker-2026-05-23/prd.md
  - _bmad-output/project-context.md
workflowType: 'architecture'
project_name: 'running-tracker'
user_name: 'Perry'
date: '2026-05-24'
lastStep: 8
status: 'complete'
completedAt: '2026-05-24'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Initialization Summary

Architecture workflow initialized for the finalized PRD: **Data Refresh Reliability and Activity Detail Recovery**.

Confirmed input documents:

- PRD: `_bmad-output/planning-artifacts/prds/prd-running-tracker-2026-05-23/prd.md`
- Project context: `_bmad-output/project-context.md`

No UX design, research document, or product brief was provided or discovered.

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines 6 functional requirement groups:

- Sync status persistence: preserve last successful sync, latest attempt timestamp, attempt status, and failure category.
- Garmin rate-limit handling: catch HTTP 429, classify it as `rate_limited`, avoid destructive writes, and use conservative retry/backoff behavior.
- Freshness API contract: expose freshness metadata through activities and analytics APIs while maintaining compatibility.
- Dashboard freshness display: show last successful sync, stale/failed/unavailable states, and rate-limit explanation.
- Activity detail recovery: show a recoverable error state with a primary return-to-dashboard action when an activity cannot be loaded.
- Observability and operations: safe logs, GitHub Actions visibility, and a JSON sidecar artifact for sync status.

**Non-Functional Requirements:**

Architecture must prioritize reliability, trust, privacy, compatibility, and testability:

- Failed sync must not corrupt last-known-good activity data.
- UI must not imply data is fresh when it is stale or failed.
- Garmin credentials, OAuth tokens, and private data must never leak into frontend bundles, logs, or fixtures.
- Existing React/FastAPI boundaries, `/api/v1` routes, generated OpenAPI types, and static fallback behavior must remain intact.
- Rate-limit, missing-data, stale-data, and activity-not-found states need automated coverage.

**Scale & Complexity:**

- Primary domain: full-stack web reliability and data freshness.
- Complexity level: medium.
- Estimated architectural components: 7.

Likely components:

- Garmin sync runner: `backend/run_page/garmin_sync.py`
- Sync status artifact writer: `data/sync-status.json`
- Backend freshness reader/service layer
- FastAPI schemas and `/api/v1` response metadata
- Frontend API adapters/types
- Dashboard freshness UI
- Activity detail error/recovery UI

### Technical Constraints & Dependencies

- Existing frontend stack is React 18, Vite 7, TypeScript strict mode, React Router 6, TanStack React Query 5.
- Existing backend stack is Python/FastAPI with router/service/schema boundaries.
- API paths must remain under `/api/v1`.
- Backend OpenAPI output and generated frontend contract types must be updated together when freshness schema changes.
- `data/sync-status.json` is the selected initial persistence mechanism for sync status.
- JSON status fields must use ISO 8601 timestamps or `null`, and controlled enum values.
- Garmin integration currently depends on deprecated `garth`; this architecture should isolate and harden the integration, not replace it in this scope.
- GitHub Actions may deploy when sync fails only if previous valid data exists and stale/failed status is clearly exposed.

### Cross-Cutting Concerns Identified

- Data integrity: failed Garmin pulls must not overwrite valid existing activity data or generated assets.
- Contract consistency: backend schemas, OpenAPI, frontend generated types, API adapters, and tests must move together.
- Freshness semantics: dashboard, analytics, activity list, and activity detail need the same interpretation of success, failed, stale, unavailable, and rate-limited.
- Error classification: sync failures need stable categories usable by logs, API metadata, and UI copy.
- Privacy: failure handling must not expose secrets or private Garmin auth material.
- Recovery UX: activity detail failure should never be a dead end; returning to the main dashboard is the required primary action.
- Testability: sync artifact contract, backend freshness services, API contract, frontend freshness display, and activity detail failure states all require coverage.

## Starter Template Evaluation

### Primary Technology Domain

Brownfield full-stack web reliability update for an existing React/Vite/TypeScript frontend and FastAPI/Python backend.

### Starter Options Considered

- Vite React TypeScript starter: rejected because the frontend already exists and is configured.
- FastAPI Full Stack Template: rejected because it is a greenfield full-stack template and would introduce unrelated architectural churn.
- Third-party FastAPI + React generators: rejected because this PRD is not a greenfield project and does not need new scaffold ownership.

### Selected Starter: None

**Rationale for Selection:**

No starter template should be used. This architecture must extend the existing codebase in place:

- Preserve existing React Router, Vite, TypeScript, API adapter, and dashboard filter patterns.
- Preserve FastAPI router/service/schema boundaries.
- Preserve `/api/v1` contract behavior and generated OpenAPI/frontend types.
- Avoid dependency churn unrelated to data freshness and activity detail recovery.
- Treat `data/activities.json`, generated SVG assets, GPX data, and `backend/run_page/data.db` as runtime contract surfaces.

**Initialization Command:**

```bash
# None. Brownfield architecture: extend the existing repository in place.
```

**Architectural Decisions Provided by Existing Codebase:**

**Language & Runtime:**
React 18 + TypeScript frontend, Python FastAPI backend.

**Styling Solution:**
Existing global CSS and component CSS modules.

**Build Tooling:**
Existing Vite frontend build and current backend Python tooling.

**Testing Framework:**
Vitest/jsdom/Testing Library for frontend; pytest for backend.

**Code Organization:**
Frontend API adapters in `frontend/src/api`, dashboard feature logic in `frontend/src/features/dashboard`, backend routers/services/schemas under `backend/api`.

**Development Experience:**
Use existing local dev flow, Vite proxy, generated OpenAPI types, and current CI/test commands.

**Note:**
The first implementation story should not scaffold a new app. It should introduce the sync status artifact and freshness contract into the existing repo.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Extend the existing brownfield architecture in place; do not migrate to a new starter, React 19, Vite 8, React Router v7, or a new FastAPI template for this scope.
- Use `data/sync-status.json` as the first sync status persistence mechanism.
- Treat sync status as a shared contract consumed by sync code, backend API services, frontend adapters, and tests.
- Preserve `/api/v1` FastAPI routes and generated OpenAPI/frontend TypeScript contract flow.
- Keep activity detail recovery centered on a clear error state with primary return-to-dashboard action.

**Important Decisions (Shape Architecture):**

- Keep Garmin integration behind existing `backend/run_page/garmin_sync.py`, but add classification and safe status-writing boundaries.
- Keep backend routers thin; add freshness translation in service/schema layers.
- Use existing frontend API adapters and hooks rather than component-level fetches.
- Use conservative retry/backoff behavior for Garmin 429 handling.
- Allow deployment with last-known-good data only when failed/stale status is clearly represented.

**Deferred Decisions (Post-MVP):**

- Replacing deprecated `garth`.
- Moving sync status from JSON sidecar to SQLite.
- Adding multi-user auth/account management.
- Introducing browser-level map testing beyond the activity/freshness recovery scope.

### Data Architecture

- `data/sync-status.json` is the source of truth for sync attempt metadata.
- The artifact must contain `last_successful_sync_at`, `latest_attempt_at`, `latest_attempt_status`, `latest_failure_category`, `stale_after_hours`, and `message`.
- Timestamps use ISO 8601 strings or `null`.
- Status and failure fields use controlled enum values from the PRD.
- Failed Garmin sync attempts must update attempt status without overwriting last successful sync.
- Activity data files, GPX outputs, generated SVGs, and `backend/run_page/data.db` are last-known-good runtime data and must not be destructively modified by partial sync failures.

### Authentication & Security

- Do not introduce new user authentication in this scope.
- Garmin credentials and OAuth material remain backend/sync-only.
- Sync logs and `data/sync-status.json` must never contain Garmin secrets, OAuth tokens, or private credential material.
- Error messages must be safe for GitHub Actions logs and frontend display.

### API & Communication Patterns

- Preserve REST-style FastAPI endpoints under `/api/v1`.
- Extend existing freshness metadata in activities and analytics responses rather than creating a separate frontend-only status path first.
- Backend schemas define the API contract; OpenAPI and generated frontend types must be updated with schema changes.
- Error/freshness categories must be stable enum-like values suitable for backend tests, frontend copy, and CI logs.
- Backend services own reading `data/sync-status.json` and translating it into API freshness metadata.

### Frontend Architecture

- Preserve React Router routing in `frontend/src/main.tsx`.
- Preserve app providers and dashboard filter state boundaries.
- Frontend data access goes through `frontend/src/api/*` and existing hooks such as `useActivities`.
- Dashboard and activity detail must interpret freshness states consistently.
- Activity detail may use static fallback only when the exact activity ID is confidently resolved; otherwise show the recoverable error state.
- The failure state must include a primary action back to the main dashboard.

### Infrastructure & Deployment

- GitHub Actions sync failures should classify Garmin 429 as `rate_limited` and produce safe logs.
- Deployment may continue with previous valid data only if `data/sync-status.json` marks the latest attempt as failed/stale.
- CI quality gates should include backend tests, frontend tests, OpenAPI regeneration, generated type freshness, and sync status artifact contract tests.
- No deployment step should publish a state that hides sync failure or implies stale data is fresh.

### Decision Impact Analysis

**Implementation Sequence:**

1. Add sync status artifact model/helper and tests.
2. Update Garmin sync failure handling to write safe status on success/failure.
3. Extend backend freshness schema/services and OpenAPI output.
4. Regenerate frontend API types and update adapters/hooks.
5. Update dashboard freshness display states.
6. Update activity detail failure recovery.
7. Update CI/tests for contract and failure cases.

**Cross-Component Dependencies:**

- Sync status artifact shape affects backend services, API schemas, frontend types, UI copy, and tests.
- Garmin failure classification affects logs, freshness metadata, dashboard display, and deployment policy.
- Backend schema changes require OpenAPI and frontend type regeneration.
- Activity detail recovery depends on consistent activity ID handling between dashboard list, API data, and static fallback data.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
8 areas where AI agents could make different choices:

- Sync status artifact naming and location
- Freshness enum values
- Backend schema field names
- API response compatibility
- Frontend fallback behavior
- Activity detail recovery behavior
- Sync failure logging format
- Test placement and coverage boundaries

### Naming Patterns

**Data Artifact Naming:**

- Sync status artifact path: `data/sync-status.json`.
- Field names use snake_case to match backend/API data conventions:
  - `last_successful_sync_at`
  - `latest_attempt_at`
  - `latest_attempt_status`
  - `latest_failure_category`
  - `stale_after_hours`
  - `message`

**Freshness Enum Values:**

- Attempt status values: `success`, `failed`, `skipped`, `unavailable`.
- Failure category values: `rate_limited`, `authentication_failed`, `network_error`, `parsing_error`, `unknown`, or `null`.
- Do not introduce UI-only enum variants unless backend schemas and frontend types are updated together.

**API Naming Conventions:**

- Preserve `/api/v1` prefix.
- Keep existing endpoint nouns: `/activities`, `/analytics/summary`.
- Use snake_case JSON field names in backend API responses.
- Frontend adapters may map API data into legacy frontend shapes, but generated contract types must remain backend-owned.

**Code Naming Conventions:**

- Python functions and variables use snake_case.
- TypeScript functions and variables use camelCase.
- React components use PascalCase.
- Tests keep existing `*.test.ts`, `*.test.tsx`, and backend `test_*.py` conventions.

### Structure Patterns

**Backend Organization:**

- Sync status artifact helper belongs under backend-owned data/sync support code, not in FastAPI routers.
- FastAPI routers in `backend/api/routers` remain thin HTTP adapters.
- Response schemas live in `backend/api/schemas`.
- Freshness loading and translation logic lives in `backend/api/services`.
- Garmin sync classification and artifact writing stay near `backend/run_page/garmin_sync.py` or a helper imported by it.

**Frontend Organization:**

- API calls and type adapters live in `frontend/src/api/*`.
- Activity data loading stays behind hooks such as `useActivities` and activity-detail hooks.
- Dashboard-specific logic stays under `frontend/src/features/dashboard/*`.
- Activity detail-specific logic stays under `frontend/src/features/activity-detail/*`.
- Do not add component-level `fetch` calls for freshness or activity detail data.

**Test Organization:**

- Backend API contract tests live under `backend/tests/api`.
- Backend sync artifact/helper tests should live under backend tests near existing test structure.
- Frontend component/page/hook tests stay colocated with the relevant source files.
- Contract tests should cover both backend freshness response shape and `data/sync-status.json` shape.

### Format Patterns

**Sync Status JSON Format:**

- JSON is UTF-8.
- Timestamps are ISO 8601 strings or `null`.
- Unknown optional data should be represented as `null`, not omitted, when the field is required by the contract.
- `message` must be safe for logs and frontend display.
- Secrets, tokens, and full Garmin auth responses must never be serialized.

**API Response Formats:**

- Preserve existing activities/analytics response wrappers.
- Extend existing `freshness` metadata rather than creating a disconnected frontend-only status model.
- Preserve backwards-compatible fields where possible.
- New freshness fields must be added to backend schemas, OpenAPI, generated frontend types, and frontend adapters together.

**Date/Time Formats:**

- Use timezone-aware ISO timestamps for sync metadata.
- Avoid locale-dependent parsing in data transformations.
- Frontend display formatting may be user-friendly, but raw API/artifact values remain ISO strings.

### Communication Patterns

**Failure Classification:**

- Garmin HTTP 429 maps to `rate_limited`.
- Authentication/token failures map to `authentication_failed`.
- Connection/timeouts map to `network_error`.
- Invalid or unreadable activity data maps to `parsing_error`.
- Unexpected failures map to `unknown`.

**Logging Pattern:**

- Sync logs should include:
  - timestamp
  - failure category
  - safe summary message
  - whether previous valid data remains available
- Logs must not include secrets, OAuth tokens, or raw credential payloads.

**State Communication:**

- Backend services translate artifact state into API freshness metadata.
- Frontend adapters consume API freshness metadata and expose stable UI-facing state.
- UI components should not parse `data/sync-status.json` directly unless operating in a static fallback path.

### Process Patterns

**Error Handling Patterns:**

- Sync failure before valid data is downloaded must update sync status without modifying last-known-good activity data.
- Activity detail failure must show a recoverable error state with primary dashboard navigation.
- Static fallback is allowed only when the exact activity ID is confidently resolved.
- Do not convert all failures into generic "unavailable"; preserve the most specific safe category.

**Loading State Patterns:**

- API-backed views should distinguish loading, empty, error, stale, and failed-sync states.
- Dashboard freshness and activity detail failure states must use the same freshness semantics.
- Missing backend availability should not prevent rendering last-known-good static data when available.

### Enforcement Guidelines

**All AI Agents MUST:**

- Treat `data/sync-status.json` as a formal contract, not an incidental cache.
- Update backend schemas, OpenAPI, generated frontend types, frontend adapters, and tests together for freshness contract changes.
- Preserve last-known-good activity data on sync failure.
- Keep Garmin secrets and OAuth material out of logs, artifacts, frontend bundles, and fixtures.
- Use existing FastAPI router/service/schema and React API/hook/component boundaries.

**Pattern Enforcement:**

- Backend tests verify artifact shape, enum values, timestamp parsing, and failure classification.
- API tests verify freshness metadata contract.
- Frontend tests verify freshness display states and activity detail recovery.
- CI should fail when generated API types are stale after backend schema changes.

### Pattern Examples

**Good Examples:**

- `data/sync-status.json` records `latest_attempt_status: "failed"` and `latest_failure_category: "rate_limited"` while preserving a prior `last_successful_sync_at`.
- `/api/v1/activities` returns activity items plus freshness metadata derived from the sync status artifact.
- Activity detail for an unresolved activity ID shows an error panel with last successful sync and a dashboard action.

**Anti-Patterns:**

- Writing `latest_attempt_status: "rate-limited"` in one place and `"rate_limited"` in another.
- Replacing `activities.json` with an empty file after Garmin returns HTTP 429.
- Adding a direct `fetch('/api/v1/activities')` inside an activity detail component.
- Showing "fresh" or only "unavailable" when the latest sync failed but previous valid data exists.
- Logging Garmin OAuth tokens or raw auth responses.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
running-tracker/
├── _bmad-output/
│   ├── project-context.md
│   └── planning-artifacts/
│       ├── architecture.md
│       └── prds/
│           └── prd-running-tracker-2026-05-23/
│               ├── prd.md
│               ├── .decision-log.md
│               └── review-rubric.md
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── gh-pages.yml
│       └── run_data_sync.yml
├── backend/
│   ├── api/
│   │   ├── main.py
│   │   ├── export_openapi.py
│   │   ├── openapi.json
│   │   ├── routers/
│   │   │   ├── activities.py
│   │   │   └── analytics.py
│   │   ├── schemas/
│   │   │   ├── activity.py
│   │   │   ├── analytics.py
│   │   │   └── common.py
│   │   └── services/
│   │       ├── activity_service.py
│   │       ├── analytics_service.py
│   │       └── sync_status_service.py        # new
│   ├── run_page/
│   │   ├── garmin_sync.py
│   │   ├── sync_status.py                    # new
│   │   ├── data.db
│   │   └── ...
│   ├── tests/
│   │   ├── api/
│   │   │   ├── test_contracts.py
│   │   │   └── test_freshness_contract.py    # new/update
│   │   ├── run_page/
│   │   │   └── test_sync_status.py           # new
│   │   └── conftest.py
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── pytest.ini
├── data/
│   ├── activities.json
│   ├── sync-status.json                      # new generated runtime contract
│   ├── GPX_OUT/
│   └── assets/
│       ├── github.svg
│       ├── grid.svg
│       ├── year_2025.svg
│       └── year_2026.svg
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── api/
│       │   ├── client.ts
│       │   ├── activities.ts
│       │   ├── analytics.ts
│       │   ├── freshness.ts                  # new optional adapter
│       │   ├── types.ts
│       │   └── contracts/
│       │       └── schema.d.ts
│       ├── components/
│       │   └── FreshnessTrustSignal.tsx
│       ├── features/
│       │   ├── activity-detail/
│       │   │   ├── components/
│       │   │   │   ├── ActivityDetailError.tsx
│       │   │   │   ├── ActivityDetailNotFound.tsx
│       │   │   │   └── ActivityDetailSkeleton.tsx
│       │   │   └── hooks/
│       │   │       └── useActivityDetail.ts
│       │   └── dashboard/
│       │       ├── components/
│       │       ├── filters/
│       │       └── selectors/
│       ├── hooks/
│       │   └── useActivities.ts
│       └── pages/
│           ├── activity.tsx
│           ├── index.tsx
│           └── total.tsx
└── docs/
```

### Architectural Boundaries

**API Boundaries:**

- External Garmin communication remains inside `backend/run_page/garmin_sync.py` and helper code it imports.
- FastAPI exposes freshness through existing `/api/v1/activities` and `/api/v1/analytics/summary` response metadata.
- Routers do not read files directly; they call services.
- Backend schemas own the OpenAPI contract.

**Component Boundaries:**

- Dashboard freshness UI uses API/hook-provided freshness metadata.
- Activity detail recovery UI stays in `frontend/src/features/activity-detail/components`.
- Shared freshness display can use `FreshnessTrustSignal` or a small feature-specific wrapper.
- Pages compose features; they do not own API parsing or status classification.

**Service Boundaries:**

- `backend/run_page/sync_status.py` owns writing and validating `data/sync-status.json`.
- `backend/api/services/sync_status_service.py` owns reading and translating the artifact for API responses.
- Existing `activity_service.py` and `analytics_service.py` consume freshness service output rather than duplicating artifact parsing.

**Data Boundaries:**

- `data/sync-status.json` is generated runtime metadata.
- `data/activities.json`, GPX outputs, SVG assets, and `backend/run_page/data.db` are last-known-good activity/runtime data.
- Sync failures may update `data/sync-status.json` but must not destructively update last-known-good activity data.

### Requirements to Structure Mapping

**FR-1 Sync Status Persistence**

- Writer/helper: `backend/run_page/sync_status.py`
- Runtime artifact: `data/sync-status.json`
- Tests: `backend/tests/run_page/test_sync_status.py`

**FR-2 Garmin Rate Limit Handling**

- Sync integration: `backend/run_page/garmin_sync.py`
- Error classification helper: `backend/run_page/sync_status.py`
- CI logs: `.github/workflows/run_data_sync.yml`

**FR-3 Freshness API Contract**

- Schemas: `backend/api/schemas/common.py`, `activity.py`, `analytics.py`
- Services: `backend/api/services/sync_status_service.py`, `activity_service.py`, `analytics_service.py`
- Contract output: `backend/api/openapi.json`
- Generated frontend types: `frontend/src/api/contracts/schema.d.ts`

**FR-4 Dashboard Freshness Display**

- API adapters: `frontend/src/api/activities.ts`, `analytics.ts`, optional `freshness.ts`
- Hook: `frontend/src/hooks/useActivities.ts`
- UI: `frontend/src/components/FreshnessTrustSignal.tsx`, dashboard pages/components

**FR-5 Activity Detail Recovery**

- Hook: `frontend/src/features/activity-detail/hooks/useActivityDetail.ts`
- Error components: `ActivityDetailError.tsx`, `ActivityDetailNotFound.tsx`
- Page: `frontend/src/pages/activity.tsx`

**FR-6 Observability and Operations**

- Sync logs: `backend/run_page/garmin_sync.py`
- Status artifact: `data/sync-status.json`
- GitHub Actions: `.github/workflows/run_data_sync.yml`
- Tests: backend sync status tests and API contract tests

### Integration Points

**Internal Communication:**

Garmin sync writes `data/sync-status.json`; backend services read it; FastAPI schemas expose it; frontend API adapters consume it; dashboard and activity detail components render it.

**External Integrations:**

- Garmin Connect via current `garth` path.
- GitHub Actions for scheduled/manual sync and deployment workflows.
- Vite frontend consumes backend `/api/v1` during local/dev API mode and static data fallback when unavailable.

**Data Flow:**

```text
Garmin API
  -> backend/run_page/garmin_sync.py
  -> data/activities.json + backend/run_page/data.db + data/assets/*
  -> data/sync-status.json
  -> backend/api/services/* + backend/api/schemas/*
  -> /api/v1/activities and /api/v1/analytics/summary
  -> frontend/src/api/*
  -> useActivities / useActivityDetail
  -> dashboard freshness UI / activity detail recovery UI
```

### File Organization Patterns

**Configuration Files:**

- Frontend config remains under `frontend/`.
- Backend config remains under `backend/`.
- CI workflow changes remain under `.github/workflows/`.

**Source Organization:**

- Backend sync concerns stay under `backend/run_page`.
- Backend API concerns stay under `backend/api`.
- Frontend API concerns stay under `frontend/src/api`.
- UI recovery states stay under existing feature/component folders.

**Test Organization:**

- Backend API contract tests under `backend/tests/api`.
- Backend sync artifact tests under `backend/tests/run_page`.
- Frontend tests remain colocated with components/pages/hooks.

**Asset Organization:**

- Generated activity visual assets remain under `data/assets`.
- GPX outputs remain under `data/GPX_OUT`.
- `data/sync-status.json` is runtime metadata, not a visual asset.

### Development Workflow Integration

**Development Server Structure:**

- Frontend Vite dev server continues to proxy `/api` to backend.
- Backend API continues to serve `/api/v1`.

**Build Process Structure:**

- Backend schema changes require OpenAPI regeneration.
- Frontend generated API types must be regenerated after OpenAPI changes.

**Deployment Structure:**

- Sync workflow may fail due to Garmin but still preserve previous valid data.
- Deployment must expose stale/failed freshness state rather than hiding the failure.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

The decisions are compatible. The architecture keeps the existing React/Vite/FastAPI stack, avoids greenfield migration, and introduces `data/sync-status.json` as a small brownfield contract rather than a new database or service. The JSON sidecar fits the current static data/fallback model and GitHub Actions sync workflow.

**Pattern Consistency:**

Implementation patterns support the decisions:

- snake_case artifact/API fields align with backend conventions.
- FastAPI router/service/schema boundaries are preserved.
- Frontend data access remains inside API adapters and hooks.
- Failure categories are shared across sync logs, backend metadata, frontend UI, and tests.

**Structure Alignment:**

The structure maps each requirement group to specific existing or new files. New files are additive and localized: `backend/run_page/sync_status.py`, `backend/api/services/sync_status_service.py`, optional `frontend/src/api/freshness.ts`, and targeted tests.

### Requirements Coverage Validation ✅

**Feature Coverage:**

All PRD feature areas are architecturally covered:

- Sync status persistence → `data/sync-status.json` and `backend/run_page/sync_status.py`
- Garmin 429 handling → `garmin_sync.py` plus classification helper
- Freshness API contract → backend schemas/services/OpenAPI/frontend generated types
- Dashboard freshness display → frontend API adapters, hooks, and `FreshnessTrustSignal`
- Activity detail recovery → activity-detail hook/components/page
- Observability and operations → sync logs, status artifact, GitHub Actions workflow

**Functional Requirements Coverage:**

All FR groups FR-1 through FR-6 have assigned implementation locations, test locations, and integration boundaries.

**Non-Functional Requirements Coverage:**

- Reliability: failed sync updates status only and preserves last-known-good data.
- Trust: stale/failed/unavailable states are explicit.
- Privacy: secrets are excluded from logs, artifacts, frontend bundles, and fixtures.
- Compatibility: existing `/api/v1`, OpenAPI, generated frontend types, and static fallback behavior remain.
- Testability: artifact, backend API, frontend UI, and activity recovery tests are defined.

### Implementation Readiness Validation ✅

**Decision Completeness:**

Critical decisions are documented:

- No new starter/template.
- No major dependency upgrades for this scope.
- JSON sidecar first.
- Conservative Garmin retry/backoff.
- Preserve existing code boundaries.
- Defer `garth` replacement.

**Structure Completeness:**

The project structure identifies concrete files/directories for new helpers, services, schemas, frontend adapters, UI recovery, tests, CI, and runtime data.

**Pattern Completeness:**

Naming, structure, format, communication, process, and enforcement patterns are defined with good/anti-pattern examples.

### Gap Analysis Results

**Critical Gaps:**

None.

**Important Gaps:**

None blocking implementation.

**Nice-to-Have Gaps:**

- Browser-level smoke tests for Mapbox/canvas/chart rendering remain deferred. This is acceptable because the PRD scope is freshness and activity detail recovery, not visual map correctness.
- Future `garth` replacement remains deferred and should be revisited if rate-limit handling does not stabilize sync reliability.

### Validation Issues Addressed

No blocking validation issues remain. Earlier PRD review findings about the sync status artifact contract and activity detail fallback behavior were already resolved before architecture creation.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** high

**Key Strengths:**

- Brownfield-safe architecture with minimal dependency churn.
- Clear contract for sync status artifact.
- Strong separation between sync, backend API services, frontend adapters, and UI.
- Good protection against data loss on failed Garmin sync.
- Test strategy covers the main reliability risks.

**Areas for Future Enhancement:**

- Replace deprecated `garth` if current integration remains unstable.
- Move sync status into SQLite if operational history/querying becomes necessary.
- Add browser-level smoke coverage for map-heavy views after freshness reliability is complete.

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect project structure and boundaries.
- Refer to this document and `_bmad-output/project-context.md` for architectural questions.
- Do not destructively update last-known-good runtime data during sync failure handling.

**First Implementation Priority:**

Introduce the sync status artifact contract and backend helper:

1. Add `backend/run_page/sync_status.py`.
2. Add tests for `data/sync-status.json` shape and safe failure writing.
3. Integrate Garmin 429 classification in `backend/run_page/garmin_sync.py`.
