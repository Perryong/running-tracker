# Pitfalls Research

**Domain:** Running tracker revamp (typed API boundaries + Garmin heart-rate analytics)
**Researched:** 2026-03-21
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: “Typed frontend” with untyped backend payload drift

**What goes wrong:**
Frontend TypeScript models look strict, but backend responses (or generated JSON) drift silently. UI compiles while runtime breaks (missing fields, null heart-rate values, changed casing like `Run` vs `running`).

**Why it happens:**
Types are defined separately on each side without a shared contract or runtime validation at the boundary.

**How to avoid:**
- Define a single canonical schema for activity payloads (including HR metrics/zone summaries).
- Generate TS types from schema (or generate both Python + TS models from one source).
- Add runtime validation in backend response serialization and frontend API client decoding.
- Version API contracts (`/v1`) before introducing breaking field changes.

**Warning signs:**
- Frequent UI guards like `if (x && x.y && x.y.z)`.
- Hotfixes for “undefined in chart” or “NaN pace/HR”.
- Same concept represented multiple ways (`moving_time` string vs numeric seconds).

**Phase to address:**
**Phase 1 — Contract Baseline & Typed Boundary Foundation**

---

### Pitfall 2: Treating Garmin summary HR as complete analytics data

**What goes wrong:**
Heart-rate zone/trend analytics are built from summary fields only (`averageHR`) and produce misleading insights (no zone distribution, no time-in-zone confidence, poor trend quality).

**Why it happens:**
Summary DTO data is easy to consume; full FIT stream parsing and per-sample processing is more work.

**How to avoid:**
- Explicitly define required HR analytics inputs (sample-level HR, timestamps, activity duration, optional resting/max HR profile).
- Use FIT-derived streams for zone calculations; treat summary HR as fallback only.
- Mark confidence level on each computed metric (e.g., `derived_from: "samples" | "summary"`).

**Warning signs:**
- “Zone trend” equals smoothed average HR only.
- Missing or identical zone distribution across many activities.
- Analytics disappear for activities without average HR.

**Phase to address:**
**Phase 2 — Garmin Data Normalization & HR Signal Pipeline**

---

### Pitfall 3: Zone model ambiguity (max HR / LTHR / reserve) causing incorrect insights

**What goes wrong:**
Zone calculations look polished but are physiologically wrong because the app mixes zone systems or hardcodes one model for all activities.

**Why it happens:**
Teams jump to charts before defining zone methodology and user profile assumptions.

**How to avoid:**
- Choose one default zone method for v1 and document formula precisely.
- Store method metadata with each computed result (`zone_method`, thresholds, profile version).
- Recompute historical zones when method/profile changes.
- Add UI disclosure: “Zones based on [method] and profile as of [date].”

**Warning signs:**
- Same effort appears in different zones week-to-week without profile change.
- Manual calculations don’t match app output.
- No persisted metadata for how zones were computed.

**Phase to address:**
**Phase 2 — Garmin Data Normalization & HR Signal Pipeline**

---

### Pitfall 4: Timezone and timestamp normalization errors corrupt trend analytics

**What goes wrong:**
Daily/weekly HR trends are shifted, duplicated, or dropped due to inconsistent UTC/local conversions and DST handling.

**Why it happens:**
Legacy scripts often use ad-hoc offset arithmetic; analytics later assumes canonical UTC timestamps.

**How to avoid:**
- Define canonical storage: UTC timestamps + explicit local timezone fields.
- Normalize all ingest paths to the same datetime strategy.
- Add regression tests around DST transitions and travel scenarios.
- Derive “training day” from localized timestamp at query time, not ingest-time string formatting.

**Warning signs:**
- Activity appears on wrong day in dashboard.
- Weekly totals differ between summary and detail views.
- Inconsistent use of `start_date` vs `start_date_local`.

**Phase to address:**
**Phase 2 — Garmin Data Normalization & HR Signal Pipeline**

---

### Pitfall 5: Non-idempotent sync and duplicate ingestion

**What goes wrong:**
Re-sync operations create duplicate activities or partial overwrites, distorting trends and causing “jumping” charts.

**Why it happens:**
Incremental sync logic based on filenames/IDs is brittle; no strict unique constraints or deterministic upsert rules.

**How to avoid:**
- Make ingestion idempotent: unique key by Garmin activity ID + source.
- Implement deterministic upsert policy (immutable raw + versioned derived metrics).
- Track sync checkpoints and audit logs.
- Add reconciliation job: detect duplicates and metric mismatches.

**Warning signs:**
- Activity count changes unexpectedly after re-sync.
- Same Garmin activity displayed twice with different computed zones.
- Manual DB cleanups become routine.

**Phase to address:**
**Phase 2 — Garmin Data Normalization & HR Signal Pipeline**

---

### Pitfall 6: Rate-limit and transient API failures silently creating data gaps

**What goes wrong:**
Garmin API throttling/network failures produce partial imports; pipeline “succeeds” but analytics are based on incomplete windows.

**Why it happens:**
Retry logic is shallow and failure accounting is weak (errors printed, not surfaced as failed sync state).

**How to avoid:**
- Add exponential backoff with jitter for 429/5xx.
- Persist per-activity sync status (`pending`, `downloaded`, `parsed`, `failed`).
- Fail run status when failures exceed threshold; expose in admin/CLI output.
- Re-queue failed downloads automatically.

**Warning signs:**
- “Sync complete” with lower-than-expected new activity count.
- Gaps in trend lines after days with known training.
- Logs show transient errors without retry summary.

**Phase to address:**
**Phase 2 — Garmin Data Normalization & HR Signal Pipeline**

---

### Pitfall 7: Breaking existing UX by coupling new analytics directly into page rendering

