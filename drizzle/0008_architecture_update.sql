-- Migration: Update schemas for multi-tenant architecture
-- This migration implements the architecture proposal changes

-- Create new enums
CREATE TYPE "store_status" AS ENUM('draft', 'active', 'suspended');
CREATE TYPE "order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE "order_payment_status_enum" AS ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded');
CREATE TYPE "payment_method" AS ENUM('stripe', 'paypal', 'upi', 'cod', 'bank_transfer');
CREATE TYPE "payment_status_enum" AS ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded');

-- Update stores table
ALTER TABLE "stores" RENAME COLUMN "owner_id" TO "owner_user_id";
ALTER TABLE "stores" ADD COLUMN "settings" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "stores" DROP COLUMN IF EXISTS "payment_methods";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "upi_id";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "cod_enabled";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "stripe_account_id";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "paypal_email";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "shipping_enabled";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "free_shipping_threshold";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "shipping_rates";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "terms_of_service";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "privacy_policy";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "refund_policy";
-- First, update any invalid status values to 'draft'
UPDATE "stores" SET "status" = 'draft' WHERE "status" NOT IN ('draft', 'active', 'suspended');
-- Then change the column type
ALTER TABLE "stores" ALTER COLUMN "status" TYPE "store_status" USING "status"::"store_status";

-- Create store_members table
CREATE TABLE IF NOT EXISTS "store_members" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"permissions" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_members_store_id_user_id_unique" UNIQUE("store_id","user_id")
);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"product_id" text NOT NULL,
	"sku" text NOT NULL,
	"price_cents" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"inventory" integer DEFAULT 0 NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_store_id_sku_unique" UNIQUE("store_id","sku")
);

-- Update products table
ALTER TABLE "products" DROP COLUMN IF EXISTS "variants";

-- Create orders table
CREATE TABLE IF NOT EXISTS "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"order_number" bigint NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"amounts" jsonb NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"payment_status" "order_payment_status_enum" DEFAULT 'pending' NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"billing_address" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_store_id_order_number_unique" UNIQUE("store_id","order_number")
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"variant_id" text,
	"qty" integer NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"total_price_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"order_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status_enum" DEFAULT 'pending' NOT NULL,
	"transaction_id" text,
	"gateway_response" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_store_id_transaction_id_unique" UNIQUE("store_id","transaction_id") WHERE "transaction_id" IS NOT NULL
);

-- Update store_customers table
ALTER TABLE "store_customers" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "store_customers" ADD COLUMN "email" text NOT NULL;
ALTER TABLE "store_customers" ADD COLUMN "data" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "store_customers" DROP COLUMN IF EXISTS "role";
ALTER TABLE "store_customers" ADD CONSTRAINT "store_customers_store_id_email_unique" UNIQUE("store_id","email");

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "store_members" ADD CONSTRAINT "store_members_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_store_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "store_customers"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
