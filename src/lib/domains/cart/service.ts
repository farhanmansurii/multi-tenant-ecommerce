import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/lib/db";
import { carts, cartItems } from "@/lib/db/schema/ecommerce/cart";
import { products } from "@/lib/db/schema/ecommerce/products";
import { productVariants } from "@/lib/db/schema/ecommerce/product-variants";
import type { Cart, CartItem, CartSummary } from "./types";
import type { AddToCartInput, UpdateCartItemInput } from "./validation";

// Get or create a cart for a store
export async function getOrCreateCart(
	storeId: string,
	options: { customerId?: string; sessionId?: string }
): Promise<Cart> {
	const { customerId, sessionId } = options;

	// Try to find existing cart
	let cart = await findCart(storeId, { customerId, sessionId });

	if (!cart) {
		// Create new cart
		const cartId = createId();
		await db.insert(carts).values({
			id: cartId,
			storeId,
			customerId: customerId || null,
			sessionId: sessionId || null,
			status: "active",
		});

		cart = await getCartById(storeId, cartId);
	}

	return cart!;
}

// Find existing cart
export async function findCart(
	storeId: string,
	options: { customerId?: string; sessionId?: string }
): Promise<Cart | null> {
	const { customerId, sessionId } = options;

	let whereClause;
	if (customerId) {
		whereClause = and(
			eq(carts.storeId, storeId),
			eq(carts.customerId, customerId),
			eq(carts.status, "active")
		);
	} else if (sessionId) {
		whereClause = and(
			eq(carts.storeId, storeId),
			eq(carts.sessionId, sessionId),
			eq(carts.status, "active")
		);
	} else {
		return null;
	}

	const result = await db.select().from(carts).where(whereClause).limit(1);

	if (result.length === 0) return null;

	return getCartById(storeId, result[0].id);
}

// Get cart by ID with items
export async function getCartById(storeId: string, cartId: string): Promise<Cart | null> {
	const cartResult = await db
		.select()
		.from(carts)
		.where(and(eq(carts.id, cartId), eq(carts.storeId, storeId)))
		.limit(1);

	if (cartResult.length === 0) return null;

	const cart = cartResult[0];

	// Get cart items with product info
	const items = await db
		.select({
			item: cartItems,
			product: {
				id: products.id,
				name: products.name,
				slug: products.slug,
				images: products.images,
			},
			variant: {
				id: productVariants.id,
				sku: productVariants.sku,
				attributes: productVariants.attributes,
			},
		})
		.from(cartItems)
		.leftJoin(products, eq(cartItems.productId, products.id))
		.leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
		.where(eq(cartItems.cartId, cartId));

	const cartItemsWithProducts: CartItem[] = items.map((row) => ({
		...row.item,
		product: row.product
			? {
					id: row.product.id,
					name: row.product.name,
					slug: row.product.slug,
					images: (row.product.images as Array<{ url: string; alt: string }>) || [],
			  }
			: undefined,
		variant: row.variant
			? {
					id: row.variant.id,
					sku: row.variant.sku,
					attributes: (row.variant.attributes as Record<string, string>) || {},
			  }
			: undefined,
	}));

	const subtotalCents = cartItemsWithProducts.reduce(
		(sum, item) => sum + item.unitPriceCents * item.qty,
		0
	);

	return {
		...cart,
		items: cartItemsWithProducts,
		subtotalCents,
		itemCount: cartItemsWithProducts.reduce((sum, item) => sum + item.qty, 0),
	};
}

// Add item to cart
export async function addItemToCart(
	storeId: string,
	cartId: string,
	input: AddToCartInput
): Promise<CartItem> {
	const { productId, variantId, qty } = input;

	// Get product price
	let priceCents: number;
	if (variantId) {
		const variant = await db
			.select({ priceCents: productVariants.priceCents })
			.from(productVariants)
			.where(eq(productVariants.id, variantId))
			.limit(1);
		if (variant.length === 0) throw new Error("Variant not found");
		priceCents = variant[0].priceCents;
	} else {
		const product = await db
			.select({ price: products.price })
			.from(products)
			.where(eq(products.id, productId))
			.limit(1);
		if (product.length === 0) throw new Error("Product not found");
		// Convert price (stored as numeric/decimal) to cents
		priceCents = Math.round(parseFloat(product[0].price) * 100);
	}

	// Check if item already exists in cart
	const existingItem = await db
		.select()
		.from(cartItems)
		.where(
			and(
				eq(cartItems.cartId, cartId),
				eq(cartItems.productId, productId),
				variantId ? eq(cartItems.variantId, variantId) : eq(cartItems.variantId, "")
			)
		)
		.limit(1);

	if (existingItem.length > 0) {
		// Update quantity
		const newQty = existingItem[0].qty + qty;
		await db
			.update(cartItems)
			.set({ qty: newQty, updatedAt: new Date() })
			.where(eq(cartItems.id, existingItem[0].id));

		return { ...existingItem[0], qty: newQty };
	}

	// Create new cart item
	const itemId = createId();
	await db.insert(cartItems).values({
		id: itemId,
		cartId,
		storeId,
		productId,
		variantId: variantId || null,
		qty,
		unitPriceCents: priceCents,
	});

	const newItem = await db
		.select()
		.from(cartItems)
		.where(eq(cartItems.id, itemId))
		.limit(1);

	return newItem[0];
}

// Update cart item quantity
export async function updateCartItem(
	storeId: string,
	itemId: string,
	input: UpdateCartItemInput
): Promise<CartItem | null> {
	const result = await db
		.update(cartItems)
		.set({ qty: input.qty, updatedAt: new Date() })
		.where(and(eq(cartItems.id, itemId), eq(cartItems.storeId, storeId)))
		.returning();

	return result.length > 0 ? result[0] : null;
}

// Remove item from cart
export async function removeCartItem(storeId: string, itemId: string): Promise<boolean> {
	const result = await db
		.delete(cartItems)
		.where(and(eq(cartItems.id, itemId), eq(cartItems.storeId, storeId)))
		.returning({ id: cartItems.id });

	return result.length > 0;
}

// Clear cart (delete all items)
export async function clearCart(storeId: string, cartId: string): Promise<void> {
	await db
		.delete(cartItems)
		.where(and(eq(cartItems.cartId, cartId), eq(cartItems.storeId, storeId)));
}

// Get cart summary (for header badges, etc.)
export async function getCartSummary(
	storeId: string,
	options: { customerId?: string; sessionId?: string }
): Promise<CartSummary | null> {
	const cart = await findCart(storeId, options);
	if (!cart) return null;

	return {
		id: cart.id,
		itemCount: cart.itemCount,
		subtotalCents: cart.subtotalCents,
		currency: cart.currency,
	};
}

// Mark cart as converted (after order creation)
export async function markCartAsConverted(storeId: string, cartId: string): Promise<void> {
	await db
		.update(carts)
		.set({ status: "converted", updatedAt: new Date() })
		.where(and(eq(carts.id, cartId), eq(carts.storeId, storeId)));
}
