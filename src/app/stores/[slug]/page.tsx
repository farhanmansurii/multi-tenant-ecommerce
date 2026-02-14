import type { Metadata } from 'next';
import { generateStoreMetadata } from '@/lib/metadata';
import { fetchStore } from '@/lib/domains/stores/service';
import { fetchProducts } from '@/lib/domains/products/service';
import StorefrontHome from '@/components/storefront-ui/pages/StorefrontHome';
import { toStorefrontThemeConfig } from '@/components/storefront-ui/storefront/theme-config';


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

  const [store, products] = await Promise.all([
    fetchStore(slug).catch(() => null),
    fetchProducts(slug).catch(() => []),
  ]);

  if (!store) {
    return <div>Store not found</div>;
  }

  const theme = toStorefrontThemeConfig(store);
  const zoomProduct =
    theme.content.zoomSection.imageSource === 'product' && theme.content.zoomSection.productSlug
      ? products.find((p) => p.slug === theme.content.zoomSection.productSlug) || null
      : null;

  const zoomImageUrl =
    theme.content.zoomSection.imageSource === 'product'
      ? zoomProduct?.images?.[0]?.url || theme.content.zoomSection.imageUrl
      : theme.content.zoomSection.imageUrl;

  return (
    <StorefrontHome
      slug={slug}
      zoomImageUrl={zoomImageUrl}
      featuredProducts={products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price || 0),
        images: p.images,
      }))}
    />
  );
}
