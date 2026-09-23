CREATE TYPE "public"."building_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."person_gender" AS ENUM('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."house_status" AS ENUM('ACTIVE', 'RENOVATING', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."person_status" AS ENUM('ACTIVE', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."house_relationship_type" AS ENUM('OWNER', 'TENANT', 'FAMILY_MEMBER', 'OCCUPANT');--> statement-breakpoint
CREATE TYPE "public"."relationship_verification_status" AS ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "building_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text,
	"status" "building_status" DEFAULT 'ACTIVE' NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text,
	"legacy_code" text,
	"status" "building_status" DEFAULT 'ACTIVE' NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "house_person_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"house_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"relationship_type" "house_relationship_type" NOT NULL,
	"ownership_share" numeric(5, 2),
	"is_primary_contact" boolean DEFAULT false NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"verification_status" "relationship_verification_status" DEFAULT 'UNVERIFIED' NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by_user_id" uuid,
	"verification_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "house_person_relationships_date_order" CHECK ("house_person_relationships"."end_date" IS NULL OR "house_person_relationships"."end_date" >= "house_person_relationships"."start_date"),
	CONSTRAINT "house_person_relationships_owner_share" CHECK (("house_person_relationships"."relationship_type" = 'OWNER' OR "house_person_relationships"."ownership_share" IS NULL) AND ("house_person_relationships"."ownership_share" IS NULL OR ("house_person_relationships"."ownership_share" > 0 AND "house_person_relationships"."ownership_share" <= 100))),
	CONSTRAINT "house_person_relationships_review_fields" CHECK (("house_person_relationships"."verification_status" IN ('UNVERIFIED', 'PENDING') AND "house_person_relationships"."reviewed_at" IS NULL AND "house_person_relationships"."reviewed_by_user_id" IS NULL) OR ("house_person_relationships"."verification_status" IN ('VERIFIED', 'REJECTED') AND "house_person_relationships"."reviewed_at" IS NOT NULL AND "house_person_relationships"."reviewed_by_user_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "houses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"building_unit_id" uuid,
	"code" text NOT NULL,
	"floor" integer,
	"building_area" numeric(10, 2),
	"usable_area" numeric(10, 2),
	"display_name" text,
	"legacy_code" text,
	"status" "house_status" DEFAULT 'ACTIVE' NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "houses_building_area_positive" CHECK ("houses"."building_area" IS NULL OR "houses"."building_area" > 0),
	CONSTRAINT "houses_usable_area_positive" CHECK ("houses"."usable_area" IS NULL OR "houses"."usable_area" > 0)
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_company_id" uuid NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"phone" text,
	"gender" "person_gender",
	"status" "person_status" DEFAULT 'ACTIVE' NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "building_units" ADD CONSTRAINT "building_units_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_person_relationships" ADD CONSTRAINT "house_person_relationships_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_person_relationships" ADD CONSTRAINT "house_person_relationships_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_person_relationships" ADD CONSTRAINT "house_person_relationships_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_property_company_id_property_companies_id_fk" FOREIGN KEY ("property_company_id") REFERENCES "public"."property_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "building_units_building_code_uq" ON "building_units" USING btree ("building_id","code");--> statement-breakpoint
CREATE INDEX "building_units_building_idx" ON "building_units" USING btree ("building_id");--> statement-breakpoint
CREATE UNIQUE INDEX "building_units_id_building_uq" ON "building_units" USING btree ("id","building_id");--> statement-breakpoint
CREATE UNIQUE INDEX "buildings_community_code_uq" ON "buildings" USING btree ("community_id","code");--> statement-breakpoint
CREATE INDEX "buildings_community_idx" ON "buildings" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "house_person_relationships_house_idx" ON "house_person_relationships" USING btree ("house_id");--> statement-breakpoint
CREATE INDEX "house_person_relationships_person_idx" ON "house_person_relationships" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "houses_building_idx" ON "houses" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "houses_unit_idx" ON "houses" USING btree ("building_unit_id");--> statement-breakpoint
CREATE INDEX "people_company_idx" ON "people" USING btree ("property_company_id");--> statement-breakpoint
CREATE INDEX "people_user_idx" ON "people" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "people_company_user_uq" ON "people" USING btree ("property_company_id","user_id") WHERE "user_id" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "houses_unit_code_uq" ON "houses" USING btree ("building_unit_id","code") WHERE "building_unit_id" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "houses_building_code_without_unit_uq" ON "houses" USING btree ("building_id","code") WHERE "building_unit_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_unit_building_fk" FOREIGN KEY ("building_unit_id", "building_id") REFERENCES "public"."building_units"("id", "building_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "house_person_relationships" ADD CONSTRAINT "house_person_relationships_no_overlap" EXCLUDE USING gist ("house_id" WITH =, "person_id" WITH =, "relationship_type" WITH =, daterange("start_date", COALESCE("end_date" + 1, 'infinity'::date), '[)') WITH &&);
--> statement-breakpoint
ALTER TABLE "house_person_relationships" ADD CONSTRAINT "house_person_relationships_primary_contact_no_overlap" EXCLUDE USING gist ("house_id" WITH =, daterange("start_date", COALESCE("end_date" + 1, 'infinity'::date), '[)') WITH &&) WHERE ("is_primary_contact" = true);
