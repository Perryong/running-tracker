---
phase: 2
slug: dashboard-workflow-persistent-filters
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-21
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 + Testing Library |
| **Config file** | `frontend/vitest.config.ts` |
| **Quick run command** | `cd frontend && npm test -- src/features/dashboard/filters/*.test.ts` |
| **Full suite command** | `cd frontend && npm test` |
| **Estimated runtime** | ~50 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && npm test -- src/features/dashboard/filters/*.test.ts`
- **After every plan wave:** Run `cd frontend && npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | DASH-02, DASH-03 | integration | `cd frontend && npm test -- src/features/dashboard/filters/persistence.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | DASH-02 | integration | `cd frontend && npm test -- src/features/dashboard/filters/sharedFilterModel.test.tsx` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 1 | DASH-03 | integration | `cd frontend && npm test -- src/features/dashboard/filters/persistence.test.ts` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 2 | DASH-01 | component | `cd frontend && npm test -- src/features/dashboard/components/KpiCards.test.tsx` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 2 | DASH-01, DASH-02 | integration | `cd frontend && npm test -- src/features/dashboard/components/KpiCards.test.tsx && npm run build` | ❌ W0 | ⬜ pending |
| 2-02-03 | 02 | 2 | DASH-01 | integration | `cd frontend && npm run build` | ✅ | ⬜ pending |
| 2-03-01 | 03 | 3 | DASH-02, DASH-03 | integration | `cd frontend && npm test -- src/features/dashboard/filters/*.test.ts` | ❌ W0 | ⬜ pending |
| 2-03-02 | 03 | 3 | DASH-02, DASH-03 | integration | `cd frontend && npm test -- src/pages/index*.test.tsx src/pages/total*.test.tsx && npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/features/dashboard/filters/persistence.test.ts` — DASH-03 URL precedence/replay/sanitization
- [ ] `frontend/src/features/dashboard/filters/sharedFilterModel.test.tsx` — DASH-02 shared cross-view filter sync
- [ ] `frontend/src/features/dashboard/components/KpiCards.test.tsx` — DASH-01 KPI rendering + empty state
- [ ] `frontend/src/test/urlState.ts` — shared URL/history/localStorage test helpers (if needed)

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
