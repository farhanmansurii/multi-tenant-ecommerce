
export type StoreBusinessType = 'individual' | 'business' | 'nonprofit';

export interface StoreShippingRate {
  name: string;
  price: number;
  estimatedDays: string;
}

export interface StoreSettings {
  paymentMethods?: string[];
  shippingRates?: StoreShippingRate[];
  upiId?: string;
  codEnabled?: boolean;
  stripeAccountId?: string;
  paypalEmail?: string;
  shippingEnabled?: boolean;
  freeShippingThreshold?: number | null;
  termsOfService?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
}

export interface StoreData {
  address: string;
  upiId: string;
  codEnabled: boolean;
  productCount: number;
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description: string;
  contactEmail: string;
  contactPhone?: string | null;
  website?: string | null;
  businessType: StoreBusinessType;
  businessName: string;
  taxId?: string | null;
  addressLine1: string;
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
  shippingRates?: StoreShippingRate[] | null;
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  status: 'draft' | 'active' | 'suspended';
  featured: boolean;
  logo?: string | null;
  favicon?: string | null;
  stripeAccountId?: string | null;
  paypalEmail?: string | null;
  settings?: StoreSettings | null;
  createdAt: string;
  updatedAt: string;
  currentUserRole?: 'owner' | 'admin' | 'member' | 'customer' | null;
}

export interface StoreFormPayload {
  storeName: string;
  storeSlug: string;
  tagline?: string;
  description: string;
  email: string;
  phone?: string;
  website?: string;
  businessType: StoreBusinessType;
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
  upiId?: string;
  codEnabled: boolean;
  stripeAccountId?: string;
  paypalEmail?: string;
  shippingEnabled: boolean;
  freeShippingThreshold?: number;
  shippingRates?: StoreShippingRate[];
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  status: 'draft' | 'active' | 'suspended';
  featured: boolean;
}
