# Phase 2B Work Order API Contract

All routes are under `/api/v1`, require the existing opaque session cookie,
and use the `{ data, meta }` response envelope. Mutations also require the
existing CSRF cookie/header pair.

| Method | Path | Permission | Request | Response / errors |
| --- | --- | --- | --- | --- |
| `POST` | `/work-orders` | `work_order:create` | `scope`, `requesterPersonId`, `requesterRelationshipId` for private requests, `houseId` for private requests, `communityId` for public requests, `category`, `priority`, `title`, `description`, optional `location` | Created order in `PENDING_DISPATCH`; `400/403/404/422` on invalid scope, relationship, or payload. Writes `WORK_ORDER_CREATED` audit and initial event. |
| `GET` | `/work-orders` | `work_order:read` | `page`, `pageSize` (1..100), `communityId`, `houseId`, `status`, `assignedUserId`, `keyword` | `{ items, page, pageSize, total }`; tenant/community scope is applied before filters. |
| `GET` | `/work-orders/:id` | `work_order:read` | UUID path parameter | Safe order DTO with `maskedPhone`; `404` outside scope. |
| `POST` | `/work-orders/:id/assign` | `work_order:assign` | `{ assignedUserId, note? }` | `ASSIGNED` order; assignee must be an active `ENGINEER` in the same company/community. Writes event and audit. |
| `POST` | `/work-orders/:id/transition` | `work_order:transition` | `{ toStatus, note? }`, where status is `ACCEPTED`, `ARRIVED`, `COMPLETED`, `ARCHIVED`, or `CANCELLED` | Updated order; `409 INVALID_WORK_ORDER_TRANSITION` for an illegal edge. Writes event and audit. |
| `POST` | `/work-orders/:id/cancel` | `work_order:transition` | no body | Convenience transition to `CANCELLED`; only allowed from `PENDING_DISPATCH` or `ASSIGNED`. |
| `GET` | `/work-orders/:id/events` | `work_order:read` | UUID path parameter | Immutable event list; `404` outside scope. |

## DTO rules

`contactSnapshot` contains `name` and `maskedPhone` by default. Users with
`work_order:contact:read` receive the necessary historical `phone` only in the
scoped work-order projection (engineers receive it only for assigned orders).
The stored snapshot is never written to audit payloads. `locationSnapshot`
contains only the house address or the submitted public-area location.

## State transitions

`PENDING_DISPATCH -> ASSIGNED -> ACCEPTED -> ARRIVED -> COMPLETED -> ARCHIVED`

Cancellation is allowed from `PENDING_DISPATCH` and `ASSIGNED`. No other
transition is accepted. Every successful mutation is transactionally coupled to
one `work_order_events` row and one audit row.
