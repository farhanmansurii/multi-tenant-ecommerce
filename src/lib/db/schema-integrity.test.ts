import { afterAll, beforeAll, describe, expect, it } from "vitest";
import postgres from "postgres";

const runDbSchemaTests = process.env.RUN_DB_SCHEMA_TESTS === "1";
const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const dbDescribe = runDbSchemaTests && dbUrl ? describe : describe.skip;

dbDescribe("database schema integrity", () => {
  let sql: postgres.Sql<{}>;

  beforeAll(async () => {
    const resolvedUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!resolvedUrl) {
      throw new Error("DATABASE_URL or POSTGRES_URL is required for schema integrity tests");
    }

    sql = postgres(resolvedUrl, {
      ssl:
        resolvedUrl.includes("sslmode=require") ||
        resolvedUrl.includes("sslmode=prefer") ||
        process.env.VERCEL_ENV !== undefined
          ? "require"
          : undefined,
      max: 1,
    });

    // Fail fast if required constraints are still missing.
    const requiredConstraints = await sql`
      SELECT conname
      FROM pg_constraint
      WHERE conname IN (
        'products_store_id_fkey',
        'product_variants_store_id_fkey',
        'categories_store_id_fkey',
        'tags_store_id_fkey'
      )
    `;
    expect(requiredConstraints.length).toBe(4);
  });

  afterAll(async () => {
    await sql.end();
  });

  async function expectForeignKeyViolation(runInsert: () => Promise<unknown>) {
    await sql`BEGIN`;
    try {
      let violation: unknown = null;
      try {
        await runInsert();
      } catch (error) {
        violation = error;
      }

      const code = (violation as { code?: string } | null)?.code;
      expect(code).toBe("23503");
    } finally {
      await sql`ROLLBACK`;
    }
  }

  it("rejects product insert with missing store", async () => {
    await expectForeignKeyViolation(() =>
      sql`
        INSERT INTO products (id, store_id, name, slug, description, price)
        VALUES (${crypto.randomUUID()}, ${`missing-store-${Date.now()}`}, 'x', ${`x-${Date.now()}`}, 'x', 1)
      `,
    );
  });

  it("rejects product_variant insert with missing store", async () => {
    await expectForeignKeyViolation(() =>
      sql`
        INSERT INTO product_variants (id, store_id, product_id, sku, price_cents)
        VALUES (
          ${crypto.randomUUID()},
          ${`missing-store-${Date.now()}`},
          ${`missing-product-${Date.now()}`},
          ${`sku-${Date.now()}`},
          100
        )
      `,
    );
  });

  it("rejects category insert with missing store", async () => {
    await expectForeignKeyViolation(() =>
      sql`
        INSERT INTO categories (id, store_id, name, slug)
        VALUES (${`cat-${Date.now()}`}, ${`missing-store-${Date.now()}`}, 'x', ${`cat-${Date.now()}`})
      `,
    );
  });

  it("rejects tag insert with missing store", async () => {
    await expectForeignKeyViolation(() =>
      sql`
        INSERT INTO tags (id, store_id, name, slug)
        VALUES (${`tag-${Date.now()}`}, ${`missing-store-${Date.now()}`}, 'x', ${`tag-${Date.now()}`})
      `,
    );
  });

  it("uses order_items indexes in query plans", async () => {
    await sql`BEGIN`;
    try {
      await sql`SET LOCAL enable_seqscan = off`;

      const orderProductPlan = await sql`
        EXPLAIN SELECT *
        FROM order_items
        WHERE order_id = 'order-x' AND product_id = 'product-x'
      `;

      const variantPlan = await sql`
        EXPLAIN SELECT *
        FROM order_items
        WHERE variant_id = 'variant-x'
      `;

      const orderPlanText = orderProductPlan.map((row) => String(row["QUERY PLAN"])).join("\n");
      const variantPlanText = variantPlan.map((row) => String(row["QUERY PLAN"])).join("\n");

      expect(orderPlanText).toContain("order_items_order_product_idx");
      expect(variantPlanText).toContain("order_items_variant_id_idx");
    } finally {
      await sql`ROLLBACK`;
    }
  });
});
