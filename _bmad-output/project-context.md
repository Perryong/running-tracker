---
project_name: 'running-tracker'
user_name: 'Perry'
date: '2026-05-23'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
existing_patterns_found: 12
status: 'complete'
rule_count: 69
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- Frontend app: React 18.2, Vite 7.1, TypeScript 5.2, React Router 6.15, TanStack React Query 5.91, React Helmet Async 2.0.
- Visualization: Mapbox GL 2.15 through React Map GL 7.1, Recharts 2.15, `@mapbox/polyline`, `@math.gl/web-mercator`, and generated SVG assets.
- Frontend tooling: Node >=20 is required. Use the pnpm-based package workflow from `frontend/package.json`; avoid introducing alternate package-manager lockfiles.
- Local frontend runtime: Vite serves on `0.0.0.0:5000` and proxies `/api` to `http://localhost:5001`; backend port changes must be coordinated with `frontend/vite.config.ts`.
- Frontend quality: Vitest 3.2 with `jsdom`, Testing Library React, globals enabled, ESLint flat config, Prettier 3.2 with single quotes, semicolons, ES5 trailing commas, and Tailwind class sorting.
- Backend app: Python >=3.12 with FastAPI >=0.104, Uvicorn, Pydantic/FastAPI response models, and Garmin/GPX processing libraries.
- Backend quality: pytest uses `backend/pytest.ini` with `testpaths = tests` and `pythonpath = .`.
- API contract: `backend/api/openapi.json` is the backend-owned contract source; frontend types are generated into `frontend/src/api/contracts/schema.d.ts`. Do not hand-edit generated contract types.
- Data: activity data comes from Garmin, GPX-derived files, JSON, and SQLite. Treat `data/`, generated SVG assets, backend persisted data, and frontend static fallback data as runtime contract surfaces.

## Critical Implementation Rules

### Language-Specific Rules

- TypeScript runs in strict mode with `moduleResolution: "bundler"` and React JSX transform; keep imports compatible with Vite/ESM.
- Use existing path aliases: `@/*` for `frontend/src/*`, `@data/*` for `data/*`, and `@assets/*` for `data/assets/*`.
- Frontend API calls should go through `frontend/src/api/client.ts`; paths must start with `/` because the client prefixes `/api/v1`.
- Treat `frontend/src/api/contracts/schema.d.ts` as generated output. Update backend schemas/routes and regenerate types instead of editing it directly.
- Use React Query v5 object-form APIs if adding query hooks; avoid v4 positional patterns.
- Python backend code targets Python >=3.12 and should stay compatible with FastAPI/Pydantic response-model validation.
- Backend API code should preserve the router/service/schema split under `backend/api/routers`, `backend/api/services`, and `backend/api/schemas`.
- File I/O that reads activity data should use explicit UTF-8 encoding and preserve existing JSON/data-file contracts.

### Framework-Specific Rules

- React routes are defined in `frontend/src/main.tsx` with `createBrowserRouter` and `RouterProvider`; preserve `import.meta.env.BASE_URL` basename behavior.
- Do not add a second React router, nested `BrowserRouter`, or duplicate app providers; `HelmetProvider`, `QueryClientProvider`, and `DashboardFiltersProvider` stay centralized in `frontend/src/main.tsx`.
- Frontend backend access should go through the typed API layer in `frontend/src/api/*` and hooks such as `useActivities`; do not add component-level `fetch` calls for backend resources.
- Dashboard filter state is centralized in `frontend/src/features/dashboard/filters/useDashboardFilters.tsx`; it owns selected filters and URL/localStorage persistence, not backend response caching.
- TanStack Query should own server/cache state for new API-backed workflows; filter inputs that affect fetched data must be represented in query keys.
- `useActivities` intentionally falls back to static `@data/activities.json` when typed API loading is disabled or fails; preserve this resilience behavior.
- Route/page components should stay composition-focused; reusable dashboard UI and state logic belong under `frontend/src/features/dashboard/*` or existing component/API modules.
- API-backed views need explicit loading, error, and empty states consistent with existing activity/analytics views.
- Theme changes are applied through `data-theme` on the document element and Helmet-managed HTML attributes.
- Mapbox/React Map GL code is version-sensitive; verify imports, token/config behavior, and no-route/no-token fallback states before changing map components.
- FastAPI endpoint shape must remain `/api/v1/...`; do not add unversioned routes or frontend-only URL assumptions.
- FastAPI routers should handle HTTP boundary concerns only; schemas define response contracts, and services own data loading, transformations, fallback behavior, and freshness metadata.
- Backend freshness metadata is part of the API contract and should be returned with activity/analytics responses.
- When backend schemas change, update routers/services, backend tests, generated frontend contract types, frontend API adapters/hooks, and static fallback assumptions together.
- Vite/FastAPI configuration must remain config-driven; do not hardcode API base URLs, Mapbox tokens, localhost URLs, or production hostnames in components.

### Testing Rules

