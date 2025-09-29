import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

import { stores } from './stores';
import { user } from '../auth/users';

export const storefrontRoleEnum = pgEnum('storefront_role', ['storefront_customer', 'store_admin']);

export const storeCustomers = pgTable('store_customers', {
	id: text('id').primaryKey(),
	storeId: text('store_id')
		.references(() => stores.id, { onDelete: 'cascade' })
		.notNull(),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' }), // Made nullable for guest customers
	email: text('email').notNull(),
	data: jsonb('data').$type<{
		name?: string
		phone?: string
		preferences?: Record<string, unknown>
	}>().default(sql`'{}'::jsonb`),
	wishlist: jsonb('wishlist')
		.$type<
			Array<{
				productId: string;
				productSlug: string;
				addedAt: string;
			}>
		>()
		.default(sql`'[]'::jsonb`),
	savedAddresses: jsonb('saved_addresses')
		.$type<
			Array<{
				id: string;
				label: string;
				recipient: string;
				line1: string;
				line2?: string | null;
				city: string;
				state: string;
				postalCode: string;
				country: string;
				isDefault?: boolean;
			}>
		>()
		.default(sql`'[]'::jsonb`),
	orders: jsonb('orders')
		.$type<
			Array<{
				id: string;
				orderNumber: string;
				status: string;
				totalAmount: number;
				currency: string;
				items: number;
				placedAt: string;
			}>
		>()
		.default(sql`'[]'::jsonb`),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
	// Unique constraint on store_id + email
	sql`UNIQUE(${table.storeId}, ${table.email})`,
]);
