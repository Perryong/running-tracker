---
stepsCompleted: [1, 2]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-running-tracker-2026-05-23/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# running-tracker - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for running-tracker, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Persist the timestamp of the last successful Garmin sync.

FR2: Persist the timestamp of the latest sync attempt.

FR3: Persist the latest sync attempt result as one of `success`, `failed`, `skipped`, or `unavailable`.

FR4: Persist a failure category for failed sync attempts, including `rate_limited`, `authentication_failed`, `network_error`, `parsing_error`, and `unknown`.

FR5: Ensure a failed sync does not overwrite the last successful sync timestamp.

FR6: Catch Garmin HTTP 429 errors and classify them as `rate_limited`.

FR7: Make the sync process exit with a clear machine-readable and human-readable failure message.

FR8: Avoid destructive writes when the Garmin pull fails before valid new activity data is available.

FR9: Support conservative retry/backoff policy configuration for sync attempts without worsening Garmin rate limiting.

FR10: Include freshness metadata in activities and analytics API responses.

FR11: Include last successful sync timestamp, latest attempt timestamp, latest attempt status, and latest failure category in freshness metadata when available.

FR12: Preserve backwards-compatible freshness fields where possible.

FR13: Regenerate `backend/api/openapi.json` and `frontend/src/api/contracts/schema.d.ts` when backend freshness schemas change.

FR14: Display the last successful sync timestamp on the dashboard when one exists.

FR15: Avoid showing only `unavailable` when prior valid sync metadata exists.

FR16: Visually distinguish fresh, stale, failed, and unavailable data states.

FR17: Show a concise dashboard explanation for rate-limited Garmin sync failures.

FR18: Show a clear activity detail error state when a dashboard-listed activity cannot be loaded in detail.

FR19: Include a primary action from the activity detail error state to return to the main dashboard.

FR20: Include last successful sync timestamp in the activity detail error state when available.

FR21: Preserve normal browser back behavior and avoid dead-end navigation in activity detail failures.

FR22: Attempt API-backed activity detail loading first; use static fallback only when the exact activity ID can be confidently resolved.

FR23: Log sync failures with error category, timestamp, and safe diagnostic context.

FR24: Prevent Garmin secrets, OAuth tokens, and private credentials from appearing in logs.

FR25: Make GitHub Actions sync failures expose the failure category in job logs.

FR26: Generate `data/sync-status.json` so deployed frontend/API surfaces can report last attempt status without immediate database migration.

### NonFunctional Requirements

NFR1: A failed Garmin sync must not corrupt or remove previously valid data.

NFR2: The UI must communicate stale or failed data states plainly, without implying data is fresh when it is not.

NFR3: Credentials, tokens, and private Garmin auth details must never be exposed in frontend bundles, logs, artifacts, or test fixtures.

NFR4: Changes must preserve the existing React/FastAPI architecture, `/api/v1` routes, generated OpenAPI types, and static data fallback behavior.

NFR5: Rate-limit, missing-data, stale-data, and activity-not-found states must be covered by automated tests.

### Additional Requirements

- Do not use a new starter template or greenfield scaffold; extend the existing repository in place.
- Use `data/sync-status.json` as the first sync status persistence mechanism.
- Treat `data/sync-status.json` as a formal shared contract across sync code, backend services, frontend adapters, and tests.
- Keep Garmin integration behind `backend/run_page/garmin_sync.py` and helper code it imports.
- Add sync status artifact writer/validator logic near `backend/run_page`, expected as `backend/run_page/sync_status.py`.
- Add backend API freshness translation logic under `backend/api/services`, expected as `backend/api/services/sync_status_service.py`.
- Preserve FastAPI router/service/schema boundaries; routers must not read runtime data files directly.
- Preserve REST-style `/api/v1` endpoints and extend existing activities/analytics freshness metadata.
- Update backend schemas, OpenAPI, generated frontend types, frontend adapters, and tests together for freshness contract changes.
- Use snake_case artifact/API fields and controlled enum values from the PRD.
- Keep frontend data access inside `frontend/src/api/*` and existing hooks.
- Keep dashboard freshness behavior in dashboard/components/hooks and activity detail recovery in activity-detail components/hooks.
- Add backend tests for `data/sync-status.json` shape, enum values, timestamp parsing, safe message content, and failure classification.
- Add API contract tests for freshness metadata.
- Add frontend tests for dashboard freshness states and activity detail recovery.
- Update GitHub Actions sync workflow behavior/logging so Garmin 429 is safely visible as `rate_limited`.
- Allow deployment with last-known-good data only when failed/stale freshness state is clearly represented.