**What goes wrong:**
Adding HR analytics increases dashboard latency and causes flaky renders because heavy computation runs in request/render path.

**Why it happens:**
Revamp work prioritizes visible features first; compute caching/materialization is delayed.

**How to avoid:**
- Separate raw ingest from derived metric computation.
- Precompute and cache trend aggregates (daily/weekly/monthly).
- Keep UI endpoints read-optimized and stable.
- Add loading/error states specifically for analytics cards.

**Warning signs:**
- Dashboard render time spikes after analytics launch.
- Frontend triggers multiple expensive API calls per view.
- Charts flicker between empty and populated states.

**Phase to address:**
**Phase 3 — API Performance Hardening & UX Integration**

---

### Pitfall 8: Insecure handling of Garmin secrets during typed API rollout

**What goes wrong:**
Secrets leak via logs, config files, frontend bundles, or error payloads while integrating new API layers and debug tooling.

**Why it happens:**
Local scripts originally designed for single-user CLI workflows are reused in web/API contexts without hardened secret boundaries.

**How to avoid:**
- Keep Garmin secrets server-side only; never expose via frontend env vars.
- Redact tokens in logs and error traces.
- Store secrets in environment/secret manager; remove plaintext fallback over time.
- Add secret-scanning in CI and pre-commit checks.

**Warning signs:**
- `GARMIN_SECRET` appears in logs or client responses.
- Credentials stored in tracked files (`secret.txt`, sample config with real values).
- Debug endpoints return upstream request headers.

**Phase to address:**
**Phase 1 — Contract Baseline & Typed Boundary Foundation**

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep `activities.json` as the primary API contract | Fast UI iteration | Locks app into file-shape drift and weak type guarantees | Only for temporary parity snapshots during migration |
| Compute HR zones in frontend | Quick chart prototyping | Inconsistent logic across clients, impossible to trust analytics | Never for authoritative metrics |
| “Patch” missing HR with zero/null silently | Avoids crashes | False trends and user mistrust | Only if clearly labeled as missing and excluded from aggregates |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Garmin Connect sync | Assuming complete data after first successful call | Treat sync as multi-stage job with completion/failure accounting |
| FIT/GPX processing | Mixing summary-level and sample-level metrics without provenance | Attach provenance metadata to every computed metric |
| Frontend ↔ backend typed APIs | TS interfaces only on frontend, no runtime validation | Shared schema + generated types + runtime validators |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| On-demand recomputation of all historical HR trends | Slow dashboard/API timeouts | Incremental materialization by activity/date | Noticeable at ~500+ activities |
| N+1 detail fetches for dashboard cards | Multiple API calls per page, UI jitter | Aggregate endpoint for dashboard + client caching | Noticeable immediately on slower networks |
| Large payload transfer of full polylines + HR samples to list views | High bandwidth and render lag | Summary endpoints for list, detail endpoint for deep view | ~1k+ activities or mobile clients |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Logging raw Garmin auth headers/tokens | Credential compromise | Centralized log redaction + strict logging policy |
| Exposing backend sync controls without auth | Unauthorized sync/data tampering | Gate sync/admin endpoints behind local-only auth |
| Returning stack traces with file paths/secrets | Information leakage | Structured error responses + secure exception handling |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing zone charts without confidence/explanation | User distrust of analytics | Display method + data quality badges |
| Mixing units/definitions across pages (pace/speed/HR zones) | Cognitive overload and misread trends | Consistent metric dictionary and unit formatter |
| Hiding missing-data cases | Confusing “flat” trends | Explicit empty states (“No HR samples for this period”) |

## "Looks Done But Isn't" Checklist

- [ ] **Typed API:** Shared schema exists, but runtime validation enforced on both ingress and egress.
- [ ] **HR zones:** Charts render, but calculations are based on sample-level data with stored methodology metadata.
- [ ] **Sync reliability:** Manual sync works once, but retries/idempotency/reconciliation are tested.
- [ ] **Trend accuracy:** Visuals look correct, but DST/travel/date-boundary tests pass.
- [ ] **Security:** Local setup works, but secrets are redacted and excluded from client-visible config.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Contract drift in typed APIs | MEDIUM | Freeze schema, add compatibility layer, run payload diff tests, migrate clients |
| Incorrect historical zone calculations | HIGH | Version zone method, backfill derived metrics, annotate changed history in UI |
| Duplicate/partial sync corruption | MEDIUM | Build dedupe + reconciliation script, reprocess raw source files, verify aggregates |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Untyped payload drift | Phase 1 | Contract tests + runtime validator failures monitored |
| Zone model ambiguity | Phase 2 | Golden test cases for zone outputs from known inputs |
| Timestamp normalization errors | Phase 2 | DST/travel integration tests + date-bucket consistency checks |
| Non-idempotent sync | Phase 2 | Repeat sync produces zero net changes after first success |
| Runtime UX/perf regressions | Phase 3 | Dashboard p95 latency + render stability thresholds met |
| Secret leakage | Phase 1 | Secret scan passes + no sensitive values in logs/errors |

## Sources

- Internal project context: `.planning/PROJECT.md` (milestone scope and constraints)
- Repository inspection:
  - `backend/run_page/garmin_sync.py` (Garmin sync behavior, retry/error handling, summary extraction)
  - `backend/run_page/utils.py` (time conversion helpers, activity generation flow)
  - `frontend/src/static/activities.json` (current data shape examples and type inconsistencies)
  - `backend/main.py` (credential handling paths)
- Confidence note: external web verification was not available in this run; domain patterns are based on codebase evidence + established engineering practices.

---
*Pitfalls research for: Running tracker revamp (typed API boundaries + Garmin HR analytics)*
*Researched: 2026-03-21*
