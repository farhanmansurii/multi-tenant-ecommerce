import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import StorefrontLogin from '@/components/features/storefront/storefront-auth/storefront-login';
import { fetchStore } from '@/lib/services/store-api';
import { generateStoreMetadata } from '@/lib/metadata';

interface LoginPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const store = await fetchStore(slug);
    return generateStoreMetadata({
      storeName: store.name,
      storeDescription: store.description,
      storeLogo: store.logo || undefined,
      title: `${store.name} — Customer sign in`,
      description: `Access your ${store.name} customer account using Google sign-in.`,
      url: `/stores/${slug}/login`,
    });
  } catch {
    return generateStoreMetadata({
      storeName: slug,
      title: `Sign in to ${slug}`,
      description: `Sign in to continue shopping at ${slug}.`,
      url: `/stores/${slug}/login`,
    });
  }
}

export default async function StorefrontLoginPage({ params }: LoginPageProps) {
  const { slug } = await params;
  try {
    const store = await fetchStore(slug);
    return <StorefrontLogin store={store} />;
  } catch {
    notFound();
  }
}
