import { z } from "zod";

// Create customer
export const createCustomerSchema = z.object({
	email: z.string().email("Invalid email address"),
	userId: z.string().optional(),
	data: z
		.object({
			name: z.string().optional(),
			phone: z.string().optional(),
			preferences: z.record(z.unknown()).optional(),
		})
		.optional(),
});

// Update customer
export const updateCustomerSchema = z.object({
	email: z.string().email("Invalid email address").optional(),
	data: z
		.object({
			name: z.string().optional(),
			phone: z.string().optional(),
			preferences: z.record(z.unknown()).optional(),
		})
		.optional(),
});

// Customer list query params
export const customerQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	search: z.string().optional(), // Search by email or name
});

// Add to wishlist
export const addToWishlistSchema = z.object({
	productId: z.string().min(1, "Product ID is required"),
	productSlug: z.string().min(1, "Product slug is required"),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;
export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
