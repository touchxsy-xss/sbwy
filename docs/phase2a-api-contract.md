# Phase 2A API Contract

This contract is generated from `server/src/app.ts` at the Phase 2A release gate. It describes implemented behavior, not a proposed API.

## Shared Contract

- Base path: `/api/v1`.
- Success envelope: `{ "data": ..., "meta": { "requestId": "..." } }`.
- Error envelope: `{ "error": { "code", "message", "details" }, "meta": { "requestId" } }`.
- Except for `/health` and `POST /auth/login`, every endpoint requires the opaque session cookie. All mutating endpoints also require the matching `sb_csrf` cookie and `X-CSRF-Token` header.
- Scope checks are always server-side. A supplied UUID or `communityId` is a filter, never an authority grant.
- Standard errors are `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404` for out-of-scope resources, `409 CONFLICT` for database uniqueness/exclusion conflicts, `422 VALIDATION_ERROR`, and `500 INTERNAL_ERROR`.
- `GET /houses` and `GET /people` accept `page` (default `1`) and `pageSize` (default `20`, maximum `100`) and return `{ items, page, pageSize, total }`. Invalid pagination is `422`.

## Health And Authentication

| Method | Path | Auth and scope | Request | Response and audit |
| --- | --- | --- | --- | --- |
| GET | `/health` | None | None | Service status; no audit |
| POST | `/auth/login` | None, rate limited | `{ phone, password }` | User and session metadata; login success/failure audit |
| POST | `/auth/logout` | Session | None | `{ loggedOut: true }`; logout audit |
| GET | `/auth/me` | Session | None | User, calculated scope, memberships |
| GET | `/auth/sessions` | Session | None | Caller-owned sessions |
| DELETE | `/auth/sessions/:id` | Session and session ownership | None | `{ revoked: true }` |

## Phase 1 Administration APIs

| Method | Path | Auth and tenant requirement | Request | Response and audit |
| --- | --- | --- | --- | --- |
| GET | `/property-companies/current` | Session; active company | None | Current scoped company |
| GET, POST | `/property-companies` | GET scoped; POST platform only | POST `{ code, name }` | Company list/new company; create audit |
| GET | `/communities` | Session; tenant plus community scope | None | Scoped communities |
| GET, PATCH | `/communities/:id` | Session; tenant plus community scope | PATCH `{ name?, address? }` | Community; PATCH audit |
| POST | `/communities` | `community:write`; company scope | `{ propertyCompanyId, code, name, address? }` | Community; create audit |
| POST | `/communities/:id/disable` | `community:write`; company scope | None | Disabled community; audit |
| GET, POST | `/employees` | `employee:read` / `employee:write`; company or community scope | POST `{ companyId, name, phone, password, employeeNo, department?, position?, employeeType? }` | Scoped employees/new employee; create audit |
| GET, PATCH | `/employees/:id` | Employee permission and scope | PATCH mutable employee fields | Employee; PATCH audit |
| POST | `/employees/:id/disable` | `employee:write` and scope | None | Disabled employee; audit |
| GET | `/roles`, `/permissions` | `role:read` | None | Global role/permission catalog |
| GET | `/users/:id/roles` | `access:read`; target must be in caller company | None | Assignments |
| POST | `/users/:id/roles` | `access:write`; role/company/community validation | `{ roleId, propertyCompanyId?, communityId? }` | Assignment; audit |
| DELETE | `/users/:id/roles/:roleId` | `access:write`; assignment scope | None | `{ revoked: true }`; audit |

## Buildings And Units

All endpoints below enforce `building:read` or `building:write`, then tenant and community scope through `buildings.community_id`.

| Method | Path | Request | Response and audit |
| --- | --- | --- | --- |
| GET | `/buildings` | Optional `communityId`, `keyword` | Scoped building list |
| GET | `/buildings/:id` | None | Building or `404` |
| POST | `/buildings` | `{ communityId, code, name, displayName?, legacyCode? }` | Building; `BUILDING_CREATED` in same transaction |
| PATCH | `/buildings/:id` | Mutable `code`, `name`, `displayName`, `legacyCode` | Building; `BUILDING_UPDATED` transactionally |
| POST | `/buildings/:id/disable` | None | Inactive building; `BUILDING_DISABLED` transactionally |
| GET | `/buildings/:id/units` | None | Scoped units for building |
| POST | `/buildings/:id/units` | `{ code, name, displayName? }` | Unit; `BUILDING_UNIT_CREATED` transactionally |
| GET | `/units/:id` | None | Unit or `404` |
| PATCH | `/units/:id` | Mutable `code`, `name`, `displayName` | Unit; `BUILDING_UNIT_UPDATED` transactionally |
| POST | `/units/:id/disable` | None | Inactive unit; `BUILDING_UNIT_DISABLED` transactionally |