- Frontend tests use Vitest with `jsdom`, Testing Library React, and Vitest globals; do not add Jest imports or Jest-specific APIs.
- Keep tests colocated with the page, component, hook, or feature they cover using existing `*.test.ts` and `*.test.tsx` naming.
- Mock expensive browser/visualization dependencies such as Recharts, Mapbox, route rendering, and browser storage when unit testing in `jsdom`.
- Dashboard filter tests should cover URL synchronization, localStorage persistence, back/forward navigation, and shared filter continuity across pages.
- API-backed frontend tests should cover loading, error, empty, successful, and static-fallback states where applicable.
- Backend API tests should use FastAPI test client patterns under `backend/tests/api` and assert response contracts, not just status codes.
- Backend service tests should use small deterministic activity/GPX/JSON fixtures and include edge cases for missing files, empty data, malformed records, duplicate activities, timezone handling, and missing heart-rate/GPS fields.
- Any backend schema or route contract change must update `backend/api/openapi.json`, regenerate frontend contract types, and include tests that catch stale contract drift.
- Mapbox/canvas/chart confidence cannot rely on `jsdom` alone; add browser-level smoke coverage before treating visual route/map behavior as fully verified.
- Do not commit real personal Garmin exports as test fixtures unless they are explicitly anonymized.

### Code Quality & Style Rules

- Follow existing Prettier rules: single quotes, semicolons, bracket spacing, and ES5 trailing commas.
- ESLint uses flat config in `frontend/eslint.config.cjs`; do not add `.eslintrc*` files.
- Unused TypeScript variables are warnings and may be intentionally prefixed with `_` when needed.
- Prefer path aliases over long cross-directory relative imports when importing from `frontend/src`, `data`, or `data/assets`.
- Keep generated/build artifacts separate from source changes; do not edit `frontend/dist`, generated SVGs, OpenAPI contract types, or bundled files unless the task explicitly targets generated output.
- Preserve the existing folder boundaries: reusable UI in `frontend/src/components`, domain dashboard logic in `frontend/src/features/dashboard`, activity detail logic in `frontend/src/features/activity-detail`, API adapters in `frontend/src/api`, backend HTTP routes in `backend/api/routers`, schemas in `backend/api/schemas`, and data logic in `backend/api/services`.
- Keep comments sparse and explanatory; avoid narrating obvious code.
- Prefer small typed helpers/selectors over embedding repeated filtering, formatting, or transformation logic directly in React components.
- CSS modules are used for component-scoped styling in several components; global styles belong in `frontend/src/styles`.

### Development Workflow Rules

- Run frontend commands from `frontend/` and backend commands from `backend/`; package and Python configs are scoped by directory.
- Frontend quality gate should include format/lint/build/tests where relevant: `pnpm run format`, `pnpm run lint`, `pnpm run build`, and `pnpm run test`.
- Backend quality gate should include pytest from `backend/`; API contract work should also regenerate `backend/api/openapi.json`.
- Use `pnpm run generate:api-types` from `frontend/` after backend OpenAPI changes to refresh `frontend/src/api/contracts/schema.d.ts`.
- Keep backend `/api/v1` route changes, OpenAPI output, generated frontend types, frontend adapters/hooks, and contract tests in the same change.
- Avoid dependency upgrades unless the task explicitly requires them; Mapbox/React Map GL, Vite/Node, React Query, and FastAPI/Pydantic changes are compatibility-sensitive.
- Do not commit credentials, Garmin secrets, Mapbox tokens, local `.env` content, or unanonymized personal exports.
- Treat `data/activities.json`, `backend/run_page/data.db`, GPX outputs, and generated SVG assets as user/runtime data; avoid deleting or regenerating them unless the task explicitly requires it.

### Critical Don't-Miss Rules

- Do not bypass the typed API/client layer with ad hoc component fetches; this breaks contract typing, error handling, and fallback behavior.
- Do not hand-edit generated contract files, bundled assets, `frontend/dist`, or generated SVGs unless the task explicitly targets generated output.
- Do not change backend API response shapes without updating schemas, OpenAPI, frontend generated types, frontend adapters/hooks, and tests together.
- Do not remove the static activity fallback path; the dashboard must still render when the backend is unavailable or typed API loading is disabled.
- Do not duplicate dashboard filter state outside `useDashboardFilters`; URL and localStorage synchronization must stay single-sourced.
- Do not hardcode secrets, Mapbox tokens, API hosts, localhost URLs, or production URLs in source components.
- Do not treat `jsdom` tests as sufficient proof for Mapbox/canvas/chart rendering; browser-level verification is needed for visual map behavior.
- Do not commit real Garmin/private activity exports as fixtures unless anonymized.
- Do not casually upgrade or swap Mapbox GL, React Map GL, Vite, React Query, FastAPI, or Pydantic; these affect runtime and API compatibility.
- Preserve timezone/ISO date behavior for activity data; avoid locale-dependent date parsing or display assumptions in data transformations.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow all rules exactly as documented.
- When in doubt, prefer the more restrictive option.
- Update this file if new project-specific patterns emerge.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update it when the technology stack or implementation patterns change.
- Review periodically for outdated rules.
- Remove rules that become obvious or stop preventing real mistakes.

Last Updated: 2026-05-23
