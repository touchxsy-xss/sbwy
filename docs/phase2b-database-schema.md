# Phase 2B Work Order Database Snapshot

## `work_orders`

- Primary key: `id UUID`.
- Tenant ownership: `property_company_id NOT NULL` -> `property_companies.id`.
- Scope links: nullable `community_id` -> `communities.id`, nullable
  `house_id` -> `houses.id`.
- Request links: `requester_person_id` -> `people.id`, optional
  `requester_user_id` -> `users.id`, optional `requester_relationship_id` ->
  `house_person_relationships.id`.
- Assignment: nullable `assigned_user_id` -> `users.id`.
- Identity: `(property_company_id, order_no)` is unique; UUID remains the
  relationship identity.
- State: `PENDING_DISPATCH`, `ASSIGNED`, `ACCEPTED`, `ARRIVED`, `COMPLETED`,
  `ARCHIVED`, `CANCELLED`.
- Snapshots: required `contact_snapshot` and `location_snapshot` JSONB.
- Indexes: company, community, house, requester, assignee, and status.
- Timestamps: `created_at`, `updated_at`, plus transition timestamps; no hard
  delete is used by the API.

## `work_order_events`

- Primary key: `id UUID`.
- `work_order_id` -> `work_orders.id` and mandatory `property_company_id`.
- Optional `community_id` and `actor_user_id` foreign keys.
- `from_status`, `to_status`, `action`, `note`, and optional metadata.
- Indexes: `(work_order_id, created_at)` and `(property_company_id, community_id)`.
- Events are append-only from application code.

## Migration

`server/drizzle/0003_phase2b_work_orders.sql` creates the three work-order
enums, both tables, all foreign keys, the private-house check, unique order
number constraint, and scope/query indexes. It is registered in the Drizzle
journal after the Phase 2A migration.
