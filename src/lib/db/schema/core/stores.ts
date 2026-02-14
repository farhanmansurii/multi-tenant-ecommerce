import { sql } from "drizzle-orm";
import {
	boolean,
	jsonb,
	pgTable,
	text,
	timestamp,
	pgEnum,
} from "drizzle-orm/pg-core";

export const storeStatusEnum = pgEnum("store_status", ["draft", "active", "suspended"]);

export const stores = pgTable("stores", {
	id: text("id").primaryKey(),
	ownerUserId: text("owner_user_id").notNull(), // Changed from ownerId to match proposal
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description").notNull(),
	contactEmail: text("contact_email").notNull(),
	logo: text("logo"),
	primaryColor: text("primary_color").notNull(),
	currency: text("currency").notNull().default("USD"),
	settings: jsonb("settings").$type<{
		paymentMethods: Array<"stripe" | "cod">;
		codEnabled: boolean;
		shippingEnabled: boolean;
		freeShippingThreshold?: number;
		termsOfService: string;
		privacyPolicy: string;
		refundPolicy: string;
	}>().default(sql`'{}'::jsonb`),
	status: storeStatusEnum("status").notNull().default("draft"),
	featured: boolean("featured").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storeMembers = pgTable("store_members", {
	id: text("id").primaryKey(),
	storeId: text("store_id").notNull(),
	userId: text("user_id").notNull(),
	role: text("role").notNull().default("member"), // owner, admin, member
	permissions: jsonb("permissions").$type<{
		canManageProducts: boolean;
		canManageOrders: boolean;
		canManageCustomers: boolean;
		canManageSettings: boolean;
		canViewAnalytics: boolean;
	}>().default(sql`'{}'::jsonb`),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
	// Unique constraint on store_id + user_id
	sql`UNIQUE(${table.storeId}, ${table.userId})`,
]);
