import "dotenv/config";
import postgres from "postgres";

type Row = Record<string, unknown>;

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or POSTGRES_URL must be set");
}

const requiresSSL =
  connectionString.includes("sslmode=require") ||
  connectionString.includes("sslmode=prefer") ||
  process.env.VERCEL_ENV !== undefined;

const sql = postgres(connectionString, {
  ssl: requiresSSL ? "require" : undefined,
  max: 1,
});

async function runCheck(label: string, query: Promise<Row[]>) {
  const rows = await query;
  return { label, rows };
}

async function main() {
  const checks = await Promise.all([
    runCheck(
      "products with missing store",
      sql`
        SELECT p.id, p.store_id
        FROM products p
        LEFT JOIN stores s ON s.id = p.store_id
        WHERE s.id IS NULL
        LIMIT 25
      `,
    ),
    runCheck(
      "product_variants with missing store",
      sql`
        SELECT pv.id, pv.store_id
        FROM product_variants pv
        LEFT JOIN stores s ON s.id = pv.store_id
        WHERE s.id IS NULL
        LIMIT 25
      `,
    ),
    runCheck(
      "categories with missing store",
      sql`
        SELECT c.id, c.store_id, c.slug
        FROM categories c
        LEFT JOIN stores s ON s.id = c.store_id
        WHERE s.id IS NULL
        LIMIT 25
      `,
    ),
    runCheck(
      "tags with missing store",
      sql`
        SELECT t.id, t.store_id, t.slug
        FROM tags t
        LEFT JOIN stores s ON s.id = t.store_id
        WHERE s.id IS NULL
        LIMIT 25
      `,
    ),
    runCheck(
      "order_items with missing store",
      sql`
        SELECT oi.id, oi.store_id, oi.order_id
        FROM order_items oi
        LEFT JOIN stores s ON s.id = oi.store_id
        WHERE s.id IS NULL
        LIMIT 25
      `,
    ),
    runCheck(
      "order_items with missing order",
      sql`
        SELECT oi.id, oi.order_id, oi.store_id
        FROM order_items oi
        LEFT JOIN orders o ON o.id = oi.order_id
        WHERE o.id IS NULL
        LIMIT 25
      `,
    ),
    runCheck(
      "order_items with missing product",
      sql`
        SELECT oi.id, oi.product_id, oi.store_id
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE p.id IS NULL
        LIMIT 25
      `,
    ),
    runCheck(
      "order_items with missing variant",
      sql`
        SELECT oi.id, oi.variant_id, oi.store_id
        FROM order_items oi
        LEFT JOIN product_variants pv ON pv.id = oi.variant_id
        WHERE oi.variant_id IS NOT NULL AND oi.variant_id <> '' AND pv.id IS NULL
        LIMIT 25
      `,
    ),
    runCheck(
      "duplicate category slugs per store",
      sql`
        SELECT c.store_id, c.slug, COUNT(*)::int AS duplicates
        FROM categories c
        GROUP BY c.store_id, c.slug
        HAVING COUNT(*) > 1
        LIMIT 25
      `,
    ),
    runCheck(
      "duplicate tag slugs per store",
      sql`
        SELECT t.store_id, t.slug, COUNT(*)::int AS duplicates
        FROM tags t
        GROUP BY t.store_id, t.slug
        HAVING COUNT(*) > 1
        LIMIT 25
      `,
    ),
  ]);

  const failing = checks.filter((check) => check.rows.length > 0);

  if (failing.length > 0) {
    console.error("❌ Schema integrity verification failed:");
    for (const check of failing) {
      console.error(`\n--- ${check.label} ---`);
      console.table(check.rows);
    }
    await sql.end();
    process.exit(1);
  }

  console.log("✅ Schema integrity verification passed");
  await sql.end();
}

main().catch(async (error) => {
  console.error("❌ Unexpected error while verifying schema integrity:", error);
  await sql.end();
  process.exit(1);
});
