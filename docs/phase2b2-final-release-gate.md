# Phase 2B.2 Final Release Gate

## Baseline

- Phase 2B.1 frozen baseline: `6574972edd1332971c1343b2294eb5a23b342ae0`
- Development branch: `codex/phase2b2-resident-workorder-frontend`
- This report records the result before any backend contract change.

## Verified Results

| Gate | Result | Evidence |
| --- | --- | --- |
| Frontend build | PASS | `pnpm build` completed with 20 templates. |
| Existing frontend unit tests | PASS, 8/8 | `pnpm test`. |
| Existing frontend demo E2E | PASS | `pnpm test:e2e`, 14 existing browser scenarios. |
| Phase 2B.2 frontend contract tests | PASS, 3/3 | Status wording, pagination/CSRF API paths, and safe 401/403/404/409/500 errors. |
| Server TypeScript build | PASS | `server: pnpm build`. |
| Fresh PostgreSQL migration | PASS | Fresh `shengbian_p2b2_gate` database migrated and seeded on Raspberry Pi PostgreSQL 16.14. |
| Phase 1 PostgreSQL regression | PASS, 1/1 | Real PostgreSQL on Raspberry Pi. |
| Phase 2A PostgreSQL regression | PASS, 48/48 | Real PostgreSQL on Raspberry Pi. |
| Phase 2B / 2B.1 PostgreSQL regression | PASS, 15/15 | Real PostgreSQL on Raspberry Pi. |
| Backend cold start | PASS | Fresh-database server started on Raspberry Pi and listened successfully. |
| Health probe | PASS | `GET /api/v1/health` returned `{ status: "ok" }`. |
| Mobile layout | PASS (static) | Existing 390px Playwright E2E and responsive style constraints are retained; API cards use a mobile-first layout without horizontal controls. |

Raspberry Pi environment: Linux `6.18.39+rpt-rpi-v8` on `aarch64`, Node
`v20.19.2`, pnpm `10.15.1`, PostgreSQL `16.14`.

## Implemented Frontend Contract

- Centralized `src/api/work-orders.js` uses the frozen API envelope, cookie
  credentials, CSRF, page/pageSize pagination, and explicit types via JSDoc.
- Resident mobile repair form resolves only current verified relationships,
  posts the frozen create payload, and navigates to the server-issued ID.
- List, detail, timeline, confirmation, rework, and review all use real API
  endpoints and `allowedActions`, never a client-side status permission rule.
- Timeline maps internal event names to Chinese resident language; snapshots
  are rendered from the work-order DTO.
- 401, 403, 404, 409, validation, network, and service-error states are
  handled without sensitive backend output. Confirm/rework conflict paths
  reload the current work-order detail.

## Blocking Result

**BACKEND CONTRACT BLOCKER**: the frozen server does not provision a resident
login role/identity or a resident-safe eligible-house discovery contract. Its
work-order endpoints require permissions unavailable to a resident in the
frozen seed/role model. This prevents a real resident-authenticated,
frontend-to-backend PostgreSQL E2E from being performed without changing the
frozen backend.

No backend route, migration, tenant rule, role, state transition, or fixture
was modified to make the test appear to pass. In particular, the frontend did
not hardcode a tenant, community, house, person, or user ID and did not use
mock work-order records for API mode.

## Deferred Work

The blocked contract must be designed as a separately approved backend phase:
resident identity/role provisioning, least-privilege work-order permissions,
and an authenticated "my eligible houses" projection. Once available, rerun
the real browser E2E happy path and rework path on PostgreSQL before declaring
this phase releasable.

## Final Decision

**FAIL**. The frontend implementation and all non-resident regression gates
pass, but the required real resident authentication, house scope, E2E happy
path, and E2E rework path cannot be verified against the frozen backend.
