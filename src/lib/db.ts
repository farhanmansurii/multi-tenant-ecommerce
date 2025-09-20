import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

type DrizzleDb = ReturnType<typeof drizzle>;

interface GlobalWithDb {
	__drizzleDb?: DrizzleDb;
}

const globalWithDb = globalThis as typeof globalThis & GlobalWithDb;

function createDb(): DrizzleDb {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL is not set");
	}

	const ssl = process.env.NODE_ENV === "production" ? "require" : undefined;

	const queryClient = postgres(connectionString, {
		ssl,
		prepare: false,
	});

	return drizzle(queryClient, { schema });
}

export const db = globalWithDb.__drizzleDb ?? (globalWithDb.__drizzleDb = createDb());

export type Database = typeof db;

