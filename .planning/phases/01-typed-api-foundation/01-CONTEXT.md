# Phase 1: Typed API Foundation - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish a stable typed frontend/backend API boundary for activity and analytics reads, including explicit freshness/completeness metadata. This phase defines contracts and migration foundations; it does not add new user-facing analytics capability beyond exposing reliable data shape and freshness state.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone Scope & Contracts
- `.planning/ROADMAP.md` — Phase 1 goal, requirements mapping, and success criteria that define this boundary.
- `.planning/REQUIREMENTS.md` — API-01 and API-02 requirement definitions and expected outcomes.
- `.planning/PROJECT.md` — Core value, constraints, and stack boundaries (React/Vite + Python, incremental modernization).

### Research Guidance
- `.planning/research/STACK.md` — Recommended typed API stack and integration guidance.
- `.planning/research/ARCHITECTURE.md` — Incremental migration approach and integration points.
- `.planning/research/PITFALLS.md` — Contract drift, provenance, and freshness-risk prevention guidance.
- `.planning/research/SUMMARY.md` — Consolidated sequencing and dependency rationale.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/hooks/useActivities.ts`: Existing centralized activity data hook can be evolved behind a typed API client boundary.
- `frontend/src/pages/index.tsx`: Simple entry wiring pattern can remain while underlying data source transitions.
- `backend/main.py`: Existing CLI orchestration is a source for sync/freshness signals and should remain operational during API introduction.

### Established Patterns
- Frontend currently relies on static JSON imports (`@data/activities.json`) in hooks/components; this coupling must be replaced gradually.
- Backend is CLI-first (argparse + sync/generation commands), with no current HTTP API framework present.
- Current flow favors preprocessed/shared artifacts; typed API should initially mirror existing shape to reduce disruption.

### Integration Points
- Introduce backend API layer under `backend/` without breaking current `main.py` sync/generation workflows.
- Introduce frontend API client/hooks layer under `frontend/src` and route existing consumers through it incrementally.
- Freshness metadata should connect to Garmin sync pipeline outputs and be exposed on API read responses.

</code_context>

<specifics>
## Specific Ideas

- Prefer low-risk, incremental migration over big-bang rewrite.
- Keep stack constraints intact while modernizing contracts.
- Prioritize trust signals (freshness/completeness) as first-class contract data.

</specifics>

<deferred>
## Deferred Ideas

- Detailed dashboard UX redesign decisions (Phase 2).
- Activity detail interaction/layout refinements (Phase 3).
- Heart-rate zone/trend rendering behaviors and methodology UI details (Phase 4).

</deferred>

---

*Phase: 01-typed-api-foundation*
*Context gathered: 2026-03-21*