## Houses

Every house is scoped through `house.building_id -> building.community_id -> property_company_id`; `houses` has no `community_id` column.

| Method | Path | Request | Response and audit |
| --- | --- | --- | --- |
| GET | `/houses` | `page`, `pageSize`, `communityId`, `buildingId`, `unitId`, `keyword`, `status` | `{ items, page, pageSize, total }`, stable code/id order under the same scope/filter |
| GET | `/houses/:id` | None | House with generated `displayCode` and `displayAddress` |
| POST | `/houses` | `{ buildingId, buildingUnitId?, code, floor?, buildingArea?, usableArea?, displayName?, legacyCode? }` | House; validates unit belongs to building; `HOUSE_CREATED` transactionally |
| PATCH | `/houses/:id` | Mutable house fields plus `status?` | House; same unit/building validation; `HOUSE_UPDATED` transactionally |
| POST | `/houses/:id/disable` | None | Inactive house; `HOUSE_DISABLED` transactionally |

Area values are decimal strings and must be greater than zero when present. `null` is the only unknown value. UUID is the formal identifier; `displayCode`, `displayAddress`, and `legacyCode` are not foreign keys.

## People And Contacts

People are tenant-owned by `propertyCompanyId`. Ordinary person DTOs never contain `phone`; they contain `maskedPhone` only.

| Method | Path | Request | Response and audit |
| --- | --- | --- | --- |
| GET | `/people` | `page`, `pageSize`, `keyword`, `communityId`, `buildingId`, `unitId`, `houseId`, `relationshipType` | Paginated, masked people. Company-wide users see their company, including unbound people. Community users see only current/future related people in authorized communities. |
| GET | `/people/:id` | None | Masked person DTO in current management scope |
| POST | `/people` | `{ propertyCompanyId, userId?, name, phone?, gender? }` | Company-wide `person:write` only; `PERSON_CREATED` transactionally, redacted audit data |
| PATCH | `/people/:id` | Mutable `userId`, `name`, `phone`, `gender` | Current/future management scope only; `PERSON_UPDATED` transactionally, redacted audit data |
| POST | `/people/:id/disable` | None | Current/future management scope only; `PERSON_DISABLED` transactionally |
| GET | `/people/:id/contact` | None | Full `{ id, name, phone }` only with `person:phone:read`; `PERSON_PHONE_VIEWED` audit contains no full phone |
| GET | `/people/:id/relationships` | None | Authorized relationship history with masked person data |

`phone` accepts a single mainland-China mobile number, normalizes optional `+86`, `0086`, spaces and hyphens to canonical digits, and is not unique.

## House Relationships And Atomic Residents

Relationship read/write requires `house_relation:read`/`house_relation:write` plus house tenant/community scope. Relationship body fields are `relationshipType` (`OWNER`, `TENANT`, `FAMILY_MEMBER`, `OCCUPANT`), `ownershipShare?`, `isPrimaryContact?`, `startDate`, and `endDate?`.

| Method | Path | Request | Response and audit |
| --- | --- | --- | --- |
| GET | `/houses/:id/relationships` | None | Authorized current and historical relationships, with masked person DTOs |
| POST | `/houses/:id/relationships` | Relationship body plus `personId` | Creates scoped relationship; `HOUSE_RELATION_CREATED` transactionally |
| POST | `/houses/:id/residents` | Exactly one of `existingPersonId` or `newPerson: { name, phone?, gender? }`, plus `relationship` | One transaction: scoped house, tenant-checked/existing or new person, relationship and required audits. New person emits both `PERSON_CREATED` and `HOUSE_RELATION_CREATED`. |
| PATCH | `/house-relationships/:id` | Mutable relationship fields | Updated relationship; `HOUSE_RELATION_UPDATED` transactionally |
| POST | `/house-relationships/:id/end` | `{ endDate }` | Ended relationship; `HOUSE_RELATION_ENDED` transactionally |
| POST | `/house-relationships/:id/verify` | `{ status: "VERIFIED" | "REJECTED", note? }` | Server supplies reviewer/time; `HOUSE_RELATION_VERIFIED` or `HOUSE_RELATION_REJECTED` transactionally |

Database exclusions reject overlapping same-type person/house relationships and overlapping primary contacts. The API maps those constraint failures to `409`.

## Audit Surface

There is no public audit-log listing or lookup endpoint in Phase 2A. Audit rows are server-internal and tenant/community identifiers are written by each audited resource operation. Therefore an external caller has no audit ID or pagination surface through which to enumerate another tenant's audit records.
