# Phase 2B PostgreSQL Final Release Gate

## Baseline

- Candidate commit: `63f04637845cd1bc6937b83920dc6db066001acf`
- Branch: `codex/phase2b-work-orders`
- Phase 2A frozen baseline: `cd9c7ebb72e6e85b2f37984555b3d652635b2ac6`
- Working tree was clean at the start of the gate.

The gate required one test-contract correction: the Phase 2B test expected the
wrong masked suffix for `13312345678`. The implementation follows the frozen
Phase 2A rule (`first three digits + last four digits`), so the expected value
was corrected to `133****5678`. The same change added explicit illegal
transition and snapshot immutability coverage. No product behavior changed.

## Environment

- OS: Raspberry Pi Linux `6.18.39+rpt-rpi-v8`
- Architecture: `aarch64`
- Node: `v20.19.2`
- Package manager: `pnpm 10.15.1`
- PostgreSQL: `16.14` (Docker container)
- Candidate checkout: `/tmp/shengbian-phase2b-release-63f0463b`

No production worktree, database, or PostgreSQL volume was deleted or reset.

## Results

| Gate | Result | Evidence |
| --- | --- | --- |
| Fresh PostgreSQL Migration | PASS | Fresh database migrated from 0000 through 0003; migration ledger contains 4 entries. |
| Phase 2A -> Phase 2B Upgrade Migration | PASS | Phase 2A-only schema and seed/fixture upgraded by 0003; Phase 2A counts remained: companies 2, communities 3, users 5, buildings 4, houses 4, people 7, relationships 7. |
| Phase 1 PostgreSQL Regression | PASS | 1/1 real PostgreSQL integration test. |
| Phase 2A PostgreSQL Regression | PASS | 48/48 real PostgreSQL integration tests. |
| Phase 2B PostgreSQL Integration | PASS | 7/7 real PostgreSQL tests on both fresh and upgrade databases; no skipped tests. |
| Cold Start | PASS | Candidate backend started from a stopped state on Raspberry Pi using `pnpm` and the migrated fresh database. |
| Health Probe | PASS | `GET /api/v1/health` returned HTTP 200 with `status: ok`. |
| btree_gist / schema constraints | PASS | PostgreSQL reports the `btree_gist` extension; work-order foreign keys, private-house check, indexes, and enums exist in the fresh database. |

## State Machine

The implementation and design document define these meanings:

- `PENDING_DISPATCH`: created and waiting for property dispatch.
- `ASSIGNED`: assigned to an active same-company engineer in the work-order community.
- `ACCEPTED`: the assigned engineer has accepted the job; this is not property acceptance.
- `ARRIVED`: the assigned engineer has arrived on site.
- `COMPLETED`: the assigned engineer has completed the repair; it is not resident confirmation.
- `ARCHIVED`: an operator archives a completed order.
- `CANCELLED`: cancellation from `PENDING_DISPATCH` or `ASSIGNED` only.

Legal transitions were exercised through `ASSIGNED -> ACCEPTED -> ARRIVED ->
COMPLETED -> ARCHIVED`. Illegal `PENDING_DISPATCH -> COMPLETED` and
`ASSIGNED -> COMPLETED` transitions return HTTP 409 and create no transition
event. Community and tenant scope were exercised with A/B companies and A1/A2
communities.

## Security and Data Integrity

- Work orders and events carry mandatory tenant ownership and formal foreign keys.
- Private requests require a current, verified house relationship.
- Cross-tenant detail access returns not found; engineer assignment requires an active same-company engineer.
- Contact and location snapshots remain unchanged after the source person changes.
- Work-order mutation, event insertion, and audit insertion share a transaction. A forced audit failure rolled back the work order and event.
- No full phone number is written to audit payloads.

## Non-Blocking Boundary

Resident authentication and resident frontend migration remain intentionally
outside Phase 2B. The current backend accepts formally scoped requester IDs and
relationships and is ready for the later resident-session integration.

The local macOS shell did not have Node on `PATH`; after using the bundled Node,
the server TypeScript build passed. Local server test startup was blocked by
the existing macOS `argon2` native addon signature mismatch. This does not
invalidate the gate because the same candidate and dependencies ran the full
server suites on the Raspberry Pi Node 20 environment above. The frontend
regression remained green locally (8/8 tests and build).

## Files Changed For This Gate

- `server/tests/postgres-phase2b-work-order.test.ts`
- `docs/phase2b-final-release-gate.md`
- `docs/phase2b-work-order-report.md`

## Final Decision

**PASS**

The release gate is reproducible on PostgreSQL 16 with fresh and upgrade
migrations, real integration tests, and a cold-start health check. The final
Git commit containing this report is the release-gate commit reported with the
handoff.
