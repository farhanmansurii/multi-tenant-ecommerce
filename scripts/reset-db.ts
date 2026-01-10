import "dotenv/config";
import postgres from "postgres";

async function resetDatabase() {
	const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL or POSTGRES_URL is not set");
	}

	const requiresSSL = connectionString.includes("sslmode=require") ||
		connectionString.includes("sslmode=prefer") ||
		process.env.VERCEL_ENV !== undefined;

	const sql = postgres(connectionString, {
		ssl: requiresSSL ? "require" : undefined,
		max: 1,
	});

	try {
		console.log("🔄 Starting database reset...");
		console.log("   This will delete ALL tables, enums, and other objects in the public schema!\n");

		// Drop all tables with CASCADE to handle dependencies
		const tables = await sql`
			SELECT tablename
			FROM pg_tables
			WHERE schemaname = 'public'
		`;

		if (tables.length > 0) {
			console.log(`  Dropping ${tables.length} table(s)...`);
			for (const table of tables) {
				console.log(`    - ${table.tablename}`);
				await sql.unsafe(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`);
			}
		} else {
			console.log("  No tables to drop");
		}

		// Drop all enum types
		const enums = await sql`
			SELECT typname
			FROM pg_type
			WHERE typtype = 'e'
			AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
		`;

		if (enums.length > 0) {
			console.log(`\n  Dropping ${enums.length} enum(s)...`);
			for (const enumType of enums) {
				console.log(`    - ${enumType.typname}`);
				await sql.unsafe(`DROP TYPE IF EXISTS "${enumType.typname}" CASCADE`);
			}
		} else {
			console.log("\n  No enums to drop");
		}

		// Drop all sequences (in case any remain)
		const sequences = await sql`
			SELECT sequence_name
			FROM information_schema.sequences
			WHERE sequence_schema = 'public'
		`;

		if (sequences.length > 0) {
			console.log(`\n  Dropping ${sequences.length} sequence(s)...`);
			for (const seq of sequences) {
				console.log(`    - ${seq.sequence_name}`);
				await sql.unsafe(`DROP SEQUENCE IF EXISTS "${seq.sequence_name}" CASCADE`);
			}
		}

		// Drop all functions (if any)
		const functions = await sql`
			SELECT routine_name
			FROM information_schema.routines
			WHERE routine_schema = 'public'
			AND routine_type = 'FUNCTION'
		`;

		if (functions.length > 0) {
			console.log(`\n  Dropping ${functions.length} function(s)...`);
			for (const func of functions) {
				console.log(`    - ${func.routine_name}`);
				await sql.unsafe(`DROP FUNCTION IF EXISTS "${func.routine_name}" CASCADE`);
			}
		}

		// Drop all views
		const views = await sql`
			SELECT table_name
			FROM information_schema.views
			WHERE table_schema = 'public'
		`;

		if (views.length > 0) {
			console.log(`\n  Dropping ${views.length} view(s)...`);
			for (const view of views) {
				console.log(`    - ${view.table_name}`);
				await sql.unsafe(`DROP VIEW IF EXISTS "${view.table_name}" CASCADE`);
			}
		}

		console.log("\n✅ Database reset complete!");
		console.log("\n📝 Next steps:");
		console.log("   Run: npx drizzle-kit push");
	} catch (error) {
		console.error("\n❌ Error resetting database:", error);
		throw error;
	} finally {
		await sql.end();
	}
}

resetDatabase().catch(console.error);
