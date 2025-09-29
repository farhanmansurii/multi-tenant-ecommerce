ALTER TABLE "account" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "user_type";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "user_type";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "current_organization_id";--> statement-breakpoint
DROP TYPE "public"."user_type";