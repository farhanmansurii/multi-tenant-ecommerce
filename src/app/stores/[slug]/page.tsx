import type { Metadata } from 'next';
import StorefrontView from '@/components/features/storefront/storefront-view';
import { generateStoreMetadata } from '@/lib/metadata';
import { fetchStore } from '@/lib/domains/stores/service';


interface StorefrontPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const store = await fetchStore(slug);

    return generateStoreMetadata({
      storeName: store.name,
      storeDescription: store.description,
      storeLogo: store.logo || undefined,
      title: `${store.name} - Online Store`,
      description:
        store.description || `Shop at ${store.name} - Discover amazing products and deals`,
      keywords: [store.name, 'online store', 'shopping', 'ecommerce', 'products', 'deals'],
    });
  } catch {
    // Fallback metadata if store fetch fails
    return generateStoreMetadata({
      storeName: slug,
      title: `${slug} Store`,
      description: `Shop at ${slug} - Online store with great products`,
      keywords: [slug, 'online store', 'shopping', 'ecommerce'],
    });
  }
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { slug } = await params;
  return <StorefrontView slug={slug} />;
}
