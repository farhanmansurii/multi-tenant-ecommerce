import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import StorefrontAccountView from '@/components/features/storefront/account/storefront-account-view';
import { fetchStore } from '@/lib/services/store-api';
import { generateStoreMetadata } from '@/lib/metadata';

interface AccountPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AccountPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const store = await fetchStore(slug);
    return generateStoreMetadata({
      storeName: store.name,
      storeDescription: store.description,
      storeLogo: store.logo || undefined,
      title: `${store.name} — Customer account`,
      description: `Manage wishlist, addresses, and orders for ${store.name}.`,
      url: `/stores/${slug}/account`,
    });
  } catch {
    return generateStoreMetadata({
      storeName: slug,
      title: `Customer account for ${slug}`,
      description: `Manage your storefront account details for ${slug}.`,
      url: `/stores/${slug}/account`,
    });
  }
}

export default async function StorefrontAccountPage({ params }: AccountPageProps) {
  const { slug } = await params;

  try {
    const store = await fetchStore(slug);
    return <StorefrontAccountView store={store} />;
  } catch {
    notFound();
  }
}
