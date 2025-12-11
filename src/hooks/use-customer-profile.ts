import { useQuery } from '@tanstack/react-query';
import { StorefrontCustomerProfile } from '@/lib/state/storefront/types';

export function useCustomerProfile(storeSlug: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['customer-profile', storeSlug],
    queryFn: async () => {
      const res = await fetch(`/api/stores/${storeSlug}/customers/me`);
      if (!res.ok) {
        throw new Error('Failed to fetch customer profile');
      }
      const data = await res.json();
      return data.customer as StorefrontCustomerProfile;
    },
    enabled: enabled && !!storeSlug,
    staleTime: 1000 * 60 * 5,
  });
}
