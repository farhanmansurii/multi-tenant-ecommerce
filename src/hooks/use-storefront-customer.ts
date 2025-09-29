'use client';

import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';

export const useStorefrontCustomer = () =>
  useStorefrontStore((state) => ({
    customerProfile: state.customerProfile,
    authRole: state.authRole,
    syncCustomerSession: state.syncCustomerSession,
    setCustomerProfile: state.setCustomerProfile,
    setAuthRole: state.setAuthRole,
    updateCustomerProfile: state.updateCustomerProfile,
    addWishlistItem: state.addWishlistItem,
    removeWishlistItem: state.removeWishlistItem,
    clearWishlist: state.clearWishlist,
    upsertAddress: state.upsertAddress,
    removeAddress: state.removeAddress,
    recordOrder: state.recordOrder,
    clearCustomerData: state.clearCustomerData,
  }));
