import { StoreData, StoreFormPayload, StoreSettings } from "./types";
import { StoreFormData } from "./validation";

const baseDefaults: StoreFormData = {
	storeName: "",
	storeSlug: "",
	tagline: "",
	description: "",
	email: "",
	phone: "",
	website: "",
	businessType: "individual",
	businessName: "",
	taxId: "",
	address: "",
	city: "",
	state: "",
	zipCode: "",
	country: "",
	logo: "",
	favicon: "",
	heroImages: [],
	primaryColor: "#3B82F6",
	secondaryColor: "#10B981",
	currency: "INR",
	timezone: "Asia/Kolkata",
	language: "en",
	paymentMethods: ["cod"],
	upiId: "",
	codEnabled: true,
	stripeAccountId: "",
	paypalEmail: "",
	shippingEnabled: true,
	freeShippingThreshold: undefined,
	shippingRates: [],
	termsOfService: "",
	privacyPolicy: "",
	refundPolicy: "",
};

export function buildStoreFormState(
	overrides?: Partial<StoreFormData>
): StoreFormData {
	return {
		...baseDefaults,
		...overrides,
		paymentMethods: overrides?.paymentMethods?.length
			? overrides.paymentMethods
			: baseDefaults.paymentMethods,
		shippingRates: overrides?.shippingRates ?? baseDefaults.shippingRates,
		heroImages: overrides?.heroImages ?? baseDefaults.heroImages,
	};
}

export function storeDataToFormValues(store?: StoreData | null): StoreFormData {
	if (!store) return buildStoreFormState();
	const settings: StoreSettings = store.settings || {};
	return buildStoreFormState({
		storeName: store.name ?? "",
		storeSlug: store.slug ?? "",
		tagline: store.tagline ?? "",
		description: store.description ?? "",
		email: store.contactEmail ?? "",
		phone: store.contactPhone ?? "",
		website: store.website ?? "",
		businessType: store.businessType ?? "individual",
		businessName: store.businessName ?? store.name ?? "",
		taxId: store.taxId ?? "",
		address: store.addressLine1 ?? "",
		city: store.city ?? "",
		state: store.state ?? "",
		zipCode: store.zipCode ?? "",
		country: store.country ?? "",
		logo: store.logo ?? "",
		favicon: store.favicon ?? "",
		primaryColor: store.primaryColor ?? baseDefaults.primaryColor,
		secondaryColor: store.secondaryColor ?? baseDefaults.secondaryColor,
		currency: store.currency ?? baseDefaults.currency,
		timezone: store.timezone ?? baseDefaults.timezone,
		language: store.language ?? baseDefaults.language,
		paymentMethods: settings.paymentMethods && settings.paymentMethods.length
			? settings.paymentMethods
			: store.paymentMethods ?? baseDefaults.paymentMethods,
		upiId: settings.upiId ?? store.upiId ?? "",
		codEnabled:
			typeof settings.codEnabled === "boolean"
				? settings.codEnabled
				: typeof store.codEnabled === "boolean"
					? store.codEnabled
					: baseDefaults.codEnabled,
		stripeAccountId: settings.stripeAccountId ?? store.stripeAccountId ?? "",
		paypalEmail: settings.paypalEmail ?? store.paypalEmail ?? "",
		shippingEnabled:
			typeof settings.shippingEnabled === "boolean"
				? settings.shippingEnabled
				: typeof store.shippingEnabled === "boolean"
					? store.shippingEnabled
					: baseDefaults.shippingEnabled,
		freeShippingThreshold:
			typeof settings.freeShippingThreshold === "number"
				? settings.freeShippingThreshold
				: typeof store.freeShippingThreshold === "number"
					? Number(store.freeShippingThreshold)
					: undefined,
		shippingRates: settings.shippingRates ?? store.shippingRates ?? baseDefaults.shippingRates,
		termsOfService: settings.termsOfService ?? store.termsOfService ?? "",
		privacyPolicy: settings.privacyPolicy ?? store.privacyPolicy ?? "",
		refundPolicy: settings.refundPolicy ?? store.refundPolicy ?? "",
	});
}

export function storeFormValuesToPayload(
	values: StoreFormData,
	base?: StoreData | null
): StoreFormPayload {
	return {
		storeName: values.storeName.trim(),
		storeSlug: values.storeSlug.trim(),
		tagline: values.tagline?.toString().trim() || undefined,
		description: values.description.trim(),
		email: values.email.trim(),
		phone: values.phone?.toString().trim(),
		website: values.website?.toString().trim(),
		businessType: values.businessType ?? base?.businessType ?? "individual",
		businessName: values.businessName?.trim() || values.storeName.trim(),
		taxId: values.taxId?.toString().trim() || base?.taxId || undefined,
		address: values.address?.trim() || "",
		city: values.city?.trim() || "",
		state: values.state?.trim() || "",
		zipCode: values.zipCode?.trim() || "",
		country: values.country || "",
		logo: values.logo || undefined,
		favicon: values.favicon || undefined,
		primaryColor: values.primaryColor,
		secondaryColor: values.secondaryColor || undefined,
		currency: values.currency,
		timezone: values.timezone,
		language: values.language,
		paymentMethods: values.paymentMethods,
		upiId: values.upiId || undefined,
		codEnabled: values.codEnabled,
		stripeAccountId: values.stripeAccountId || undefined,
		paypalEmail: values.paypalEmail || undefined,
		shippingEnabled: values.shippingEnabled,
		freeShippingThreshold: values.freeShippingThreshold,
		shippingRates: values.shippingRates ?? [],
		termsOfService: values.termsOfService,
		privacyPolicy: values.privacyPolicy,
		refundPolicy: values.refundPolicy,
		status: base?.status ?? "draft",
		featured: base?.featured ?? false,
	};
}

export type { StoreFormData };
