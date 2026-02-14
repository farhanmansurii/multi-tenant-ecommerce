import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { generateBaseMetadata, generateProductMetadata } from '@/lib/metadata';
import { StoreData } from '@/lib/domains/stores';
import { ProductData } from '@/lib/domains/products';
import { fetchStoreAndProduct } from '@/lib/domains/products/service';
import { fetchProducts } from '@/lib/domains/products/service';
import StorefrontProductDetail from '@/components/storefront-ui/pages/StorefrontProductDetail';

interface RouteParams {
  slug: string;
  productSlug: string;
}

const buildNotFoundMetadata = (slug: string, productSlug: string): Metadata =>
  generateBaseMetadata({
    title: 'Product unavailable',
    description: 'The product you are looking for is not available.',
    url: `/stores/${slug}/products/${productSlug}`,
    type: 'product',
    keywords: ['product not found', 'unavailable'],
  });

const toIsoString = (value: string | Date | null | undefined): string | undefined => {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
};

const toProductMetadata = (store: StoreData, product: ProductData): Metadata =>
  generateProductMetadata({
    storeName: store.name,
    storeSlug: store.slug,
    productName: product.metaTitle ?? product.name,
    productDescription:
      product.metaDescription ?? product.shortDescription ?? product.description,
    productPrice: product.price,
    productImages: product.images.map((image) => image.url).filter(Boolean),
    publishedTime: toIsoString(product.publishedAt),
    modifiedTime: toIsoString(product.updatedAt),
    tags: product.tags,
    url: `${store.slug}/products/${product.slug}`,
  });

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const result = await fetchStoreAndProduct(slug, productSlug);

  if (!result) {
    return buildNotFoundMetadata(slug, productSlug);
  }

  return toProductMetadata(result.store, result.product);
}

export default async function StorefrontProductPage({ params }: { params: Promise<RouteParams> }) {
  const { slug, productSlug } = await params;
  const [result, products] = await Promise.all([
    fetchStoreAndProduct(slug, productSlug),
    fetchProducts(slug).catch(() => []),
  ]);

  if (!result) notFound();

  const related = products.filter((p) => p.id !== result.product.id).slice(0, 4);

  return (
    <StorefrontProductDetail
      slug={slug}
      product={{
        id: result.product.id,
        slug: result.product.slug,
        name: result.product.name,
        price: Number(result.product.price || 0),
        images: result.product.images,
        shortDescription: result.product.shortDescription ?? null,
        description: result.product.description ?? null,
      }}
      relatedProducts={related.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price || 0),
        images: p.images,
      }))}
    />
  );
}
