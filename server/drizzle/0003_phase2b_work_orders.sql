CREATE TYPE "public"."work_order_status" AS ENUM('PENDING_DISPATCH', 'ASSIGNED', 'ACCEPTED', 'ARRIVED', 'COMPLETED', 'ARCHIVED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."work_order_scope" AS ENUM('PRIVATE', 'PUBLIC');--> statement-breakpoint
CREATE TYPE "public"."work_order_priority" AS ENUM('ROUTINE', 'NORMAL', 'URGENT');--> statement-breakpoint
CREATE TABLE "work_orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "property_company_id" uuid NOT NULL,
  "community_id" uuid,
  "house_id" uuid,
  "requester_person_id" uuid NOT NULL,
  "requester_user_id" uuid,
  "requester_relationship_id" uuid,
  "assigned_user_id" uuid,
  "order_no" text NOT NULL,
  "scope" "work_order_scope" NOT NULL,
  "category" text NOT NULL,
  "priority" "work_order_priority" DEFAULT 'NORMAL' NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "status" "work_order_status" DEFAULT 'PENDING_DISPATCH' NOT NULL,
  "contact_snapshot" jsonb NOT NULL,
  "location_snapshot" jsonb NOT NULL,
  "assigned_at" timestamp with time zone,
  "accepted_at" timestamp with time zone,
  "arrived_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "archived_at" timestamp with time zone,
  "cancelled_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "work_orders_private_requires_house" CHECK (("scope" = 'PUBLIC') OR "house_id" IS NOT NULL)
);--> statement-breakpoint
CREATE TABLE "work_order_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "work_order_id" uuid NOT NULL,
  "property_company_id" uuid NOT NULL,
  "community_id" uuid,
  "actor_user_id" uuid,
  "from_status" "work_order_status",
  "to_status" "work_order_status" NOT NULL,
  "action" text NOT NULL,
  "note" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_company_fk" FOREIGN KEY ("property_company_id") REFERENCES "public"."property_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_community_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_house_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_person_fk" FOREIGN KEY ("requester_person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_requester_user_fk" FOREIGN KEY ("requester_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_requester_relationship_fk" FOREIGN KEY ("requester_relationship_id") REFERENCES "public"."house_person_relationships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assigned_user_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_events" ADD CONSTRAINT "work_order_events_order_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_events" ADD CONSTRAINT "work_order_events_company_fk" FOREIGN KEY ("property_company_id") REFERENCES "public"."property_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_events" ADD CONSTRAINT "work_order_events_community_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_events" ADD CONSTRAINT "work_order_events_actor_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "work_orders_company_order_no_uq" ON "work_orders" USING btree ("property_company_id", "order_no");--> statement-breakpoint
CREATE INDEX "work_orders_company_idx" ON "work_orders" USING btree ("property_company_id");--> statement-breakpoint
CREATE INDEX "work_orders_community_idx" ON "work_orders" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "work_orders_house_idx" ON "work_orders" USING btree ("house_id");--> statement-breakpoint
CREATE INDEX "work_orders_requester_idx" ON "work_orders" USING btree ("requester_person_id");--> statement-breakpoint
CREATE INDEX "work_orders_assignee_idx" ON "work_orders" USING btree ("assigned_user_id");--> statement-breakpoint
CREATE INDEX "work_orders_status_idx" ON "work_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "work_order_events_order_idx" ON "work_order_events" USING btree ("work_order_id", "created_at");--> statement-breakpoint
CREATE INDEX "work_order_events_tenant_idx" ON "work_order_events" USING btree ("property_company_id", "community_id");
