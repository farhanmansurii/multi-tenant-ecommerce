import { sql } from "drizzle-orm";
import {
	boolean,
	numeric,
	jsonb,
	pgTable,
	text,
	timestamp,
	pgEnum,
} from "drizzle-orm/pg-core";

export const storeStatusEnum = pgEnum("store_status", ["draft", "active", "suspended"]);

export type ShippingRate = {
	name: string;
	price: number;
	estimatedDays: string;
};

export const stores = pgTable("stores", {
	id: text("id").primaryKey(),
	ownerUserId: text("owner_user_id").notNull(), // Changed from ownerId to match proposal
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	tagline: text("tagline"),
	description: text("description").notNull(),
	contactEmail: text("contact_email").notNull(),
	contactPhone: text("contact_phone"),
	website: text("website"),
	businessType: text("business_type").notNull(),
	businessName: text("business_name").notNull(),
	taxId: text("tax_id"),
	addressLine1: text("address_line1").notNull(),
	city: text("city").notNull(),
	state: text("state").notNull(),
	zipCode: text("zip_code").notNull(),
	country: text("country").notNull(),
	logo: text("logo"),
	favicon: text("favicon"),
	primaryColor: text("primary_color").notNull(),
	secondaryColor: text("secondary_color"),
	currency: text("currency").notNull().default("INR"),
	timezone: text("timezone").notNull().default("Asia/Kolkata"),
	language: text("language").notNull().default("en"),
	settings: jsonb("settings").$type<{
		paymentMethods: string[];
		shippingRates: ShippingRate[];
		upiId?: string;
		codEnabled: boolean;
		stripeAccountId?: string;
		paypalEmail?: string;
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

