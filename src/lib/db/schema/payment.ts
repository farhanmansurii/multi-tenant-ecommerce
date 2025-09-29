import { relations, sql } from "drizzle-orm";
import {
	jsonb,
	pgTable,
	text,
	timestamp,
	integer,
	pgEnum,
} from "drizzle-orm/pg-core";
import { orders } from "./ecommerce";
import { stores } from "./core";



export const paymentMethodEnum = pgEnum("payment_method", [
	"stripe",
	"paypal",
	"upi",
	"cod",
	"bank_transfer",
]);

export const paymentStatusEnum = pgEnum("payment_status_enum", [
	"pending",
	"processing",
	"succeeded",
	"failed",
	"cancelled",
	"refunded",
	"partially_refunded",
]);

export const payments = pgTable("payments", {
	id: text("id").primaryKey(),
	storeId: text("store_id")
		.notNull()
		.references(() => stores.id, { onDelete: "cascade" }),
	orderId: text("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	amountCents: integer("amount_cents").notNull(),
	currency: text("currency").notNull().default("INR"),
	method: paymentMethodEnum("method").notNull(),
	status: paymentStatusEnum("status").notNull().default("pending"),
	transactionId: text("transaction_id"),
	gatewayResponse: jsonb("gateway_response").$type<{
		gateway: string
		gatewayTransactionId?: string
		gatewayResponse?: Record<string, unknown>
		error?: string
	}>().default(sql`'{}'::jsonb`),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
	// Unique constraint on store_id + transaction_id (when not null)
	sql`UNIQUE(${table.storeId}, ${table.transactionId}) WHERE ${table.transactionId} IS NOT NULL`,
]);

export const paymentsRelations = relations(payments, ({ one }) => ({
	store: one(stores, {
		fields: [payments.storeId],
		references: [stores.id],
	}),
	order: one(orders, {
		fields: [payments.orderId],
		references: [orders.id],
	}),
}));
