import type { Metadata } from 'next';
import { generateStoreMetadata } from '@/lib/metadata';
import { fetchStore } from '@/lib/domains/stores/service';
import { fetchProducts } from '@/lib/domains/products/service';
import { fetchCategories } from '@/lib/domains/products/category-service';
import { StoreEditorial } from '@/components/features/storefront/shared/modules/editorial-about';
import { StoreServiceStrip } from '@/components/features/storefront/shared/layout/store-service-strip';
import StorefrontView from '@/components/features/storefront/views/home/storefront-view';
import { StoreFooter } from '@/components/features/storefront/shared/layout/footer';
import { StoreFrontHeader } from '@/components/features/storefront/shared/layout/navbar';
import { StoreHero } from '@/components/features/storefront/storefront-reusables/hero';


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

  const [store, products, categories] = await Promise.all([
    fetchStore(slug).catch(() => null),
    fetchProducts(slug).catch(() => []),
    fetchCategories(slug).catch(() => []),
  ]);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <>
      <StoreFrontHeader storeData={store} />
      <div className='pt-24'>
        <StoreHero store={store} />
      </div>
      <StoreEditorial store={store} />
      <StoreServiceStrip store={store} />
      <StorefrontView slug={slug} initialStore={store} initialProducts={products} initialCategories={categories} />
      <StoreFooter store={store} />
    </>
  );
}
