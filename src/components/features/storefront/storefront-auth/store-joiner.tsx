'use client';

import { useEffect } from 'react';
import { useSessionContext } from '@/lib/session';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';

interface StoreJoinerProps {
  storeSlug: string;
}

export default function StoreJoiner({ storeSlug }: StoreJoinerProps) {
  const { user, isPending } = useSessionContext();
  const { setCustomerProfile, syncCustomerSession } = useStorefrontStore();

  useEffect(() => {
    if (isPending || !user) {
      return;
    }

    // Simply set up customer profile for the store
    setCustomerProfile({
      id: crypto.randomUUID(),
      storeSlug,
      role: 'storefront_customer',
      wishlist: [],
      savedAddresses: [],
      orders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Sync the session
    syncCustomerSession({
      storeSlug,
      user: {
        id: user.id,
        name: (user as { name?: string }).name || null,
        email: (user as { email?: string }).email || null,
        image: (user as { image?: string }).image || null,
      },
    });
  }, [user, isPending, storeSlug, setCustomerProfile, syncCustomerSession]);

  return null;
}
