---
phase: 1
slug: typed-api-foundation
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-21
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x + httpx + pytest-asyncio |
| **Config file** | `backend/pytest.ini` |
| **Quick run command** | `cd backend && python -m pytest tests/api/test_contracts.py tests/api/test_freshness.py -q -x` |
| **Full suite command** | `cd backend && python -m pytest tests -q` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && python -m pytest tests/api/test_contracts.py tests/api/test_freshness.py -q -x`
- **After every plan wave:** Run `cd backend && python -m pytest tests -q`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | API-01 | integration/contract | `cd backend && python -m pytest tests/api/test_contracts.py -q -x` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | API-02 | integration | `cd backend && python -m pytest tests/api/test_freshness.py -q -x` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | API-01 | artifact validation | `cd backend && python api/export_openapi.py && python -c "import json;json.load(open('api/openapi.json','r',encoding='utf-8'));print('ok')"` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | API-01 | build/contract-usage | `cd frontend && pnpm run generate:api-types && pnpm run build` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 2 | API-02 | build/integration | `cd frontend && pnpm run build` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 2 | API-01 | build/bootstrap | `cd frontend && pnpm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/api/test_contracts.py` — stubs/contract checks for API-01
- [ ] `backend/tests/api/test_freshness.py` — freshness checks for API-02
- [ ] `backend/tests/conftest.py` — shared API fixtures and app client
- [ ] `backend/pytest.ini` — test discovery/markers baseline
- [ ] `backend/api/openapi.json` — generated OpenAPI artifact for frontend typegen

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
