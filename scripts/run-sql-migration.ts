import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

async function main() {
  const migrationPath = process.argv[2];
  if (!migrationPath) {
    throw new Error("Usage: tsx scripts/run-sql-migration.ts <sql-file>");
  }

  const absolutePath = path.resolve(process.cwd(), migrationPath);
  const sqlSource = await fs.readFile(absolutePath, "utf8");

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

  try {
    console.log(`▶ Running migration: ${migrationPath}`);
    await sql.unsafe(sqlSource);
    console.log("✅ Migration completed");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("❌ Failed to run migration:", error);
  process.exit(1);
});
