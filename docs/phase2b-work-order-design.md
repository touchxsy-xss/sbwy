# Phase 2B Work Order / Repair Design

## Domain Model

`work_orders` is the aggregate root for a repair request. It belongs to one
property company and optionally one house. Private repairs require a house;
public-area repairs may omit `house_id` but must retain a location snapshot.
The requester is represented by the Phase 2A `people` record, with optional
`requester_user_id` and `requester_relationship_id` for the authenticated
session and the relationship that authorized the request.

The aggregate stores immutable contact and location snapshots. Formal foreign
keys remain available for current navigation, but later changes to a person,
house, or relationship cannot rewrite the historical work order.

## State Machine

Allowed states:

`PENDING_DISPATCH -> ASSIGNED -> ACCEPTED -> ARRIVED -> COMPLETED -> ARCHIVED`

`PENDING_DISPATCH -> CANCELLED` and `ASSIGNED -> CANCELLED` are the only
cancellation transitions in the first version. There are no implicit reverse
transitions. Every transition is validated in one transaction, updates the
aggregate, inserts a `work_order_events` row, and writes an audit row.

Assignment is a transition to `ASSIGNED`; the assignee must be an active
employee user in the same property company and in the work order community.
`ACCEPTED`, `ARRIVED`, and `COMPLETED` may be performed by the assigned
engineer or a company/community operator. `ARCHIVED` is an operator action.

## Permission Matrix

| Role | Read | Create | Assign | Transition | Contact projection |
| --- | --- | --- | --- | --- | --- |
| PROPERTY_ADMIN | company | company | company | company | company |
| COMMUNITY_MANAGER | authorized communities | authorized communities | authorized communities | authorized communities | authorized communities |
| PROPERTY_STAFF | authorized communities | authorized communities | no | authorized communities | masked |
| ENGINEER | assigned orders only | no | no | assigned orders only | assigned order only |

Permissions are `work_order:read`, `work_order:create`,
`work_order:assign`, `work_order:transition`, and `work_order:contact:read`.
The existing `person:phone:read` permission is not granted to engineers.

## API Contract

- `POST /api/v1/work-orders`: create a request. Body contains `houseId` or
  `location`, `requesterPersonId`, optional `requesterRelationshipId`,
  `category`, `priority`, `title`, and `description`.
- `GET /api/v1/work-orders`: tenant/community-scoped pagination with
  `page`, `pageSize`, `status`, `houseId`, `assignedUserId`, `keyword`.
- `GET /api/v1/work-orders/:id`: scoped aggregate and safe contact/location
  projection.
- `POST /api/v1/work-orders/:id/assign`: body `{ assignedUserId }`.
- `POST /api/v1/work-orders/:id/transition`: body `{ toStatus, note }`.
- `POST /api/v1/work-orders/:id/cancel`: convenience transition to
  `CANCELLED`.
- `GET /api/v1/work-orders/:id/events`: scoped immutable event history.

Mutations require the existing session and CSRF protections. Responses use the
existing `{ data, meta }` envelope. List responses use `{ items, page,
pageSize, total }`.

## Data Integrity

`property_company_id` is mandatory on both work-order tables. Database foreign
keys cover formal references. Repository transactions additionally verify that
the house, requester person, relationship, and authenticated scope resolve to
the same company and community. Audit payloads never contain an unmasked phone
number.

## Explicit Non-Goals

No resident frontend migration, billing, payment, collaboration, attachments,
notifications, SLA automation, or ratings are part of Phase 2B.
