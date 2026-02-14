import type { Metadata } from 'next';
import { generateStoreMetadata } from '@/lib/metadata';
import { fetchStore } from '@/lib/domains/stores/service';
import { fetchProducts } from '@/lib/domains/products/service';
import StorefrontProducts from '@/components/storefront-ui/pages/StorefrontProducts';

interface ProductsPageProps {
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
      title: `Products - ${store.name}`,
      description: `Browse all products from ${store.name}`,
      keywords: [store.name, 'products', 'catalog', 'shopping'],
    });
  } catch {
    return generateStoreMetadata({
      storeName: slug,
      title: `Products - ${slug}`,
      description: `Browse products from ${slug}`,
      keywords: [slug, 'products'],
    });
  }
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { slug } = await params;

  const [store, products] = await Promise.all([
    fetchStore(slug).catch(() => null),
    fetchProducts(slug).catch(() => []),
  ]);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <StorefrontProducts
      products={products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price || 0),
        tags: p.tags || [],
        images: p.images,
      }))}
    />
  );
}
