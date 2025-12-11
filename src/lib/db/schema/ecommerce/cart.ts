import { sql } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	integer,
	pgEnum,
} from "drizzle-orm/pg-core";

import { stores } from "../core/stores";
import { storeCustomers } from "../core/store-customers";
import { products } from "./products";
import { productVariants } from "./product-variants";

export const cartStatusEnum = pgEnum("cart_status", [
	"active",
	"abandoned",
	"converted", // Converted to order
	"expired",
]);

export const carts = pgTable("carts", {
	id: text("id").primaryKey(),
	storeId: text("store_id")
		.notNull()
		.references(() => stores.id, { onDelete: "cascade" }),
	customerId: text("customer_id")
		.references(() => storeCustomers.id, { onDelete: "set null" }), // Nullable for guest carts
	sessionId: text("session_id"), // For guest cart identification
	status: cartStatusEnum("status").notNull().default("active"),
	currency: text("currency").notNull().default("INR"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
	// Unique constraint on store_id + session_id for guest carts
	sql`UNIQUE(${table.storeId}, ${table.sessionId}) WHERE ${table.sessionId} IS NOT NULL`,
]);

export const cartItems = pgTable("cart_items", {
	id: text("id").primaryKey(),
	cartId: text("cart_id")
		.notNull()
		.references(() => carts.id, { onDelete: "cascade" }),
	storeId: text("store_id")
		.notNull()
		.references(() => stores.id, { onDelete: "cascade" }),
	productId: text("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "cascade" }),
	variantId: text("variant_id")
		.references(() => productVariants.id, { onDelete: "set null" }),
	qty: integer("qty").notNull().default(1),
	unitPriceCents: integer("unit_price_cents").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
	// Unique constraint on cart_id + product_id + variant_id to prevent duplicates
	sql`UNIQUE(${table.cartId}, ${table.productId}, COALESCE(${table.variantId}, ''))`,
]);
