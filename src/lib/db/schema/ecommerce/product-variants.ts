import { sql } from "drizzle-orm";
import {
	jsonb,
	pgTable,
	text,
	timestamp,
	integer,
} from "drizzle-orm/pg-core";

import { products } from "./products";

export const productVariants = pgTable("product_variants", {
	id: text("id").primaryKey(),
	storeId: text("store_id").notNull(),
	productId: text("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "cascade" }),
	sku: text("sku").notNull(),
	priceCents: integer("price_cents").notNull(),
	currency: text("currency").notNull().default("INR"),
	inventory: integer("inventory").notNull().default(0),
	attributes: jsonb("attributes").$type<Record<string, string>>().default(sql`'{}'::jsonb`),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
	// Unique constraint on store_id + sku
	sql`UNIQUE(${table.storeId}, ${table.sku})`,
]);

// Relations are defined in relations.ts
