import { relations } from "drizzle-orm";

import { user, session, account } from "./auth";
import { stores, storeMembers, storeCustomers } from "./core";
import { products, productVariants, categories, orders, orderItems, payments } from "./ecommerce";

// Auth relations
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	storeMembers: many(storeMembers),
	storeCustomers: many(storeCustomers),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

// Core relations
export const storesRelations = relations(stores, ({ one, many }) => ({
	owner: one(user, {
		fields: [stores.ownerUserId],
		references: [user.id],
	}),
	members: many(storeMembers),
	customers: many(storeCustomers),
	products: many(products),
	categories: many(categories),
	orders: many(orders),
	payments: many(payments),
}));

export const storeMembersRelations = relations(storeMembers, ({ one }) => ({
	store: one(stores, {
		fields: [storeMembers.storeId],
		references: [stores.id],
	}),
	user: one(user, {
		fields: [storeMembers.userId],
		references: [user.id],
	}),
}));

export const storeCustomersRelations = relations(storeCustomers, ({ one, many }) => ({
	store: one(stores, {
		fields: [storeCustomers.storeId],
		references: [stores.id],
	}),
	user: one(user, {
		fields: [storeCustomers.userId],
		references: [user.id],
	}),
	orders: many(orders),
}));

// Ecommerce relations
export const productsRelations = relations(products, ({ one, many }) => ({
	store: one(stores, {
		fields: [products.storeId],
		references: [stores.id],
	}),
	variants: many(productVariants),
	orderItems: many(orderItems),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.id],
	}),
}));

export const categoriesRelations = relations(categories, ({ one }) => ({
	store: one(stores, {
		fields: [categories.storeId],
		references: [stores.id],
	}),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
	store: one(stores, {
		fields: [orders.storeId],
		references: [stores.id],
	}),
	customer: one(storeCustomers, {
		fields: [orders.customerId],
		references: [storeCustomers.id],
	}),
	items: many(orderItems),
	payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id],
	}),
}));

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
