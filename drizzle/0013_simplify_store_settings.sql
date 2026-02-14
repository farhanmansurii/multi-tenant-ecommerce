-- Migration: Simplify store settings for v1 product (no backwards compatibility)

-- Drop unused store profile columns
ALTER TABLE "stores" DROP COLUMN IF EXISTS "tagline";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "contact_phone";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "website";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "business_type";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "business_name";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "tax_id";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "address_line1";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "city";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "state";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "zip_code";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "country";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "favicon";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "secondary_color";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "timezone";
ALTER TABLE "stores" DROP COLUMN IF EXISTS "language";

-- Currency default
ALTER TABLE "stores" ALTER COLUMN "currency" SET DEFAULT 'USD';

-- Clean up legacy keys in settings JSON
UPDATE "stores"
SET "settings" =
  ("settings" - 'shippingRates' - 'upiId' - 'stripeAccountId' - 'paypalEmail')
WHERE "settings" IS NOT NULL;

-- Filter paymentMethods to the new allowed set
UPDATE "stores"
SET "settings" = jsonb_set(
  "settings",
  '{paymentMethods}',
  COALESCE(
    (
      SELECT jsonb_agg(x)
      FROM jsonb_array_elements_text(COALESCE("settings"->'paymentMethods', '[]'::jsonb)) x
      WHERE x IN ('stripe', 'cod')
    ),
    '[]'::jsonb
  ),
  true
)
WHERE "settings" IS NOT NULL AND ("settings" ? 'paymentMethods');

