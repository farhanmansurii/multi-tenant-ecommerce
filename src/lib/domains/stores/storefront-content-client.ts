'use client';

import { withBaseUrl } from '@/lib/utils/url';
import type { StoreData } from '@/lib/domains/stores/types';
import { parseApiResponse } from '@/lib/query/api-response';

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

  const data = await parseApiResponse<{ store: StoreData }>(
    response,
    'Failed to update storefront content',
  );
  return data.store;
}
