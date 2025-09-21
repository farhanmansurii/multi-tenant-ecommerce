ALTER TABLE "stores" ADD COLUMN "upi_id" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "cod_enabled" boolean DEFAULT true NOT NULL;