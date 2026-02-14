import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or POSTGRES_URL must be set to run tenant integrity checks");
}

const requiresSSL =
  connectionString.includes("sslmode=require") ||
  connectionString.includes("sslmode=prefer") ||
  process.env.VERCEL_ENV !== undefined;

const sql = postgres(connectionString, {
  ssl: requiresSSL ? "require" : undefined,
  max: 1,
});

type CheckResult = {
  label: string;
  rows: Record<string, unknown>[];
};

async function runCheck(label: string, query: Promise<Record<string, unknown>[]>) {
  const rows = await query;
  return { label, rows };
}

async function checkOrderItemsConsistency(): Promise<CheckResult> {
  const invalidOrders = await sql`
    SELECT oi.id, oi.store_id, oi.order_id, oi.variant_id
    FROM order_items oi
    WHERE NOT EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.id = oi.order_id
    )
    LIMIT 25;
  `;

  const mismatchedStores = await sql`
    SELECT oi.id, oi.order_id, oi.store_id, o.store_id AS order_store_id
    FROM order_items oi
    INNER JOIN orders o ON o.id = oi.order_id
    WHERE oi.store_id <> o.store_id
    LIMIT 25;
  `;

  return { label: "order_items anomalies", rows: [...invalidOrders, ...mismatchedStores] };
}

async function checkCustomerOrderParity(): Promise<CheckResult> {
  const mismatches = await sql`
    SELECT
      sc.store_id,
      sc.id AS customer_id,
      sc.email,
      COALESCE(jsonb_array_length(sc.orders), 0) AS cached_orders,
      COALESCE(o.order_count, 0) AS actual_orders
    FROM store_customers sc
    LEFT JOIN (
      SELECT store_id, customer_id, COUNT(*) AS order_count
      FROM orders
      GROUP BY store_id, customer_id
    ) o ON o.store_id = sc.store_id AND o.customer_id = sc.id
    WHERE COALESCE(jsonb_array_length(sc.orders), 0) <> COALESCE(o.order_count, 0)
    LIMIT 25;
  `;

  return { label: "customer order parity", rows: mismatches };
}

async function main() {
  const issues: CheckResult[] = [];

  issues.push(
    await runCheck(
      "products missing store",
      sql`
        SELECT store_id, COUNT(*) AS orphan_count
        FROM products
        WHERE store_id NOT IN (SELECT id FROM stores)
        GROUP BY store_id
        ORDER BY orphan_count DESC
        LIMIT 25;
      `,
    ),
  );

  issues.push(
    await runCheck(
      "product_variants missing store",
      sql`
        SELECT store_id, COUNT(*) AS orphan_count
        FROM product_variants
        WHERE store_id NOT IN (SELECT id FROM stores)
        GROUP BY store_id
        ORDER BY orphan_count DESC
        LIMIT 25;
      `,
    ),
  );

  issues.push(
    await runCheck(
      "categories duplicate slugs",
      sql`
        SELECT store_id, slug, COUNT(*) AS duplicates
        FROM categories
        GROUP BY store_id, slug
        HAVING COUNT(*) > 1
        ORDER BY duplicates DESC
        LIMIT 25;
      `,
    ),
  );

  issues.push(
    await runCheck(
      "tags duplicate slugs",
      sql`
        SELECT store_id, slug, COUNT(*) AS duplicates
        FROM tags
        GROUP BY store_id, slug
        HAVING COUNT(*) > 1
        ORDER BY duplicates DESC
        LIMIT 25;
      `,
    ),
  );

  issues.push(await checkOrderItemsConsistency());
  issues.push(await checkCustomerOrderParity());

  const failingChecks = issues.filter(({ rows }) => rows.length > 0);

  if (failingChecks.length > 0) {
    console.error("❌ Tenant integrity validation failed:");
    for (const issue of failingChecks) {
      console.error(`\n--- ${issue.label} ---`);
      console.table(issue.rows.slice(0, 10));
    }
    await sql.end();
    process.exit(1);
  }

  console.log("✅ Tenant integrity checks passed");
  await sql.end();
}

main().catch(async (error) => {
  console.error("❌ Unexpected error while running tenant integrity checks:", error);
  await sql.end();
  process.exit(1);
});
