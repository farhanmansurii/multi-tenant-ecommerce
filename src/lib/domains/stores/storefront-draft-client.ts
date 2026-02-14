'use client';

import { withBaseUrl } from '@/lib/utils/url';
import type { StoreData } from '@/lib/domains/stores/types';

type ApiErrorShape = { error?: string; message?: string };

async function readApiError(res: Response): Promise<string | null> {
  const data = (await res.json().catch(() => null)) as unknown;
  if (!data || typeof data !== 'object') return null;
  const err = data as ApiErrorShape;
  return err.error || err.message || null;
}

export async function updateStorefrontDraft(
  storeSlug: string,
  input: {
    storefrontDraftMode: 'defaults' | 'store' | 'custom';
    storefrontDraftContent: Record<string, unknown>;
  }
): Promise<StoreData> {
  const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storefrontDraftMode: input.storefrontDraftMode,
      storefrontDraftContent: input.storefrontDraftContent,
      storefrontDraftUpdatedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const msg = await readApiError(response);
    throw new Error(msg || 'Failed to update storefront draft');
  }

  const data = (await response.json()) as unknown;
  if (!data || typeof data !== 'object' || !('store' in data)) {
    throw new Error('Invalid response from server');
  }
  return (data as { store: StoreData }).store;
}

export async function publishStorefrontDraft(
  storeSlug: string,
  input: {
    storefrontDraftMode: 'defaults' | 'store' | 'custom';
    storefrontDraftContent: Record<string, unknown>;
  }
): Promise<StoreData> {
  const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storefrontContentMode: input.storefrontDraftMode,
      storefrontContent: input.storefrontDraftContent,
    }),
  });

  if (!response.ok) {
    const msg = await readApiError(response);
    throw new Error(msg || 'Failed to publish storefront draft');
  }

  const data = (await response.json()) as unknown;
  if (!data || typeof data !== 'object' || !('store' in data)) {
    throw new Error('Invalid response from server');
  }
  return (data as { store: StoreData }).store;
}
