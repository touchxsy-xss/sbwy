# Phase 2B.1 Resident Confirmation and Review API Contract

All routes are under `/api/v1`, use the existing session and CSRF controls,
and return the `{ data, meta }` envelope. Authorization is resolved from the
requester's tenant, community, person, and the specific work order; knowing a
UUID is insufficient.

| Method | Path | Auth / scope | Request | Success | Errors / side effects |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/work-orders/:id/confirm-completion` | Authenticated resident who is the work order requester person | Empty body | `COMPLETED -> ARCHIVED`; returns work-order DTO | `404` out of scope; `409` unless current state is `COMPLETED`; writes `RESIDENT_CONFIRMED_COMPLETION` event and `CONFIRM_WORK_ORDER_COMPLETION` audit atomically. |
| `POST` | `/work-orders/:id/request-rework` | Same resident rule | `{ reason: string }`, trimmed, 1..2000 chars | `COMPLETED -> REWORK_REQUIRED` | `404` out of scope; `409` unless current state is `COMPLETED`; writes `REWORK_REQUESTED` event with reason and `REQUEST_WORK_ORDER_REWORK` audit atomically. |
| `POST` | `/work-orders/:id/review` | Same resident rule; order must be archived | `{ rating: 1..5 integer, comment?: string }` | Creates one immutable review | `404` out of scope; `409` if not `ARCHIVED` or already reviewed; `422` invalid rating/comment; writes `REVIEW_SUBMITTED` event and `SUBMIT_WORK_ORDER_REVIEW` audit atomically. |
| `GET` | `/work-orders/:id/review` | Tenant/community/requester scope | None | Review DTO | `404` when no review or order is outside scope. |

Work-order detail and list DTOs now include `review` and `allowedActions`.
For a requester resident, `COMPLETED` exposes `CONFIRM_COMPLETION` and
`REQUEST_REWORK`; an archived order without a review exposes `SUBMIT_REVIEW`.
No endpoint accepts client-supplied status, tenant, confirmation time, or
reviewer identity.

The existing operator transition endpoint continues to support the frozen
Phase 2B operator archive path for backward compatibility; resident clients
must use the explicit confirmation action.
