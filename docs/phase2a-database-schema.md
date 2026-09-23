# Phase 2A Database Schema Snapshot

This is the frozen Phase 2A schema summary, derived from `server/src/db/schema/index.ts` and migrations `0000` through `0002`. PostgreSQL UUIDs are the formal identifiers throughout.

## Tenant Root And Existing Phase 1 Tables

| Table | Tenant ownership and key relationships | Important constraints / lifecycle |
| --- | --- | --- |
| `property_companies` | Tenant root | Unique `code`; `status`, `disabled_at` |
| `communities` | `property_company_id -> property_companies` | Unique `(property_company_id, code)`; `status`, `disabled_at` |
| `users` | Global login identity, not a person/customer record | Unique phone/email where defined by Phase 1; `status`, `disabled_at` |
| `company_memberships` | `user_id -> users`, `property_company_id -> property_companies` | Employee/admin membership tenant boundary |
| `user_role_assignments` | User role with optional company/community scope | Role and scope FKs; revocation timestamp |
| `roles`, `permissions`, `role_permissions` | Global RBAC catalog | Role-to-permission mapping |
| `sessions` | `user_id -> users`, optional active company | Opaque session token hash; revocation timestamp |
| `audit_logs` | Optional `property_company_id`, optional `community_id`, optional actor/resource references | Append-only application audit target; JSON before/after data is redacted by API code |

## Phase 2A Property Hierarchy

```text
property_companies 1--N communities 1--N buildings 1--N building_units
                                           \
                                            1--N houses
houses.building_unit_id is optional; when present it belongs to houses.building_id.
```

| Table | Primary key and foreign keys | Unique constraints / important indexes | Lifecycle |
| --- | --- | --- | --- |
| `buildings` | UUID `id`; `community_id -> communities.id` | Unique `(community_id, code)`; index `community_id` | `status` (`ACTIVE`, `INACTIVE`), `disabled_at`; no physical delete |
| `building_units` | UUID `id`; `building_id -> buildings.id` | Unique `(building_id, code)` and unique `(id, building_id)`; index `building_id` | `status`, `disabled_at`; no physical delete |
| `houses` | UUID `id`; `building_id -> buildings.id`; composite `(building_unit_id, building_id) -> building_units(id, building_id)` | Partial unique `(building_unit_id, code)` when unit is not null; partial unique `(building_id, code)` when unit is null; indexes on building and unit | `status` (`ACTIVE`, `RENOVATING`, `INACTIVE`), `disabled_at`; no physical delete |

`houses` intentionally does not store `community_id`. Tenant and community scope always join through `houses.building_id -> buildings.community_id -> communities.property_company_id`.

House area columns are `numeric(10,2)`. `building_area` and `usable_area` are nullable, and each has a check requiring a positive value when non-null. Zero is never an unknown-area sentinel. `legacy_code` may preserve old display data; there is no `business_code` identity.

## People And House Relationships

```text
users 1--0..N people
property_companies 1--N people
people N--M houses through house_person_relationships
```

| Table | Primary key and foreign keys | Unique constraints / important indexes | Lifecycle and privacy |
| --- | --- | --- | --- |
| `people` | UUID `id`; non-null `property_company_id -> property_companies.id`; nullable `user_id -> users.id` | Partial unique `(property_company_id, user_id)` where `user_id IS NOT NULL`; indexes on company and user | `status` (`ACTIVE`, `DISABLED`), `disabled_at`; canonical nullable phone is server-only except contact endpoint |
| `house_person_relationships` | UUID `id`; `house_id -> houses.id`; `person_id -> people.id`; nullable `reviewed_by_user_id -> users.id` | Indexes on house and person; PostgreSQL `btree_gist` exclusion constraints described below | No status column. Date range is the only lifecycle authority. |

Relationship columns are `relationship_type`, optional `ownership_share`, `is_primary_contact`, `start_date`, nullable `end_date`, verification state, reviewer/time/note, and timestamps.

Database checks enforce:

- `end_date >= start_date` when an end date exists.
- Only `OWNER` can have `ownership_share`; when supplied it is greater than zero and at most 100.
- `UNVERIFIED`/`PENDING` have no reviewer/time; `VERIFIED`/`REJECTED` require both.

Migration `0002` enables `btree_gist` and adds two PostgreSQL exclusion constraints:

1. The same `(house_id, person_id, relationship_type)` cannot have overlapping inclusive date intervals.
2. A house cannot have overlapping intervals where `is_primary_contact = true`.

The relationship repository also validates that a person's `property_company_id` equals the house's derived property company before linking them. This is application-level tenant integrity in addition to all database foreign keys.

## Audit Relationship And Transaction Boundary

`audit_logs` is not a foreign key parent of business tables. Phase 2A writes use one repository PostgreSQL transaction for every building, unit, house, person, or relationship mutation and its required audit insert. The atomic resident endpoint performs person creation (if needed), relationship creation, and both audits in the same transaction. If an audit insert fails, the business mutation rolls back.

Audit payloads for person operations redact phone values. `PERSON_PHONE_VIEWED` stores actor, tenant/community scope, resource type/id, request id and time, never the phone value. Audit data is currently internal only; no audit list API is exposed.
