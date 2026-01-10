import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

type DrizzleDb = ReturnType<typeof drizzle>;

interface GlobalWithDb {
	__drizzleDb?: DrizzleDb;
}

const globalWithDb = globalThis as typeof globalThis & GlobalWithDb;

function createDb(): DrizzleDb {
	const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL or POSTGRES_URL is not set");
	}

	// Vercel Postgres requires SSL connections
	// Check if sslmode is already in the connection string
	const requiresSSL = connectionString.includes("sslmode=require") ||
		connectionString.includes("sslmode=prefer") ||
		process.env.VERCEL_ENV !== undefined; // Vercel environment

	const ssl = requiresSSL ? "require" : (process.env.NODE_ENV === "production" ? "require" : undefined);

	const queryClient = postgres(connectionString, {
		ssl,
		prepare: false,
		max: 10,
	});

	return drizzle(queryClient, { schema });
}

export const db = globalWithDb.__drizzleDb ?? (globalWithDb.__drizzleDb = createDb());

export type Database = typeof db;

