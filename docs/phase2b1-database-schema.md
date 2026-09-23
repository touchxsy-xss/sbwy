# Phase 2B.1 Database Schema

## `work_orders` additions

- `status` enum adds `REWORK_REQUIRED` between `COMPLETED` and `ARCHIVED`.
- `resident_confirmed_at timestamptz NULL`.
- `resident_confirmed_by_person_id UUID NULL` -> `people.id`.

## `work_order_reviews`

- `id UUID PRIMARY KEY`.
- `property_company_id UUID NOT NULL` -> `property_companies.id`.
- `work_order_id UUID NOT NULL` -> `work_orders.id`.
- `reviewer_person_id UUID NOT NULL` -> `people.id`.
- `rating INTEGER NOT NULL`, database check `1 <= rating <= 5`.
- `comment TEXT NULL`, database check maximum 2000 characters.
- `created_at`, `updated_at` timestamps.
- Unique index on `work_order_id` guarantees one review per order.
- Tenant and reviewer indexes support scoped access.

Migration: `server/drizzle/0004_flippant_diamondback.sql`. Migration 0001,
0002, and 0003 remain unchanged.
