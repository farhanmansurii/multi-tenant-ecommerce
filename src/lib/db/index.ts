import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";
import { logger } from "@/lib/api/logger";

type DrizzleDb = ReturnType<typeof drizzle>;

interface GlobalWithDb {
	__drizzleDb?: DrizzleDb;
}

const globalWithDb = globalThis as typeof globalThis & GlobalWithDb;

function createDb(): DrizzleDb {
	const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
	if (!connectionString) {
		logger.error("Database connection failed", new Error("DATABASE_URL or POSTGRES_URL is not set"));
		throw new Error("DATABASE_URL or POSTGRES_URL is not set");
	}

	const requiresSSL =
		connectionString.includes("sslmode=require") ||
		connectionString.includes("sslmode=prefer");

	const ssl = requiresSSL ? "require" : undefined;

	const queryClient = postgres(connectionString, {
		ssl,
		prepare: false,
		max: 10,
		idle_timeout: 20,
		max_lifetime: 60 * 30,
	});

	logger.info("Database connection established", {
		ssl: ssl || "disabled",
		maxConnections: 10,
	});

	return drizzle(queryClient, { schema });
}

export const db = globalWithDb.__drizzleDb ?? (globalWithDb.__drizzleDb = createDb());

export type Database = typeof db;

