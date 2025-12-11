import { z } from "zod";

// Add item to cart
export const addToCartSchema = z.object({
	productId: z.string().min(1, "Product ID is required"),
	variantId: z.string().optional(),
	qty: z.number().int().positive().default(1),
});

// Update cart item quantity
export const updateCartItemSchema = z.object({
	qty: z.number().int().positive("Quantity must be positive"),
});

// Cart query params
export const cartQuerySchema = z.object({
	sessionId: z.string().optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartQueryInput = z.infer<typeof cartQuerySchema>;
