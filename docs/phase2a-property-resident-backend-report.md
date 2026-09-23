# Phase 2A Property + People Backend Acceptance Report

Date: 2026-09-23  
Branch: `codex/phase2-property-resident-backend`  
Implementation commits: `8df210d`, `3521e86`, `42aa1e9`, `bb4d0cc`

## Result Summary

| Area | Result | Evidence |
|---|---|---|
| New tables | PASS | `buildings`, `building_units`, `houses`, `people`, `house_person_relationships` exist in PostgreSQL 16 |
| Migration | PASS | Phase 1 schema upgraded to migration 0002 on `shengbian_dev` without dropping data |
| Constraints | PASS | Composite Unit/Building FK, partial house uniqueness, positive areas, relationship checks, and date exclusions verified |
| `btree_gist` | PASS | Extension and both exclusion constraints present and enforced on Raspberry Pi PostgreSQL 16 |
| Permissions / role mapping | PASS | New permissions seeded; Engineer has no people/relationship directory permissions |
| Tenant and community scope | PASS | Repository joins scope through Community -> Building -> House; People starts with `property_company_id` |
| Buildings / Units / Houses API | PASS | CRUD/read/disable routes implemented with scope checks |
| People API | PASS | Tenant/community filtering, pagination parameters, canonical phone writes, masked DTOs |
| House relationships API | PASS | Relationship creation, update, end, verify, history and scope routes |
| Atomic resident creation | PASS | `POST /api/v1/houses/:id/residents` creates Person + relationship + audit in one transaction |
| Phone privacy | PASS | Ordinary list/detail/history return `maskedPhone`; `/contact` requires `person:phone:read` and audits the view |
| Audit | PASS | Phase 2 actions are recorded; full phone values are excluded |
| PostgreSQL integration tests | PASS | 30/30 Phase 2A scenarios passed on Raspberry Pi `shengbian_test` |
| Phase 1 PostgreSQL regression | PASS | Existing PostgreSQL integration suite passed independently on Raspberry Pi |
| Frontend existing build/tests | PASS | Existing frontend build and 8 Demo Store tests passed; no frontend business code was changed |
| Phase 1 -> Phase 2 migration | PASS | Existing `shengbian_dev` upgraded incrementally; existing database/volume retained |
| From-zero migration | PASS | Empty `shengbian_phase2_zero_20260923` migrated from first migration through 0002 |
| Raspberry Pi validation | PASS | `aarch64`, PostgreSQL 16 container, test DB and dev DB migration verified |

## Schema and Constraints

The implementation adds only the five approved domain tables. `House` stores `building_id` and nullable `building_unit_id`, never `community_id`. `Person` is tenant-scoped by non-null `property_company_id`; the nullable `user_id` mapping is unique only within a property company. UUIDs remain the formal identities.

Migration `server/drizzle/0002_mixed_sinister_six.sql` contains the raw PostgreSQL statements required beyond Drizzle's generated output: `btree_gist`, the composite Unit/Building foreign key, partial house code indexes, relationship daterange exclusion, and primary-contact daterange exclusion. Unknown areas remain `NULL`, never zero. Relationship lifecycle is represented only by `start_date` and nullable `end_date`.

## Scope, Privacy, and Transactions

Company administrators can see their company's People, including unbound records. Community-scoped roles see only People with current or future non-ended relationships in assigned communities; historical People remain available through authorized house history with masked data. Engineers receive no People or relationship-directory permissions.

Phone values are canonicalized to mainland China numeric format at write time. Normal People DTOs never expose `phone`; full contact data is isolated to `/api/v1/people/:id/contact`, subject to permission and scope, and emits `PERSON_PHONE_VIEWED` without putting the phone in audit data. Resident creation locks the House inside the transaction and writes the relationship audit row before commit. A failed request rolls back the new Person.

## Test Coverage

The Phase 2A integration suite covers 30 scenarios: cross-company and cross-community access, optional units, area validation, cross-company Person/House rejection, cross-tenant User mappings, relationship overlap and history, primary contacts, future residents, unbound People, Engineer denial, masked/full phone behavior, audit redaction, atomic creation/rollback, and UUID tampering. Tests run against real PostgreSQL, not the memory repository.

## Raspberry Pi Evidence

The server was validated on `homeserver` (`aarch64`) using the existing `server-postgres-1` PostgreSQL 16 container. `shengbian_test` was used for the fixture and 30/30 integration scenarios. A separate empty database completed the full migration chain. `shengbian_dev` was upgraded in place; no database, volume, or existing Phase 1 data was dropped.

## Files Changed

Backend schema, migration metadata, Repository, shared types, Fastify routes, permission seed, memory-repository compatibility stubs, Phase 2 fixture, and PostgreSQL integration tests were changed. No resident frontend, repair, billing, payment, collaboration, Phase 2B, or Phase 3 code was added.

## Known Issues / Limits

1. The integration suite is intentionally opt-in with `RUN_POSTGRES_INTEGRATION=1`; on a developer machine without PostgreSQL it is skipped rather than faked.
2. The Mac workspace did not have a local Docker daemon; Raspberry Pi was therefore the authoritative real PostgreSQL execution environment.
3. No resident-facing frontend migration was attempted by design.

## Final Conclusion

**PASS**

The approved Phase 2A backend scope is implemented and verified against real PostgreSQL on the Raspberry Pi, with 30/30 Phase 2A scenarios and the existing Phase 1 PostgreSQL suite passing. A standalone Fastify instance also returned a successful local `GET /api/v1/health` response on the Raspberry Pi. Resident-facing frontend migration was intentionally excluded from Phase 2A.
