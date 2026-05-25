---
title: 'Data Refresh Reliability and Activity Detail Recovery'
status: 'final'
created: '2026-05-23'
updated: '2026-05-24'
---

# PRD: Data Refresh Reliability and Activity Detail Recovery

## 1. Summary

`running-tracker` must reliably communicate data freshness and recover gracefully when Garmin sync or activity detail loading fails. Today, a Garmin sync attempt can fail during OAuth refresh with HTTP 429 Too Many Requests, the UI can show latest synced as unavailable, and the activity detail page can fail with an unable-to-load state.

This PRD defines production-grade requirements for preserving last-known-good data, surfacing last successful sync information, recording sync failure status, and giving users a clear path back to the main dashboard when activity detail cannot load.

## 2. Problem Statement

Users depend on the tracker to understand whether their activity data is current and to inspect individual activities. When Garmin throttles or rejects sync attempts, the system currently does not provide enough trustworthy status. A failed sync can make freshness appear unavailable even when older valid data exists, and an activity detail failure leaves the user without a useful recovery path.

Known failure evidence:

- Sync command: `python backend/run_page/garmin_sync.py`
- Failure location: `backend/run_page/garmin_sync.py`, during `garth.client.refresh_oauth2()`
- Error: `requests.exceptions.HTTPError: 429 Client Error: Too Many Requests`
- Endpoint: Garmin OAuth exchange endpoint at `connectapi.garmin.com`
- Additional risk: `garth` emits a deprecation warning and is no longer maintained.

## 3. Goals

- Preserve and expose the last successful sync timestamp even when the latest Garmin sync attempt fails.
- Distinguish "no sync has ever succeeded" from "latest sync attempt failed but prior data is available."
- Prevent Garmin sync failures from deleting, overwriting, or obscuring last-known-good activity data.
- Make activity detail load failures recoverable by showing a clear error state and a route back to the main dashboard.
- Capture enough sync status, error category, and timestamps for production support and debugging.
- Add tests that prevent regressions in freshness display, failed-sync handling, and activity detail fallback behavior.

## 4. Non-Goals

- Rebuilding the full Garmin integration from scratch in this PRD.
- Adding multi-user account management or OAuth onboarding UI.
- Replacing Mapbox or redesigning the activity detail page beyond the failure/recovery states.
- Guaranteeing Garmin API availability or bypassing Garmin-side throttling controls.

## 5. Users and Stakeholders

- Primary user: a runner viewing their personal activity dashboard and activity detail pages.
- Operator/deployer: the person responsible for GitHub Actions sync runs, deployment health, credentials, and data integrity.
- Future deployments: other users may deploy the tracker with their own Garmin credentials and need clear failure handling without reading logs.

## 6. Current Behavior

- Garmin sync can fail with HTTP 429 during OAuth token exchange.
- The UI may show latest synced as unavailable.
- Activity detail may fail with an unable-to-load message.
- Recovery guidance from the activity detail failure is insufficient.
- Previous successful sync metadata is not reliably surfaced to the frontend when the latest sync attempt fails.

## 7. Desired User Experience

### Dashboard Freshness

When the latest Garmin sync succeeds, the UI shows the successful sync timestamp and a healthy/complete freshness state.

When the latest Garmin sync fails but previous data exists, the UI shows:

- Last successful sync timestamp.
- Latest attempt status as failed.
- A concise failure category such as "Garmin rate limited sync" when the cause is HTTP 429.
- A stale-data warning that makes clear the displayed data may not include the latest Garmin activities.

When no sync has ever succeeded, the UI shows:

- No successful sync available.
- Actionable setup or retry guidance.
- No misleading timestamp.

### Activity Detail Failure

When a user opens an activity detail page and the activity cannot be loaded, the page shows:

- A clear "Unable to load activity" state.
- The last successful sync timestamp if available.
- A short explanation that data may be missing or stale if the latest sync failed.
- A prominent action to return to the main dashboard.

## 8. Glossary

