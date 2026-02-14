import { StateCreator } from 'zustand';

export interface StoreSettings {
  id: string;
  name: string;
  slug: string;
  currency: string;
  primaryColor?: string;
  logo?: string;
  description: string;
  contactEmail: string;
  settings: {
    paymentMethods: Array<'stripe' | 'cod'>;
    codEnabled: boolean;
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
    return get().storeSettings?.currency || 'USD';
  },
});
