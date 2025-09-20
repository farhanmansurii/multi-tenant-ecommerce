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
	tagline: z.string().max(100, "Tagline must be less than 100 characters").optional(),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().optional(),
	website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
	businessType: z.enum(["individual", "business", "nonprofit"]),
	businessName: z
		.string()
		.min(2, "Business name must be at least 2 characters")
		.max(100, "Business name must be less than 100 characters"),
	taxId: z.string().optional(),
	address: z.string().min(5, "Address must be at least 5 characters"),
	city: z.string().min(2, "City must be at least 2 characters"),
	state: z.string().min(2, "State must be at least 2 characters"),
	zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
	country: z.string().min(2, "Country must be at least 2 characters"),
	logo: z.string().optional(),
	favicon: z.string().optional(),
	primaryColor: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Please enter a valid hex color code"),
	secondaryColor: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Please enter a valid hex color code")
		.optional(),
	currency: z.string().min(3, "Please select a currency"),
	timezone: z.string().min(1, "Please select a timezone"),
	language: z.string().min(2, "Please select a language"),
	paymentMethods: z.array(z.string()).min(1, "Please select at least one payment method"),
	stripeAccountId: z.string().optional(),
	paypalEmail: z.string().email("Please enter a valid PayPal email").optional(),
	shippingEnabled: z.boolean(),
	freeShippingThreshold: z.number().min(0, "Free shipping threshold must be positive").optional(),
	shippingRates: z
		.array(
			z.object({
				name: z.string(),
				price: z.number().min(0),
				estimatedDays: z.string(),
			}),
		)
		.optional(),
	termsOfService: z.string().min(10, "Terms of service must be at least 10 characters"),
	privacyPolicy: z.string().min(10, "Privacy policy must be at least 10 characters"),
	refundPolicy: z.string().min(10, "Refund policy must be at least 10 characters"),
	status: z.enum(["draft", "active", "suspended"]),
	featured: z.boolean(),
});

export type StoreFormData = z.infer<typeof storeSchema>;