- Last successful sync: the most recent Garmin sync attempt that completed and produced valid activity data.
- Latest sync attempt: the most recent attempted Garmin sync, regardless of success or failure.
- Freshness state: the user-facing data state derived from last successful sync, latest attempt status, and stale threshold.
- Stale: data whose last successful sync is older than the configured stale threshold.
- Rate limited: a Garmin sync failure caused by HTTP 429 Too Many Requests.
- Sync status artifact: the JSON sidecar file that records sync attempt metadata for backend and frontend freshness display.

## 9. Sync Status Artifact Contract

The sync process shall write a JSON sidecar artifact at `data/sync-status.json`. Backend API services and static frontend fallback logic may read this artifact to report freshness state.

Required fields:

- `last_successful_sync_at`: ISO 8601 timestamp string or `null`.
- `latest_attempt_at`: ISO 8601 timestamp string or `null`.
- `latest_attempt_status`: one of `success`, `failed`, `skipped`, or `unavailable`.
- `latest_failure_category`: one of `rate_limited`, `authentication_failed`, `network_error`, `parsing_error`, `unknown`, or `null`.
- `stale_after_hours`: positive integer, default `48`.
- `message`: safe human-readable summary suitable for logs/UI, without secrets or tokens.

Write ownership:

- `backend/run_page/garmin_sync.py` owns writing the artifact during sync attempts.
- Backend API freshness services own translating the artifact into API metadata.
- Frontend adapters own rendering the freshness state without mutating the artifact.

## 10. Functional Requirements

### FR-1 Sync Status Persistence

- FR-1.1 The system shall persist the timestamp of the last successful Garmin sync.
- FR-1.2 The system shall persist the timestamp of the latest sync attempt.
- FR-1.3 The system shall persist the latest sync attempt result: success, failed, skipped, or unavailable.
- FR-1.4 The system shall persist a failure category for failed sync attempts, including rate limited, authentication failed, network error, parsing error, and unknown.
- FR-1.5 A failed sync shall not overwrite the last successful sync timestamp.

### FR-2 Garmin Rate Limit Handling

- FR-2.1 The sync process shall catch Garmin HTTP 429 errors and classify them as rate limited.
- FR-2.2 The sync process shall exit with a clear machine-readable and human-readable failure message.
- FR-2.3 The sync process shall avoid destructive writes when the Garmin pull fails before valid new activity data is available.
- FR-2.4 The sync process should support retry/backoff policy configuration, defaulting to conservative behavior that avoids aggressive retries that worsen rate limiting.

### FR-3 Freshness API Contract

- FR-3.1 Activities and analytics API responses shall include freshness metadata.
- FR-3.2 Freshness metadata shall include last successful sync timestamp, latest attempt timestamp, latest attempt status, and latest failure category when available.
- FR-3.3 Existing API consumers shall continue to receive backwards-compatible freshness fields where possible.
- FR-3.4 Backend schema changes shall regenerate `backend/api/openapi.json` and `frontend/src/api/contracts/schema.d.ts`.

### FR-4 Dashboard Freshness Display

- FR-4.1 The dashboard shall display the last successful sync timestamp when one exists.
- FR-4.2 The dashboard shall not show only "unavailable" when prior valid sync metadata exists.
- FR-4.3 The dashboard shall visually distinguish fresh, stale, failed, and unavailable data states.
- FR-4.4 The dashboard shall show a concise explanation for rate-limited Garmin sync failures.

### FR-5 Activity Detail Recovery

- FR-5.1 If an activity listed on the dashboard cannot be loaded in detail, the activity detail page shall show a clear error state.
- FR-5.2 The error state shall include a primary action to return to the main dashboard.
- FR-5.3 The error state shall include last successful sync timestamp when available.
- FR-5.4 The error state shall avoid dead-end navigation and shall preserve normal browser back behavior.
- FR-5.5 Activity detail should attempt API-backed loading first. Static fallback may be used only when the exact activity ID can be confidently resolved; otherwise the page shall show the recoverable error state with the main dashboard action.

### FR-6 Observability and Operations

- FR-6.1 Sync failures shall be logged with error category, timestamp, and safe diagnostic context.
- FR-6.2 Logs shall not expose Garmin secrets, OAuth tokens, or private credentials.
- FR-6.3 GitHub Actions sync failures shall make the failure category visible in job logs.
- FR-6.4 A lightweight JSON sidecar status artifact shall be generated so deployed frontend/API surfaces can report last attempt status without requiring an immediate database migration.

