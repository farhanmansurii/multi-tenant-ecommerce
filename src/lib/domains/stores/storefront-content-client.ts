'use client';

import { withBaseUrl } from '@/lib/utils/url';
import type { StoreData } from '@/lib/domains/stores/types';

export async function updateStorefrontContent(
  storeSlug: string,
  input: {
    storefrontContentMode: 'defaults' | 'store' | 'custom';
    storefrontContent: Record<string, unknown>;
  }
): Promise<StoreData> {
  const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || err?.message || 'Failed to update storefront content');
  }

  const data = await response.json();
  return data.store as StoreData;
}

