/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronsDown, Package, ShieldCheck, Truck } from 'lucide-react';

import RecommendedProducts from './storefront-reusables/products/recommended-products';
import { Button } from '@/components/ui/button';
import StoreFrontContainer from './storefront-reusables/container';
import { StoreFrontHeader } from './storefront-reusables/navbar';
import StoreFrontFooter from './storefront-reusables/footer';
import type { StoreData } from '@/lib/domains/stores/types';
import type { ProductData } from '@/lib/domains/products/types';
import { formatPrice } from '@/lib/utils/price';
import { cn } from '@/lib/utils';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { useCategories } from '@/hooks/use-categories';
import Link from 'next/link';


interface StorefrontProductViewProps {
  store: StoreData;
  product: ProductData;
}

const formatDimension = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  const parsed = Number.parseFloat(String(value));
  if (!Number.isFinite(parsed)) return null;
  return `${parsed}`;
};

export default function StorefrontProductView({ store, product }: StorefrontProductViewProps) {
  const {
    addItem,
    cart,
    setStoreSlug,
    setSelectedCategoryId,
  } = useStorefrontStore((state) => ({
    addItem: state.addItem,
    cart: state.cart,
    setStoreSlug: state.setStoreSlug,
    setSelectedCategoryId: state.setSelectedCategoryId,
  }));

  useEffect(() => {
    setStoreSlug(store.slug);
    setSelectedCategoryId(null);
  }, [setStoreSlug, setSelectedCategoryId, store.slug]);

  const images = useMemo(() => (Array.isArray(product.images) ? product.images : []), [product.images]);
  const primaryImage = images.find((image) => image.isPrimary) ?? images[0] ?? null;
  const [selectedImageId, setSelectedImageId] = useState(primaryImage?.id ?? null);

  useEffect(() => {
    setSelectedImageId(primaryImage?.id ?? null);
  }, [primaryImage?.id]);

  const variants = useMemo(() => (Array.isArray(product.variants) ? product.variants : []), [product.variants]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variants[0]?.id ?? null);

  useEffect(() => {
    setSelectedVariantId(variants[0]?.id ?? null);
  }, [variants]);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [variants, selectedVariantId]
  );

  const quantityNumber = Number.parseFloat(String(product.quantity ?? '0'));
  const isInStock = product.status === 'active' && (quantityNumber > 0 || product.allowBackorder);
  const priceSource = selectedVariant?.price ?? Number.parseFloat(String(product.price ?? '0'));
  const compareAtSource = selectedVariant?.compareAtPrice ?? (product.compareAtPrice ? Number(product.compareAtPrice) : undefined);

  const handleAddToCart = () => {
    const price = typeof priceSource === 'number' ? priceSource : Number(priceSource ?? 0);
    const normalizedPrice = Number.isFinite(price) ? price : 0;
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      productId: product.id,
      name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
      price: normalizedPrice,
      quantity: 1,
      image: primaryImage?.url ?? null,
      variantId: selectedVariant?.id ?? null,
      metadata: selectedVariant?.attributes ? { attributes: selectedVariant.attributes } : undefined,
    });
  };

  const dimensionParts = [product.length, product.width, product.height]
    .map((dimension) => formatDimension(dimension))
    .filter((value): value is string => Boolean(value));
  const dimensions = dimensionParts.length > 0 ? `${dimensionParts.join(' × ')} cm` : '—';
  const weight = formatDimension(product.weight) ? `${formatDimension(product.weight)} kg` : '—';

  const { data: categories = [] } = useCategories(store.slug);
  const categoryLookup = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = category.name;
      if (category.slug) acc[category.slug] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const formatCategoryLabel = (identifier: string) => {
    const fromLookup = categoryLookup[identifier];
    if (fromLookup) return fromLookup;
    const cleaned = identifier.replace(/[-_]+/g, ' ').trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreFrontHeader storeData={store} cartItemCount={cart.totalQuantity} />

      <main className="pt-24 pb-16">
        <StoreFrontContainer className="py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
            {/* Image Gallery */}
            <section>
              <div className="sticky top-24">
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  {selectedImageId ? (
                    <img
                      key={selectedImageId}
                      src={images.find((image) => image.id === selectedImageId)?.url ?? primaryImage?.url ?? ''}
                      alt={images.find((image) => image.id === selectedImageId)?.alt ?? product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={primaryImage?.url ?? 'https://picsum.photos/1200/800'}
                      alt={primaryImage?.alt ?? product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                {images.length > 1 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {images.map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setSelectedImageId(image.id)}
                        className={cn(
                          'aspect-square overflow-hidden bg-muted transition-opacity duration-200',
                          selectedImageId === image.id ? 'opacity-100 ring-1 ring-foreground' : 'opacity-60 hover:opacity-100'
                        )}
                      >
                        <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Product Info */}
            <section className="space-y-6 lg:py-2">
              {/* Title and Price */}
              <div className="space-y-2">
                <h1 className="text-2xl font-light tracking-tight uppercase">{product.name}</h1>
                <div className="flex items-baseline gap-3">
                  <span className="text-xl font-normal">{formatPrice(priceSource)}</span>
                  {compareAtSource && (
                    <span className="text-base text-muted-foreground line-through">
                      {formatPrice(compareAtSource)}
                    </span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed">{product.shortDescription}</p>
              )}

              {/* Availability */}
              <div className="text-sm">
                {isInStock ? (
                  <span className="text-green-600 dark:text-green-500">In stock</span>
                ) : (
                  <span className="text-muted-foreground">Out of stock</span>
                )}
              </div>

              {/* Variants */}
              {variants.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Select {variants[0].name.toLowerCase().includes('size') ? 'Size' : 'Option'}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <Button
                        key={variant.id}
                        type="button"
                        variant={variant.id === selectedVariantId ? 'default' : 'outline'}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className="h-auto min-w-[60px] px-4 py-2 text-sm font-normal"
                        size="sm"
                      >
                        {variant.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <Button
                size="lg"
                className="w-full h-12 text-base font-normal uppercase tracking-wide"
                onClick={handleAddToCart}
                disabled={!isInStock}
              >
                {isInStock ? 'Add to bag' : 'Out of stock'}
              </Button>

              {/* Shipping Info */}
              <div className="space-y-2 border-t pt-6 text-sm">
                <div className="flex items-start gap-3">
                  <Truck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    {product.requiresShipping
                      ? 'Free shipping on orders over $50. Delivery in 3-5 business days.'
                      : 'Digital delivery via email after purchase.'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Free returns within 30 days.</span>
                </div>
              </div>

              {/* Product Details Accordion */}
              <div className="border-t pt-6 space-y-4">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-medium uppercase tracking-wider">
                    Product Details
                    <span className="transition group-open:rotate-180"><ChevronDown/></span>
                  </summary>
                  <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                    <p className="leading-relaxed whitespace-pre-line">{product.description}</p>
                    {(dimensionParts.length > 0 || formatDimension(product.weight)) && (
                      <div className="space-y-1 pt-2">
                        {dimensionParts.length > 0 && (
                          <div className="flex gap-2">
                            <span className="font-medium text-foreground">Dimensions:</span>
                            <span>{dimensions}</span>
                          </div>
                        )}
                        {formatDimension(product.weight) && (
                          <div className="flex gap-2">
                            <span className="font-medium text-foreground">Weight:</span>
                            <span>{weight}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </details>

                {product.requiresShipping && (
                  <details className="group border-t pt-4">
                    <summary className="flex cursor-pointer items-center justify-between text-sm font-medium uppercase tracking-wider">
                      Shipping & Returns
                      <span className="transition group-open:rotate-180"><ChevronDown/></span>
                    </summary>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <p>Free standard shipping on orders over $50.</p>
                      <p>Standard delivery: 3-5 business days.</p>
                      <p>Express delivery available at checkout.</p>
                      <p className="pt-2">Free returns within 30 days of purchase in original condition and packaging.</p>
                    </div>
                  </details>
                )}
              </div>

              {/* Categories */}
              {Array.isArray(product.categories) && product.categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t pt-6 text-xs">
                  <span className="text-muted-foreground">Shop:</span>
                  {product.categories.map((identifier) => {
                    const label = categoryLookup[identifier] ?? formatCategoryLabel(identifier);
                    return (
                      <Link
                        key={identifier}
                        href={`/stores/${store.slug}?category=${encodeURIComponent(identifier)}`}
                        className="underline hover:no-underline"
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <section className="prose max-w-none dark:prose-invert">
              <h2 className="text-2xl font-semibold">Product description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>

              <div className="mt-12">
                <RecommendedProducts storeSlug={store.slug} current={product} />
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-2xl border bg-card p-6">
                <h3 className="text-lg font-semibold">Shipping & returns</h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-4 w-4 text-primary" />
                    <span>
                      {product.requiresShipping
                        ? 'Ships within 3-5 business days from our roastery.'
                        : 'Digital delivery via email immediately after purchase.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Package className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Free returns within 30 days in original packaging.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Secure payments and buyer protection on every order.</span>
                  </li>
                </ul>
              </div>

              {product.downloadUrl && (
                <div className="rounded-2xl border bg-card p-6">
                  <h3 className="text-lg font-semibold">Digital delivery</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This is a digital product. Download link will be available after purchase
                    {product.downloadExpiry ? ` and expires in ${product.downloadExpiry} days.` : '.'}
                  </p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link href={product.downloadUrl}>Preview download</Link>
                  </Button>
                </div>
              )}

              {product.metaDescription && (
                <div className="rounded-2xl border bg-card p-6">
                  <h3 className="text-lg font-semibold">SEO metadata</h3>
                  <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {product.metaTitle && (
                      <div>
                        <dt className="font-medium text-foreground">Meta title</dt>
                        <dd>{product.metaTitle}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-medium text-foreground">Meta description</dt>
                      <dd>{product.metaDescription}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </section>
          </div>
        </StoreFrontContainer>
      </main>

      <StoreFrontFooter store={store} />
    </div>
  );
}
