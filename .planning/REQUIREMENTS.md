# Requirements: Running Tracker Revamp (Milestone v1.0)

**Defined:** 2026-03-21
**Core Value:** Daily training review should feel effortless and visually clear, with trustworthy heart-rate-centric insights.

## v1 Requirements

### API Contracts

- [x] **API-01**: Frontend can consume activity and analytics data through a typed HTTP API contract generated from backend schemas
- [x] **API-02**: API responses expose explicit freshness metadata (last sync timestamp and data completeness flags)

### Dashboard & Navigation

- [x] **DASH-01**: User can view a modern dashboard with KPI cards for selected period (distance, duration, runs, average heart rate)
- [x] **DASH-02**: User can filter dashboard and detail views by date range and activity attributes using one shared filter model
- [x] **DASH-03**: User filter selections persist across navigation/reload

### Activity Detail UX

- [x] **ACT-01**: User can open an activity detail view with clear metric hierarchy (headline stats, pace, elevation, average HR)
- [x] **ACT-02**: Activity detail view supports loading, empty, and error states without broken layout

### Heart Rate Analytics

- [x] **HR-01**: User can view per-run heart rate zone breakdown (time and percentage by zone)
- [ ] **HR-02**: User can view weekly and monthly heart rate trend analytics based on Garmin-derived data
- [x] **HR-03**: Heart rate analytics clearly indicate zone methodology/provenance used for calculations

## Future Requirements

### Insight Layer (Deferred)

- **INS-01**: User can view rule-based heart-rate insight cards (e.g., zone distribution changes vs baseline)
- **INS-02**: User can view auto-classified run intensity/session labels
- **INS-03**: User can view aerobic efficiency trend (pace at comparable HR band)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Social/community features | Single-user personal tracker scope |
| Real-time live tracking/streaming | Not required for post-run review workflow |
| Multi-provider ingestion in this milestone | Garmin-first delivery and data-model stability first |
| Full backend framework rewrite | Keep React/Vite + Python stack; improve boundaries incrementally |
| Generative AI coaching chat | High trust/validation risk and not core to milestone value |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| API-01 | Phase 1 | Complete |
| API-02 | Phase 1 | Complete |
| DASH-01 | Phase 2 | Complete |
| DASH-02 | Phase 2 | Complete |
| DASH-03 | Phase 2 | Complete |
| ACT-01 | Phase 3 | Complete |
| ACT-02 | Phase 3 | Complete |
| HR-01 | Phase 4 | Complete |
| HR-02 | Phase 4 | Pending |
| HR-03 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✅

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 after roadmap creation for milestone v1.0*