### UX Design Requirements

No UX design document was provided. UX requirements extracted from PRD:

UX-DR1: Dashboard freshness display must show last successful sync timestamp when available.

UX-DR2: Dashboard freshness display must distinguish fresh, stale, failed, and unavailable states.

UX-DR3: Dashboard freshness display must explain Garmin rate-limit failures concisely.

UX-DR4: Activity detail load failure must show a clear unable-to-load state.

UX-DR5: Activity detail load failure must include last successful sync timestamp when available.

UX-DR6: Activity detail load failure must provide a prominent return-to-dashboard action.

UX-DR7: Activity detail recovery must avoid dead-end navigation and preserve normal browser back behavior.

### FR Coverage Map

FR1: Epic 1 - Persist last successful Garmin sync timestamp.

FR2: Epic 1 - Persist latest sync attempt timestamp.

FR3: Epic 1 - Persist latest sync attempt status.

FR4: Epic 1 - Persist latest sync failure category.

FR5: Epic 1 - Prevent failed sync from overwriting last successful sync timestamp.

FR6: Epic 1 - Classify Garmin HTTP 429 as `rate_limited`.

FR7: Epic 1 - Emit clear sync failure messages for humans and automation.

FR8: Epic 1 - Avoid destructive writes before valid new activity data exists.

FR9: Epic 1 - Support conservative sync retry/backoff configuration.

FR10: Epic 2 - Include freshness metadata in activities and analytics API responses.

FR11: Epic 2 - Include detailed freshness timestamps, status, and failure category.

FR12: Epic 2 - Preserve backwards-compatible freshness fields where possible.

FR13: Epic 2 - Regenerate OpenAPI and frontend contract types with backend schema changes.

FR14: Epic 3 - Display last successful sync timestamp on dashboard.

FR15: Epic 3 - Avoid showing only `unavailable` when valid prior metadata exists.

FR16: Epic 3 - Distinguish fresh, stale, failed, and unavailable states visually.

FR17: Epic 3 - Explain rate-limited Garmin failures on dashboard.

FR18: Epic 3 - Show activity detail unable-to-load state.

FR19: Epic 3 - Provide primary return-to-dashboard action.

FR20: Epic 3 - Include last successful sync timestamp in activity detail error state.

FR21: Epic 3 - Preserve normal browser back behavior and avoid dead ends.

FR22: Epic 3 - Use static fallback only when exact activity ID can be resolved.

FR23: Epic 1 - Log sync failures with safe category, timestamp, and diagnostic context.

FR24: Epic 1 - Prevent Garmin secrets or tokens from appearing in logs.

FR25: Epic 1 - Expose sync failure category in GitHub Actions logs.

FR26: Epic 1 - Generate `data/sync-status.json` for deployed freshness reporting.

## Epic List

### Epic 1: Reliable Sync Status Foundation

Users and operators can trust that every sync attempt records safe, accurate freshness metadata without damaging last-known-good activity data.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR23, FR24, FR25, FR26

### Epic 2: Freshness API Contract and Data Integrity

Frontend surfaces can consume consistent freshness metadata from existing `/api/v1` activities and analytics responses.

**FRs covered:** FR10, FR11, FR12, FR13

### Epic 3: User-Facing Freshness and Activity Recovery

Users can understand data freshness on the dashboard and recover cleanly when an activity detail page cannot load.

**FRs covered:** FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22