## 11. Non-Functional Requirements

- NFR-1 Reliability: A failed Garmin sync must not corrupt or remove previously valid data.
- NFR-2 Trust: The UI must communicate stale or failed data states plainly, without implying data is fresh when it is not.
- NFR-3 Privacy: Credentials, tokens, and private Garmin auth details must never be exposed in frontend bundles, logs, or test fixtures.
- NFR-4 Compatibility: Changes must preserve the existing React/FastAPI architecture, `/api/v1` routes, generated OpenAPI types, and static data fallback behavior.
- NFR-5 Testability: Rate-limit, missing-data, stale-data, and activity-not-found states must be covered by automated tests.

## 12. Success Metrics

- Activity detail page provides a recoverable error state for 100% of unable-to-load cases.
- Dashboard freshness never shows "unavailable" when a last successful sync timestamp exists.
- Garmin HTTP 429 failures are classified as rate limited in logs and surfaced freshness metadata.
- Failed sync attempts do not modify last-known-good activity data.
- Backend and frontend contract tests pass after freshness schema changes.

Counter-metrics:

- Do not hide real sync failures by showing old data as fresh.
- Do not increase Garmin rate-limit frequency through aggressive retry behavior.
- Do not add manual maintenance steps that make routine deployment fragile.

## 13. Acceptance Criteria

- AC-1 Given a previous successful sync exists, when a new Garmin sync fails with HTTP 429, then the app still exposes the previous last successful sync timestamp and marks the latest attempt as failed/rate limited.
- AC-2 Given no successful sync exists, when the UI requests freshness metadata, then the UI shows no successful sync available instead of a misleading timestamp.
- AC-3 Given a dashboard-listed activity cannot be loaded from the activity detail route, then the page displays an unable-to-load state with a main dashboard action.
- AC-4 Given a failed Garmin sync, then existing activity data, generated assets, and static fallback data are not deleted or overwritten by partial failure output.
- AC-5 Given backend freshness schema changes, then OpenAPI output, generated frontend types, frontend adapters, and contract tests are updated in the same change.
- AC-6 Given the GitHub Actions sync job fails due to Garmin 429, then job logs show a safe rate-limit classification and no secrets.
- AC-7 Given the last successful sync is older than the configured stale threshold, then the dashboard and activity detail failure state display a stale-data warning even if the latest sync attempt did not hard-fail.
- AC-8 Given a sync attempt completes or fails, then `data/sync-status.json` contains all required fields with valid enum values and ISO 8601 timestamps or `null`.

## 14. Testing Requirements

- Backend unit tests for sync status persistence and failure classification.
- Backend API contract tests for freshness metadata on activities and analytics responses.
- Frontend tests for dashboard freshness states: fresh, stale, failed/rate-limited, unavailable.
- Frontend activity detail tests for unable-to-load state and dashboard navigation action.
- Regression test that a failed sync preserves last successful sync timestamp.
- Regression test that generated frontend API types are refreshed after backend schema changes.
- Contract test for `data/sync-status.json` shape, enum values, timestamp parsing, and secret-free `message` content.

## 15. Implementation Decisions

- Sync status shall initially be stored in a small JSON sidecar status artifact. SQLite persistence can be added later if operational needs require it.
- GitHub Actions may publish/deploy when sync fails if previous valid data exists, but the deployed freshness state must clearly show failed/stale status.
- Stale-data warning threshold shall be configurable, defaulting to 48 hours.
- This PRD shall not replace `garth`; it shall isolate the current Garmin integration and improve error handling first. A library migration can be planned as a follow-up if stabilization is insufficient.

## 16. References

- Garth documentation notes the library is deprecated/no longer maintained: https://garth.readthedocs.io/
- Recent Garmin Connect 429 reports exist in Garmin-related API tooling discussions, including `python-garminconnect`: https://github.com/cyberjunky/python-garminconnect/issues/337
- Garmin Developer Portal documents official Garmin Connect API program access: https://developerportal.garmin.com/developer-programs/connect-developer-api
