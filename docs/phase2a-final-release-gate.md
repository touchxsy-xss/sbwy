# Phase 2A Final Release Gate

## Baseline

Commit SHA: `cdf704d99f7d0bf5c03ac311d75502df5eb5c983`.

The gate started at that exact commit. The worktree already contained 20 generated `dist/pages/*.html` cache-version changes. They were preserved, never staged, and are not part of this release-gate change.

## Environment

- Node.js: `v20.19.2` on the Raspberry Pi validation host.
- PostgreSQL: `16.14` in `server-postgres-1`.
- OS: Linux `6.18.39+rpt-rpi-v8`, `aarch64`.
- Validation directories/databases were isolated under `/tmp/shengbian-phase2a-final-*`, `shengbian_phase2a_final_zero_20260923`, and `shengbian_phase2a_final_incremental_20260923`. `shengbian_dev` and its volume were not dropped, reset, or modified.

## Results

| Gate | Result | Evidence |
| --- | --- | --- |
| Fresh PostgreSQL Migration | PASS | Fresh zero database applied all 3 migrations without manual DDL. It contains `audit_logs`, all five Phase 2A tables, `btree_gist`, the composite house/unit FK, and both relationship exclusion constraints. |
| Phase 1 to Phase 2 Migration | PASS | A separate empty database was first migrated using commit `2a9d741` (2 migrations), then current code applied only the third migration. Final migration count: 3; five Phase 2A tables and `btree_gist` exist. |
| Cold Start | PASS | Fresh-database dependency install, Raspberry Pi TypeScript build, stopped-state `pnpm run start`, Fastify bind, and external health request succeeded. |
| Health Probe | PASS | Final stopped-state start returned `{"data":{"status":"ok","service":"shengbian-property-server"}}`. The temporary process was stopped afterward. |
| PostgreSQL Integration Tests | PASS | Phase 2A release suite: `48/48` pass on the fresh migrated database. Existing Phase 1 PostgreSQL suite: `1/1` pass, run separately against the same fresh migrated database. |
| Historical Person Write Scope | PASS | Tests 31-35 prove A1 history is readable only through authorized house history, A1 cannot patch/disable a historical-only person, and A2 current manager/company admin can manage it. |
| SAME USER Cross-Tenant | PASS | Tests 7-8 prove the same user can map to one Person in A and one in B, but cannot map to a second Person in the same company. |
| Houses Pagination | PASS | Tests 36-38 and 47 cover pages, scope-safe totals, and deterministic cross-community code ordering with UUID tie-breakers. |
| People Pagination | PASS | Tests 39-41 and 46 cover items/total agreement, scoped totals, validation, and deterministic same-name UUID ordering. |
| Atomic Audit | PASS | Tests 42-43 cover success and validation rollback. Test 45 installs a temporary PostgreSQL audit trigger that rejects `PERSON_CREATED`; the API returns 500 and both Person and audit rows roll back. |
| Audit Scope | PASS | Tests 42 and 44 verify tenant/community attribution and redaction. Test 48 verifies that no public audit list or ID endpoint exists, so an A caller has no route to enumerate or fetch B audit rows. |
| API Contract | PASS | Generated from current routes: `docs/phase2a-api-contract.md`. |
| Database Schema Snapshot | PASS | Generated from current schema/migrations: `docs/phase2a-database-schema.md`. |
| Bootstrap Verification | PASS | The documented root workflow was exercised with `pnpm --dir server install --ignore-workspace`, `server/.env`, migration, seed, build, start, health, and separately sequenced PostgreSQL suites. |
| Existing Regression | PASS | Local server TypeScript build passed; server memory tests passed `6/6`; frontend tests passed `8/8`; frontend build passed. |

## Environment And Deployment Verification

`.env.example` matches `server/src/config/env.ts`; no real credential was added or recorded.

| Classification | Variables |
| --- | --- |
| Required at runtime | `DATABASE_URL`, `SESSION_SECRET`; production should explicitly set `APP_ORIGIN` |
| Optional runtime | `NODE_ENV`, `HOST`, `PORT`, `COOKIE_SECURE` |
| Test-only / seed-only | `SEED_ADMIN_PASSWORD`, `SEED_MANAGER_PASSWORD`, `SEED_ENGINEER_PASSWORD`, `SEED_B_ADMIN_PASSWORD` |
| Development/container-only | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` |
| Production-sensitive | `DATABASE_URL`, `SESSION_SECRET`, `COOKIE_SECURE`, `APP_ORIGIN` |

## Blockers

None unresolved.

The gate found and fixed two blockers after the requested baseline:

1. Phase 2A ordinary mutations wrote business data before their audit row. They now use a repository transaction, and a real forced-audit-failure test proves rollback.
2. Offset pagination did not have a deterministic UUID tie-breaker. Houses now order by community/building/unit/code/id and people by name/id; real PostgreSQL tests cover both tie cases.

## Non-Blocking Risks

1. Offset pagination is deterministic for a stable query result but, like any offset design, rows can move between pages if data changes between requests. Cursor pagination is a future API-versioning concern, not a Phase 2A freeze blocker.
2. There is intentionally no public audit-query API. Future audit browsing must add explicit tenant/community-scoped repository queries and integration coverage rather than exposing raw audit IDs.
3. Phase 1 and Phase 2 PostgreSQL suites share seeded identities and therefore must run sequentially, as documented in `server/README.md`; running them together in one Node test invocation causes session interference.

## Files Changed

- `server/src/app.ts`, `server/src/db/repository.ts`, `server/src/db/memory.ts`, `server/src/shared/types.ts`: transactional Phase 2A business-write and audit boundary.
- `server/tests/postgres-phase2-integration.test.ts`: forced audit failure, deterministic pagination, and absent public audit surface tests.
- `server/README.md`: reproducible server bootstrap and isolated PostgreSQL suite commands.
- `docs/phase2a-api-contract.md`, `docs/phase2a-database-schema.md`, and this report: frozen release documentation.

## Final Decision

PASS
