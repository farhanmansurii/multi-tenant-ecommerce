import { relations, sql } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

import { stores } from './store';
import { user } from './auth';

export const storefrontRoleEnum = pgEnum('storefront_role', ['storefront_customer', 'store_admin']);

export const storeCustomers = pgTable('store_customers', {
	id: text('id').primaryKey(),
	storeId: text('store_id')
		.references(() => stores.id, { onDelete: 'cascade' })
		.notNull(),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	role: storefrontRoleEnum('role').notNull().default('storefront_customer'),
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
});

export const storeCustomersRelations = relations(storeCustomers, ({ one }) => ({
	store: one(stores, {
		fields: [storeCustomers.storeId],
		references: [stores.id],
	}),
	user: one(user, {
		fields: [storeCustomers.userId],
		references: [user.id],
	}),
}));
