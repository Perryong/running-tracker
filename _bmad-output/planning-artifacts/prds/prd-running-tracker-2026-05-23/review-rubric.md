# PRD Quality Review — Data Refresh Reliability and Activity Detail Recovery

## Overall verdict

The PRD is adequate and close to implementation-ready for a production-grade reliability fix. It has a clear problem, concrete failure evidence, scoped non-goals, measurable acceptance criteria, and useful operational requirements. The main risk is that two implementation-critical contracts are still under-specified: the JSON sync-status artifact shape/path, and the exact frontend behavior when activity detail data cannot be loaded.

## Decision-readiness — adequate

The PRD makes several decisions explicitly in §13: JSON sidecar first, deploy can continue on failed sync with stale state, stale threshold defaults to configurable 48 hours, and `garth` replacement is deferred. These are enough for architecture and story creation to proceed.

### Findings

- **high** Specify the sync-status artifact contract (§8 FR-6.4, §13) — The PRD chooses a JSON sidecar artifact but does not define its path, required fields, timestamp format, or ownership. This is a build-blocker because backend, frontend, CI, and tests need the same contract. *Fix:* Add a "Sync Status Artifact Contract" section with path, fields, allowed enum values, ISO timestamp requirement, and write/read ownership.
- **medium** State deployment behavior more testably (§13) — "may publish/deploy" leaves CI behavior open. *Fix:* Define the minimum deployment rule: publish is allowed only when previous valid data and status artifact are present; otherwise fail the deploy or publish an explicit no-data state.

## Substance over theater — strong

The PRD is grounded in a real traceback and current product behavior. Non-goals are practical, and the PRD avoids pretending to solve Garmin availability or deprecated library migration in the same scope.

### Findings

_None._

## Strategic coherence — strong

The thesis is coherent: keep last-known-good data trustworthy, make sync failures visible, and prevent dead-end activity detail states. Requirements, success metrics, and counter-metrics all support that thesis.

### Findings

_None._

## Done-ness clarity — adequate

Most FRs have testable consequences, and AC-1 through AC-6 cover the highest-risk behavior. The remaining ambiguity sits in activity detail fallback and the data artifact contract.

### Findings

- **high** Clarify activity detail recovery contract (§7, §8 FR-5, §11 AC-3) — The user requested "go back to the main dashboard," while FR-5.5 says activity detail may fall back to static activity data. The PRD should state which behavior is primary and when fallback is allowed. *Fix:* Add a rule that the primary failure action is return to dashboard, and static fallback may only be used when it can confidently resolve the exact activity ID.
- **medium** Make the 48-hour stale threshold acceptance-testable (§13) — The default is stated, but no AC checks it. *Fix:* Add an AC that data older than the configured threshold displays a stale warning even if the latest sync did not hard-fail.

## Scope honesty — strong

The PRD is honest about deferring full Garmin integration replacement and multi-user auth. It does not hide the risk from deprecated `garth`.

### Findings

_None._

## Downstream usability — adequate

FR IDs and AC IDs are stable and mostly usable for story generation. The PRD would benefit from a small glossary because "freshness," "last successful sync," "latest attempt," and "stale" are contract terms.

### Findings

- **medium** Add a short glossary for freshness terms (§7-§13) — Several terms carry implementation meaning but are not defined in one place. *Fix:* Add a "Glossary" section defining last successful sync, latest sync attempt, freshness state, stale, rate limited, and JSON sidecar status artifact.

## Shape fit — strong

The PRD uses the right shape for a brownfield reliability/platform capability: capability requirements, operational behavior, acceptance criteria, and non-goals. It appropriately avoids heavyweight user journeys.

### Findings

_None._

## Mechanical notes

- No `[ASSUMPTION]` tags remain after the decision audit.
- FR and AC numbering is contiguous.
- References are present, but the PRD should avoid depending on external unofficial Garmin tooling behavior as normative; use it only as supporting context.
