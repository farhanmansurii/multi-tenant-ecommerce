
export interface StoreData {
  productCount: number;
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description: string;
  contactEmail: string;
  contactPhone?: string | null;
  website?: string | null;
  businessType: 'individual' | 'business' | 'nonprofit';
  businessName: string;
  taxId?: string | null;
  addressLine1?: string | null;
  address?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  primaryColor: string;
  secondaryColor?: string | null;
  currency: string;
  timezone: string;
  language: string;
  paymentMethods: string[];
  shippingEnabled: boolean;
  freeShippingThreshold?: string | number | null;
  shippingRates?: Array<{ name: string; price: number; estimatedDays: string }> | null;
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  status: 'draft' | 'active' | 'suspended';
  featured: boolean;
  logo?: string | null;
  favicon?: string | null;
  stripeAccountId?: string | null;
  paypalEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreFormPayload {
  storeName: string;
  storeSlug: string;
  tagline?: string;
  description: string;
  email: string;
  phone?: string;
  website?: string;
  businessType: 'individual' | 'business' | 'nonprofit';
  businessName: string;
  taxId?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor?: string;
  currency: string;
  timezone: string;
  language: string;
  paymentMethods: string[];
  stripeAccountId?: string;
  paypalEmail?: string;
  shippingEnabled: boolean;
  freeShippingThreshold?: number;
  shippingRates?: Array<{ name: string; price: number; estimatedDays: string }>;
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  status: 'draft' | 'active' | 'suspended';
  featured: boolean;
}

