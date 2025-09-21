ALTER TABLE "stores" ALTER COLUMN "currency" SET DEFAULT 'INR';--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "timezone" SET DEFAULT 'Asia/Kolkata';--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "language" SET DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "stripe_account_id" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "paypal_email" text;--> statement-breakpoint
DROP TYPE "public"."store_status";