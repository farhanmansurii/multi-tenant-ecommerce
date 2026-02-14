import * as z from "zod";

export const storeSchema = z.object({
	storeName: z
		.string()
		.min(2, "Store name must be at least 2 characters")
		.max(50, "Store name must be less than 50 characters"),
	storeSlug: z
		.string()
		.min(2, "Store URL must be at least 2 characters")
		.max(30, "Store URL must be less than 30 characters")
		.regex(/^[a-z0-9-]+$/, "Store URL can only contain lowercase letters, numbers, and hyphens"),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(500, "Description must be less than 500 characters"),
	email: z.string().email("Please enter a valid email address"),
	logo: z.string().optional().or(z.literal("")),
	primaryColor: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Please enter a valid hex color code"),
	currency: z.string().min(3, "Please select a currency"),
	paymentMethods: z
		.array(z.enum(["stripe", "cod"]))
		.min(1, "Please select at least one payment method"),
	codEnabled: z.boolean(),
	shippingEnabled: z.boolean(),
	freeShippingThreshold: z.number().min(0, "Free shipping threshold must be positive").optional(),
	termsOfService: z.string().min(10, "Terms of service must be at least 10 characters"),
	privacyPolicy: z.string().min(10, "Privacy policy must be at least 10 characters"),
	refundPolicy: z.string().min(10, "Refund policy must be at least 10 characters"),
});

export type StoreFormData = z.infer<typeof storeSchema>;
