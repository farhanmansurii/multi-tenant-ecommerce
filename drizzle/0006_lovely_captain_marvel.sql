CREATE TYPE "public"."user_type" AS ENUM('platform_user', 'store_customer');--> statement-breakpoint
CREATE TYPE "public"."storefront_role" AS ENUM('storefront_customer', 'store_admin');--> statement-breakpoint
CREATE TABLE "store_customers" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "storefront_role" DEFAULT 'storefront_customer' NOT NULL,
	"wishlist" jsonb DEFAULT '[]'::jsonb,
	"saved_addresses" jsonb DEFAULT '[]'::jsonb,
	"orders" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "user_type" "user_type" DEFAULT 'platform_user' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "user_type" "user_type" DEFAULT 'platform_user' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "current_organization_id" text;--> statement-breakpoint
ALTER TABLE "store_customers" ADD CONSTRAINT "store_customers_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_customers" ADD CONSTRAINT "store_customers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;