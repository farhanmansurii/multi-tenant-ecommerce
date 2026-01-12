import { StateCreator } from 'zustand';

export interface StoreSettings {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  language: string;
  primaryColor?: string;
  secondaryColor?: string;
  logo?: string;
  favicon?: string;
  tagline?: string;
  description: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  businessType: string;
  businessName: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  settings: {
    paymentMethods: string[];
    shippingRates: any[];
    upiId?: string;
    codEnabled: boolean;
    stripeAccountId?: string;
    paypalEmail?: string;
    shippingEnabled: boolean;
    freeShippingThreshold?: number;
    termsOfService: string;
    privacyPolicy: string;
    refundPolicy: string;
  };
}

export interface StoreSettingsSlice {
  storeSettings: StoreSettings | null;
  setStoreSettings: (settings: StoreSettings) => void;
  clearStoreSettings: () => void;
  getCurrency: () => string;
  getTimezone: () => string;
}

export const createStoreSettingsSlice: StateCreator<
  any,
  [],
  [],
  StoreSettingsSlice
> = (set, get) => ({
  storeSettings: null,

  setStoreSettings: (settings) => {
    set({ storeSettings: settings });
  },

  clearStoreSettings: () => {
    set({ storeSettings: null });
  },

  getCurrency: () => {
    return get().storeSettings?.currency || 'INR';
  },

  getTimezone: () => {
    return get().storeSettings?.timezone || 'Asia/Kolkata';
  },
});
