CREATE TYPE "public"."auth_provider" AS ENUM('google', 'magic_link');--> statement-breakpoint
CREATE TYPE "public"."device_type" AS ENUM('desktop', 'mobile', 'tablet', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."phishing_status" AS ENUM('safe', 'phishing', 'suspicious');--> statement-breakpoint
CREATE TYPE "public"."traffic_source" AS ENUM('direct', 'social', 'email');--> statement-breakpoint
CREATE SEQUENCE "public"."link_sequence" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 5000 CACHE 1;--> statement-breakpoint
CREATE TABLE "clicks" (
	"id" text PRIMARY KEY NOT NULL,
	"link_id" text,
	"ip_address" text,
	"device_type" "device_type" DEFAULT 'unknown' NOT NULL,
	"referrer" text,
	"traffic_source" "traffic_source" NOT NULL,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"provider" "auth_provider" NOT NULL,
	"provider_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"short_code" text NOT NULL,
	"original_url" text NOT NULL,
	"custom_alias" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"track_clicks" boolean DEFAULT true NOT NULL,
	"phishing_status" "phishing_status" NOT NULL,
	"clicks_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identities" ADD CONSTRAINT "identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_link_id" ON "clicks" USING btree ("link_id");--> statement-breakpoint
CREATE INDEX "idx_traffic_source" ON "clicks" USING btree ("traffic_source");--> statement-breakpoint
CREATE INDEX "idx_clicked_at" ON "clicks" USING btree ("clicked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_id_provider" ON "identities" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "idx_user_id" ON "links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_is_active" ON "links" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_short_code" ON "links" USING btree ("short_code");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_custom_alias" ON "links" USING btree ("custom_alias") WHERE "links"."custom_alias" IS NOT NULL;