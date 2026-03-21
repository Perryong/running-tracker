# Feature Research

**Domain:** Single-user running tracker revamp (modern UX + heart-rate insights)
**Researched:** 2026-03-21
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist for this milestone. Missing these = revamp feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Modern dashboard with “today / last 7 days / this month” KPI cards (distance, duration, avg HR, runs count) | Milestone goal explicitly says daily review should feel effortless | MEDIUM | Build from existing `activities.json` model first, then wire to typed backend API; include loading/empty/error states |
| Clear navigation + filter model (date range, activity type, route/city) with state persistence | Existing app already has multiple views/filters; revamp should reduce friction, not add clicks | MEDIUM | Reuse existing filter primitives (`filterYearRuns`, `filterCityRuns`, `filterTitleRuns`) and unify into one filter state URL/query model |
| Activity detail panel redesign with readable hierarchy (headline metrics, pace, elevation, average HR) | Already a target feature in PROJECT.md; users expect quick scan + drill-down | MEDIUM | Keep map + table flow but add detail drawer/card stack; optimize for mobile and desktop |
| Heart-rate zone breakdown per run (time in zone + % of run) | Heart-rate-centric milestone: zone view is core expectation | HIGH | Requires deriving zones from Garmin HR data and showing consistent zone boundaries; zone definition transparency is required |
| Heart-rate trend view over time (weekly/monthly averages + zone minutes trend) | Core milestone requirement includes trend analytics | HIGH | Needs aggregation pipeline, smoothing options, and outlier-safe calculations |
| Data freshness and sync health indicators (“Last Garmin sync”, partial data warning) | Personal tracker must be trustworthy; stale data destroys insight confidence | LOW | Backend already has sync command; expose sync timestamp + ingestion warnings in UI |

### Differentiators (Competitive Advantage)

Features that make this revamp feel genuinely smarter for a single-user workflow.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Aerobic efficiency trend (pace at comparable HR band over time) | More actionable than raw pace or raw HR alone; shows fitness progress independent of route/day variance | HIGH | Needs normalization by HR band and optional route/elevation filters to avoid false conclusions |
| Card-based “HR insights feed” (e.g., “More Z4 this week vs baseline”, “long-run HR drift increased”) | Converts charts into quick decisions for next run | MEDIUM | Deterministic rule engine (not LLM) is sufficient for v1 and easier to trust/debug |
| Session classification tags (recovery / easy / threshold / hard) inferred from zone distribution | Fast retrospective understanding without manual tagging | MEDIUM | Start rule-based using zone percentages and run duration; allow override later if needed |
| Goal-oriented trend modules for personal routines (e.g., easy-run discipline score) | Strong fit for single-user product: optimize owner’s habits, not generic coaching | MEDIUM | Should be configurable per user profile, but keep local/single-profile only |

### Anti-Features (Commonly Requested, Often Problematic)

Features that look attractive but are wrong for this milestone/scope.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Social feed, likes, clubs, comments | “Modern fitness apps have social” | Explicitly out of scope (single-user), high complexity, no core-value gain | Export/share snapshot image of selected chart when needed |
| Real-time live tracking + live HR streaming | Feels advanced and “smartwatch-like” | Requires streaming infra and mobile/device integration not needed for post-run review | Focus on fast post-sync insights within minutes of Garmin sync |
| Multi-provider integration in v1 (Strava, Apple Health, Polar, Coros) | “More sources = better” | Data model explosion + mapping inconsistencies before core UX is stable | Garmin-first with clean importer interface for future adapters |
| Generative AI coaching chat | High hype/appeal | Adds hallucination/trust risk for training guidance; hard to validate correctness | Deterministic, evidence-based insight cards with visible calculation basis |

## Feature Dependencies

