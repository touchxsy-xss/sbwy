# Phase 2B.1 State Machine

```text
PENDING_DISPATCH -> ASSIGNED -> ACCEPTED -> ARRIVED -> COMPLETED
                                                         |\
                           resident confirm -------------+ -> ARCHIVED
                           resident rework ---------------+ -> REWORK_REQUIRED -> ASSIGNED

PENDING_DISPATCH -> CANCELLED
ASSIGNED         -> CANCELLED
```

`COMPLETED` means the assigned worker submitted completion, not resident
confirmation. `ARCHIVED` means the final business closure. `REWORK_REQUIRED`
requires a non-blank resident reason and can only return to `ASSIGNED` through
normal property dispatch. It cannot be archived directly. Existing Phase 2B
operator archiving remains available only as a compatibility path; the
resident-facing contract is the explicit confirmation action.

The resident is authorized against the specific work order's requester person,
the person's global user mapping, tenant, and community scope. Historical
relationship changes do not grant access to unrelated future work orders.
Confirmation and rework lock the work-order row in PostgreSQL, so exactly one
of concurrent confirmation/rework requests succeeds.
