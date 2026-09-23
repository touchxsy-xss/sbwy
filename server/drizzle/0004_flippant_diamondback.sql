ALTER TYPE "public"."work_order_status" ADD VALUE 'REWORK_REQUIRED' BEFORE 'ARCHIVED';--> statement-breakpoint
CREATE TABLE "work_order_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_company_id" uuid NOT NULL,
	"work_order_id" uuid NOT NULL,
	"reviewer_person_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_order_reviews_rating_check" CHECK ("work_order_reviews"."rating" >= 1 AND "work_order_reviews"."rating" <= 5),
	CONSTRAINT "work_order_reviews_comment_length_check" CHECK ("work_order_reviews"."comment" IS NULL OR char_length("work_order_reviews"."comment") <= 2000)
);
--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "resident_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "resident_confirmed_by_person_id" uuid;--> statement-breakpoint
ALTER TABLE "work_order_reviews" ADD CONSTRAINT "work_order_reviews_property_company_id_property_companies_id_fk" FOREIGN KEY ("property_company_id") REFERENCES "public"."property_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_reviews" ADD CONSTRAINT "work_order_reviews_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_reviews" ADD CONSTRAINT "work_order_reviews_reviewer_person_id_people_id_fk" FOREIGN KEY ("reviewer_person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "work_order_reviews_work_order_uq" ON "work_order_reviews" USING btree ("work_order_id");--> statement-breakpoint
CREATE INDEX "work_order_reviews_tenant_idx" ON "work_order_reviews" USING btree ("property_company_id");--> statement-breakpoint
CREATE INDEX "work_order_reviews_reviewer_idx" ON "work_order_reviews" USING btree ("reviewer_person_id");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_resident_confirmed_by_person_id_people_id_fk" FOREIGN KEY ("resident_confirmed_by_person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;