```
Typed activity + HR API contract
    └──requires──> HR zone model (zone boundaries + calculation rules)
                       └──requires──> clean Garmin ingestion + missing-data handling

HR zone model ──enables──> Per-run zone breakdown
Per-run zone breakdown ──enables──> Trend analytics
Trend analytics ──enables──> Insight cards + session classification

Unified filter/navigation state ──enhances──> Dashboard usability
Unified filter/navigation state ──enhances──> Activity detail discoverability

Multi-provider integration ──conflicts──> v1 Garmin-first delivery speed
Social features ──conflicts──> single-user scope
```

### Dependency Notes

- **HR trends require stable zone definitions first:** Without fixed zone boundaries, week-to-week comparisons become misleading.
- **Insight cards depend on validated trend metrics:** Narrative should be generated only from metrics already shown in charts.
- **Modern dashboard depends on unified filtering:** Otherwise KPI cards and detail views disagree, causing trust issues.
- **Typed API boundary is foundational:** Frontend UX improvements will regress quickly if contracts remain implicit/loose.

## MVP Definition

### Launch With (v1)

Minimum milestone slice that satisfies the revamp goal:

- [ ] Modern dashboard shell with persistent filters and quick KPI cards — core daily usability win
- [ ] Improved activity detail layout (headline metrics + HR section) — faster per-run review
- [ ] Per-run HR zone breakdown + baseline trend chart (weekly/monthly) — fulfills heart-rate analytics objective
- [ ] Data freshness/sync status UI — preserves trust in analytics

### Add After Validation (v1.x)

- [ ] Rule-based HR insight cards — add once baseline metrics are validated against personal expectations
- [ ] Session classification tags — add after reviewing false positives on real historical data
- [ ] Efficiency trend module (pace-at-HR) — add after zone model and filtering are proven stable

### Future Consideration (v2+)

- [ ] Multi-source ingestion (Strava/Apple/others) — only after Garmin-first model is robust
- [ ] Lightweight sharing/export workflows — only if used repeatedly
- [ ] Coach-like recommendation layer — only with strong validation safeguards

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Dashboard KPI + unified filtering/navigation | HIGH | MEDIUM | P1 |
| Activity detail UX redesign | HIGH | MEDIUM | P1 |
| Per-run HR zone breakdown | HIGH | HIGH | P1 |
| HR trend analytics (weekly/monthly) | HIGH | HIGH | P1 |
| Sync/freshness indicators | MEDIUM | LOW | P1 |
| Insight cards (rule-based) | MEDIUM-HIGH | MEDIUM | P2 |
| Session auto-classification | MEDIUM | MEDIUM | P2 |
| Efficiency trend (pace-at-HR) | HIGH | HIGH | P2 |
| Multi-provider ingestion | LOW (for this project) | HIGH | P3 |
| Social/community features | LOW (for this project) | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| HR zones on activity | Garmin Connect exposes HR zones tied to device/user settings | Strava offers HR-derived training surfaces for subscribers | Garmin-first transparent zone model with explicit boundaries shown in UI |
| Training trend interpretation | Garmin has readiness/load ecosystem (broad platform) | Strava uses trend-oriented health/fitness summaries | Narrow, personal workflow: fewer metrics, clearer explanations, faster review loop |
| Navigation/dashboard UX | Multi-surface apps (mobile/web/device) with high complexity | Strong feed model but social-first orientation | Single-user dashboard optimized for daily self-review, not feed engagement |

## Sources

- Project context and milestone scope: `.planning/PROJECT.md` (HIGH)
- Existing capability baseline (current pages/components/data fields):  
  - `frontend/src/pages/total.tsx`  
  - `frontend/src/utils/utils.ts`  
  - `frontend/src/static/activities.json` (HIGH)
- Garmin support (heart-rate zones): https://support.garmin.com/en-US/?faq=s3HqdKNtWV1NYrK16eFcc7 (MEDIUM-HIGH)
- Strava support/features pages checked for ecosystem reference, but article routing/titles were inconsistent in fetch results; used only as directional context (LOW)

---
*Feature research for: running tracker revamp milestone*
*Researched: 2026-03-21*
