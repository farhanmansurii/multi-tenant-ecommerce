/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Package, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <section>
              <div className="aspect-square overflow-hidden rounded-2xl border bg-muted">
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
                <div className="mt-4 flex gap-4 overflow-x-auto">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageId(image.id)}
                      className={cn(
                        'h-20 w-20 shrink-0 overflow-hidden rounded-xl border transition-all duration-200',
                        selectedImageId === image.id ? 'ring-2 ring-primary' : 'opacity-80 hover:opacity-100'
                      )}
                    >
                      <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={isInStock ? 'default' : 'secondary'} className="capitalize">
                    {isInStock ? 'In stock' : product.status.replace(/_/g, ' ')}
                  </Badge>
                  {product.featured && <Badge variant="outline">Featured</Badge>}
                  {product.requiresShipping && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Truck className="h-4 w-4" /> Ships worldwide
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
                {product.shortDescription && (
                  <p className="text-base text-muted-foreground">{product.shortDescription}</p>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">{formatPrice(priceSource)}</span>
                {compareAtSource && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(compareAtSource)}
                  </span>
                )}
              </div>

              {variants.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Variants
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <Button
                        key={variant.id}
                        type="button"
                        variant={variant.id === selectedVariantId ? 'default' : 'outline'}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className="rounded-full px-4 py-1"
                      >
                        {variant.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" className="sm:flex-1" onClick={handleAddToCart}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to cart
                </Button>
                <Button size="lg" variant="outline" className="sm:flex-1">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Secure checkout
                </Button>
              </div>

              <Separator />

              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">SKU</dt>
                  <dd className="font-medium">{product.sku ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Product type</dt>
                  <dd className="font-medium capitalize">{product.type}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Inventory</dt>
                  <dd className="font-medium">
                    {product.trackQuantity ? `${Math.max(quantityNumber, 0)} available` : 'Inventory not tracked'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Backorders</dt>
                  <dd className="font-medium">{product.allowBackorder ? 'Allowed' : 'Not allowed'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium">{product.requiresShipping ? 'Ships to customer' : 'No shipping required'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tax status</dt>
                  <dd className="font-medium">{product.taxable ? 'Taxable' : 'Tax exempt'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Weight</dt>
                  <dd className="font-medium">{weight}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Dimensions</dt>
                  <dd className="font-medium">{dimensions}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2 pt-4">
                {Array.isArray(product.categories) && product.categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Categories:</span>
                    {product.categories.map((identifier) => (
                      <Badge key={identifier} variant="outline" className="capitalize">
                        <Link href={`/stores/${store.slug}?category=${encodeURIComponent(identifier)}`}>
                          {formatCategoryLabel(identifier)}
                        </Link>
                      </Badge>
                    ))}
                  </div>
                )}
                {Array.isArray(product.tags) && product.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Tags:</span>
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="capitalize">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <section className="prose max-w-none dark:prose-invert">
              <h2 className="text-2xl font-semibold">Product description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
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
