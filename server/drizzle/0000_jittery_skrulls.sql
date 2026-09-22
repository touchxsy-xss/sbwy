CREATE TYPE "public"."access_type" AS ENUM('READ', 'OPERATE', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."membership_type" AS ENUM('PROPERTY_EMPLOYEE', 'PROPERTY_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."scope_type" AS ENUM('PLATFORM', 'COMPANY', 'COMMUNITY');--> statement-breakpoint
CREATE TYPE "public"."record_status" AS ENUM('ACTIVE', 'DISABLED', 'INVITED');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_company_id" uuid,
	"community_id" uuid,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"resource_type" text,
	"resource_id" text,
	"request_id" text,
	"before_data" jsonb,
	"after_data" jsonb,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_company_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"status" "record_status" DEFAULT 'ACTIVE' NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"property_company_id" uuid NOT NULL,
	"membership_type" "membership_type" NOT NULL,
	"status" "record_status" DEFAULT 'ACTIVE' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_membership_id" uuid NOT NULL,
	"employee_no" text NOT NULL,
	"department" text,
	"position" text,
	"employee_type" text,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"resource" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"status" "record_status" DEFAULT 'ACTIVE' NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"scope_type" "scope_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"active_property_company_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"user_agent" text,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_role_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"property_company_id" uuid,
	"community_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"password_hash" text NOT NULL,
	"status" "record_status" DEFAULT 'ACTIVE' NOT NULL,
	"last_login_at" timestamp with time zone,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_property_company_id_property_companies_id_fk" FOREIGN KEY ("property_company_id") REFERENCES "public"."property_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_property_company_id_property_companies_id_fk" FOREIGN KEY ("property_company_id") REFERENCES "public"."property_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_memberships" ADD CONSTRAINT "company_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_memberships" ADD CONSTRAINT "company_memberships_property_company_id_property_companies_id_fk" FOREIGN KEY ("property_company_id") REFERENCES "public"."property_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_company_membership_id_company_memberships_id_fk" FOREIGN KEY ("company_membership_id") REFERENCES "public"."company_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_active_property_company_id_property_companies_id_fk" FOREIGN KEY ("active_property_company_id") REFERENCES "public"."property_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_property_company_id_property_companies_id_fk" FOREIGN KEY ("property_company_id") REFERENCES "public"."property_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_idx" ON "audit_logs" USING btree ("property_company_id","community_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE UNIQUE INDEX "communities_company_code_uq" ON "communities" USING btree ("property_company_id","code");--> statement-breakpoint
CREATE INDEX "communities_company_idx" ON "communities" USING btree ("property_company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "company_memberships_user_company_uq" ON "company_memberships" USING btree ("user_id","property_company_id");--> statement-breakpoint
CREATE INDEX "company_memberships_company_idx" ON "company_memberships" USING btree ("property_company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employee_profiles_membership_uq" ON "employee_profiles" USING btree ("company_membership_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employee_profiles_company_employee_no_uq" ON "employee_profiles" USING btree ("company_membership_id","employee_no");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_code_uq" ON "permissions" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "property_companies_code_uq" ON "property_companies" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_code_uq" ON "roles" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_uq" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_role_assignments_user_idx" ON "user_role_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_role_assignments_company_idx" ON "user_role_assignments" USING btree ("property_company_id");--> statement-breakpoint
CREATE INDEX "user_role_assignments_community_idx" ON "user_role_assignments" USING btree ("community_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_uq" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree ("email");