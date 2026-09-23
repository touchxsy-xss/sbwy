# Phase 2B.2 Resident Work Order Frontend

## Scope and Baseline

This frontend integration is based on Phase 2B.1 frozen commit
`6574972edd1332971c1343b2294eb5a23b342ae0`. It does not change the work-order
state machine, migration history, tenant rules, or server routes.

The resident pages retain the existing mobile visual system. When the static
server receives `SHENGBIAN_API_PROXY_TARGET` or `SHENGBIAN_API_BASE`, and the
resident signs in with a real API session, the work-order pages use the API;
the pre-existing local demonstration flow remains available when no API is
configured.

## Pages and Routes

| Page | Route | Real API behavior |
| --- | --- | --- |
| Submit repair | `/mobile/repair` | Resolves the authenticated person's verified, current house relationships and posts a `PRIVATE` work order. |
| My work orders | Profile -> `我的报修` | Uses `GET /work-orders?page=&pageSize=20`, including server-scoped pagination. |
| Work order detail | `/mobile/orders/:id` | Loads detail and events in parallel; displays snapshots and a resident-safe timeline. |
| Service review | `/mobile/review?id=:id` | Loads the real detail, validates 1-5 stars, then posts one immutable review. |

No screen sends a tenant ID, user ID, confirmation time, status, reviewer
identity, or arbitrary house ID. The form derives the person and house
relationship from the authenticated server identity.

## API Mapping

| UI action | API | Conditions derived from server response |
| --- | --- | --- |
| Submit repair | `POST /work-orders` | Private work order, current verified relationship only. |
| List | `GET /work-orders` | Server tenant/community/requester scope and API pagination. |
| Detail | `GET /work-orders/:id` | 404 is intentionally not distinguished from out-of-scope. |
| Timeline | `GET /work-orders/:id/events` | Internal action names are mapped to resident wording; raw audit/debug metadata is not shown. |
| Confirm | `POST /work-orders/:id/confirm-completion` | `allowedActions` contains `CONFIRM_COMPLETION`. |
| Rework | `POST /work-orders/:id/request-rework` | `allowedActions` contains `REQUEST_REWORK`; a trimmed reason is mandatory. |
| Review | `POST /work-orders/:id/review` | `allowedActions` contains `SUBMIT_REVIEW`; rating is 1-5. |

Status wording is: pending dispatch = 待派单, assigned = 已派单, accepted =
维修人员已接单, arrived = 维修人员已到场, completed = 待您确认, rework required =
返工处理中, archived = 已完成, and cancelled = 已取消.

## Authentication and Errors

All requests use the existing opaque session cookie and CSRF token through
`src/api/client.js`. The static development server can proxy `/api/*` to avoid
cross-origin cookie failures. A 401 clears the API and local session flags and
returns to login. A 403 keeps the session and explains that the user lacks
permission. A 404 uses the safe message "该工单不存在或您无权查看". A 409 shows a
state-conflict message and reloads the detail after confirm/rework failures.
Validation, network, and server errors are differentiated without showing SQL
or stack details. Mutation buttons use the existing busy/disabled behavior.

## Deferred Scope

This phase does not implement property/worker work-order UI, attachments,
notifications, payment, review editing/deletion, SMS/WeChat, or a new state
management framework.

## Backend Contract Blocker

The frozen Phase 2B.1 seed and authorization model contain only property
administrator, community manager, and engineer identities. They do not define
a resident role, seed a resident login identity, or expose a resident-safe
`me/eligible-houses` endpoint. In addition, the frozen work-order list/create
routes require permissions that no resident identity can receive from the
existing seed/role model.

The API client and screens are therefore wired to the frozen endpoints and
will activate for a valid future resident API session, but a genuine resident
login -> eligible house -> create/list/detail/confirm/rework/review browser
E2E cannot be executed against the frozen backend. This is a **BACKEND
CONTRACT BLOCKER**, not a frontend fallback: no mock identity, tenant ID,
house ID, or client-side permission override was added.
