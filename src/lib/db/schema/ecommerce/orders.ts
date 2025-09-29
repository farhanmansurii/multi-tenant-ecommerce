import { sql } from "drizzle-orm";
import {
	jsonb,
	pgTable,
	text,
	timestamp,
	integer,
	bigint,
	pgEnum,
} from "drizzle-orm/pg-core";

import { stores } from "../core/stores";
import { storeCustomers } from "../core/store-customers";

export const orderStatusEnum = pgEnum("order_status", [
	"pending",
	"confirmed",
	"processing",
	"shipped",
	"delivered",
	"cancelled",
	"refunded",
]);


export const orderPaymentStatusEnum = pgEnum("order_payment_status_enum", [
	"pending",
	"processing",
	"succeeded",
	"failed",
	"cancelled",
	"refunded",
	"partially_refunded",
]);
export const orders = pgTable("orders", {
	id: text("id").primaryKey(),
	storeId: text("store_id")
		.notNull()
		.references(() => stores.id, { onDelete: "cascade" }),
	customerId: text("customer_id")
		.notNull()
		.references(() => storeCustomers.id, { onDelete: "cascade" }),
	orderNumber: bigint("order_number", { mode: "number" }).notNull(),
	status: orderStatusEnum("status").notNull().default("pending"),
	amounts: jsonb("amounts").$type<{
		subtotal: number;
		tax: number;
		shipping: number;
		discount: number;
		total: number;
	}>().notNull(),
	currency: text("currency").notNull().default("INR"),
	paymentStatus: orderPaymentStatusEnum("payment_status").notNull().default("pending"),
	shippingAddress: jsonb("shipping_address").$type<{
		recipient: string;
		line1: string;
		line2?: string;
		city: string;
		state: string;
		postalCode: string;
		country: string;
		phone?: string;
	}>().notNull(),
	billingAddress: jsonb("billing_address").$type<{
		recipient: string;
		line1: string;
		line2?: string;
		city: string;
		state: string;
		postalCode: string;
		country: string;
		phone?: string;
	}>().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
	// Unique constraint on store_id + order_number
	sql`UNIQUE(${table.storeId}, ${table.orderNumber})`,
]);

export const orderItems = pgTable("order_items", {
	id: text("id").primaryKey(),
	storeId: text("store_id").notNull(),
	orderId: text("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	productId: text("product_id").notNull(),
	variantId: text("variant_id"),
	qty: integer("qty").notNull(),
	unitPriceCents: integer("unit_price_cents").notNull(),
	totalPriceCents: integer("total_price_cents").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});


