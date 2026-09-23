# Phase 2B Work Order / Repair Workflow Report

## Scope

Implemented the backend-only work-order foundation on branch
`codex/phase2b-work-orders`. The Phase 2A frozen contracts and resident Demo
Store remain unchanged.

## Domain and State Machine

- `work_orders` is tenant-owned and references the Phase 2A company,
  community, house, person, user, and house relationship IDs.
- Contact and location snapshots are persisted at creation time.
- States are `PENDING_DISPATCH`, `ASSIGNED`, `ACCEPTED`, `ARRIVED`,
  `COMPLETED`, `ARCHIVED`, and `CANCELLED`.
- Only `PENDING_DISPATCH -> ASSIGNED -> ACCEPTED -> ARRIVED -> COMPLETED ->
  ARCHIVED` and cancellation from `PENDING_DISPATCH` or `ASSIGNED` are valid.
- `work_order_events` is append-only from application code; mutations also
  write the existing audit log in the same transaction.

## Implemented

- Migration `server/drizzle/0003_phase2b_work_orders.sql` and Drizzle snapshot.
- Work-order enums, tables, foreign keys, private-house check, unique order
  number, and query indexes.
- Seed permissions and role mappings for property admins, community managers,
  property staff, and engineers.
- Repository scope, pagination, assignment, transition validation, event
  history, snapshots, and audit coupling.
- Fastify routes for create, list, detail, assign, transition, cancel, and
  event history.
- API and database contract documents.
- PostgreSQL integration test suite covering creation, scope, assignment,
  state transitions, event history, verified requester relationship, and
  mandatory-audit rollback.

## Verification

| Check | Result |
| --- | --- |
| Server TypeScript build | PASS |
| Server unit/auth tests | PASS (6 passed; PostgreSQL suites skipped without opt-in) |
| Drizzle schema check | PASS |
| Existing frontend tests | PASS (8/8) |
| Existing frontend build | PASS |
| PostgreSQL Phase 1/2A/2B integration | NOT RUN: no local PostgreSQL or Docker daemon available in this environment |
| Fresh migration and upgrade migration | NOT RUN: requires PostgreSQL |
| Raspberry Pi database verification | NOT RUN: no remote database execution was available |

The PostgreSQL suite is intentionally not reported as passing until it has
been run against PostgreSQL 16 with migrations applied from zero and from the
Phase 2A baseline. No mock database is used as a substitute.

## Files

- `docs/phase2b-work-order-design.md`
- `docs/phase2b-api-contract.md`
- `docs/phase2b-database-schema.md`
- `server/src/db/schema/index.ts`
- `server/src/db/repository.ts`
- `server/src/shared/types.ts`
- `server/src/app.ts`
- `server/src/db/seed.ts`
- `server/drizzle/0003_phase2b_work_orders.sql`
- `server/tests/postgres-phase2b-work-order.test.ts`

## Known Limitation

Resident frontend authentication and UI migration are deliberately outside
this phase. The API accepts a formally scoped requester person and relationship
and is ready for the later resident-session integration.
