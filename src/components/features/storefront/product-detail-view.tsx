/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  Package,
  ShieldCheck,
  Truck,
  Heart,
  Share2,
  ArrowLeft,
  Check,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner'; // Ensure sonner is installed

import RecommendedProducts from './storefront-reusables/products/recommended-products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StoreFrontContainer from './storefront-reusables/container';
import { StoreFrontHeader } from './storefront-reusables/navbar';
import StoreFrontFooter from './storefront-reusables/footer';
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { StoreData } from '@/lib/domains/stores/types';
import type { ProductData } from '@/lib/domains/products/types';
import { formatPrice } from '@/lib/utils/price'; // Ensure this utility accepts options
import { cn } from '@/lib/utils';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { useCategories } from '@/hooks/use-categories';

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

  // --- Button State for UX ---
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  // --- Enhanced Add to Cart Handler ---
  const handleAddToCart = () => {
    if (isAdding || isSuccess) return; // Prevent double clicks

    setIsAdding(true);

    // Simulate a small network delay for better UX feeling
    setTimeout(() => {
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

      // UX Feedback
      setIsAdding(false);
      setIsSuccess(true);
      toast.success("Added to cart", {
        description: `${product.name} is now in your bag.`
      });

      // Reset button after 2 seconds
      setTimeout(() => setIsSuccess(false), 2000);
    }, 600);
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

  // Helper to format price with Store Currency
  const displayPrice = (amount: number) => {
    return formatPrice(amount, store.currency);
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreFrontHeader storeData={store} cartItemCount={cart.totalQuantity} />

      <main className="pt-24 pb-16">
        <StoreFrontContainer className="py-8">

          <div className="mb-8">
            <Link
              href={`/stores/${store.slug}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Store
            </Link>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] xl:gap-20">

            {/* --- Left Column: Image Gallery --- */}
            <section className="relative">
              <div className="sticky top-32 space-y-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted border border-border/40 shadow-sm">
                  {selectedImageId ? (
                    <img
                      key={selectedImageId}
                      src={images.find((image) => image.id === selectedImageId)?.url ?? primaryImage?.url ?? ''}
                      alt={images.find((image) => image.id === selectedImageId)?.alt ?? product.name}
                      className="h-full w-full object-cover transition-opacity duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Package className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}

                  {!isInStock && (
                    <Badge className="absolute top-4 left-4 bg-muted text-muted-foreground hover:bg-muted">
                      Out of Stock
                    </Badge>
                  )}
                  {isInStock && compareAtSource && compareAtSource > priceSource && (
                    <Badge className="absolute top-4 left-4 bg-red-500 text-white hover:bg-red-600 border-0">
                      Sale
                    </Badge>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {images.map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setSelectedImageId(image.id)}
                        className={cn(
                          'relative aspect-square overflow-hidden rounded-lg bg-muted border-2 transition-all',
                          selectedImageId === image.id
                            ? 'border-primary opacity-100 ring-2 ring-primary/20'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        )}
                      >
                        <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* --- Right Column: Product Details --- */}
            <section className="flex flex-col gap-8 lg:py-2">

              {/* Header Info */}
              <div className="space-y-4 border-b border-border/40 pb-6">
                {Array.isArray(product.categories) && product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((identifier) => (
                      <Badge
                        key={identifier.id}
                        variant="secondary"
                        className="font-normal text-xs uppercase tracking-wide px-2 py-0.5"
                      >
                        {identifier.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <h1 className="text-4xl font-bold tracking-tight text-foreground text-balance">
                  {product.name}
                </h1>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    {/* Using Store Currency */}
                    <span className="text-3xl font-bold tracking-tight text-foreground">
                      {displayPrice(priceSource)}
                    </span>
                    {compareAtSource && (
                      <span className="text-lg text-muted-foreground line-through decoration-red-500/50">
                        {displayPrice(compareAtSource)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <Heart className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add to Wishlist</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <Share2 className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share Product</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {product.shortDescription && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}
              </div>

              {/* Action Area */}
              <div className="space-y-6">

                {variants.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Select {variants[0].name.toLowerCase().includes('size') ? 'Size' : 'Option'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all min-w-[3rem]",
                            variant.id === selectedVariantId
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-foreground/50 bg-background"
                          )}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- Enhanced CTA Button --- */}
                <div className="space-y-4 pt-4">
                  <Button
                    size="lg"
                    className={cn(
                      "w-full h-14 text-lg font-semibold rounded-full shadow-xl transition-all duration-300",
                      isSuccess
                        ? "bg-green-600 hover:bg-green-700 shadow-green-500/20"
                        : "shadow-primary/20 hover:-translate-y-0.5 active:scale-[0.99]"
                    )}
                    onClick={handleAddToCart}
                    disabled={!isInStock || isAdding}
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Adding...
                      </>
                    ) : isSuccess ? (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Added to Bag
                      </>
                    ) : isInStock ? (
                      <>
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Add to Bag
                        <span className="mx-2 opacity-50">•</span>
                        {displayPrice(priceSource)}
                      </>
                    ) : (
                      'Out of Stock'
                    )}
                  </Button>

                  {isInStock && (
                    <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> Secure checkout • Free shipping over $50
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className="p-2 rounded-full bg-background border shadow-sm">
                      <Truck className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold">Fast Delivery</p>
                      <p className="text-muted-foreground">2-4 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className="p-2 rounded-full bg-background border shadow-sm">
                      <ShieldCheck className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold">Secure Checkout</p>
                      <p className="text-muted-foreground">SSL Encrypted</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Sections (Unchanged but ensuring currency is used if present) */}
              <div className="border-t border-border/40 pt-4">
                <details className="group border-b border-border/40" open>
                  <summary className="flex cursor-pointer items-center justify-between py-4 text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors select-none">
                    Product Description
                    <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="pb-6 text-muted-foreground text-sm leading-relaxed space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <p className="whitespace-pre-line">{product.description}</p>

                    {(dimensionParts.length > 0 || formatDimension(product.weight)) && (
                      <div className="bg-muted/30 p-4 rounded-lg space-y-2 mt-4">
                        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide mb-2">Specifications</h4>
                        {dimensionParts.length > 0 && (
                          <div className="flex justify-between text-xs">
                            <span>Dimensions</span>
                            <span className="font-mono">{dimensions}</span>
                          </div>
                        )}
                        {formatDimension(product.weight) && (
                          <div className="flex justify-between text-xs">
                            <span>Weight</span>
                            <span className="font-mono">{weight}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </details>

                <details className="group border-b border-border/40">
                  <summary className="flex cursor-pointer items-center justify-between py-4 text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors select-none">
                    Shipping & Returns
                    <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="pb-6 text-muted-foreground text-sm space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <p>Free standard shipping on orders over {displayPrice(50)}.</p>
                    <p>Standard delivery: 3-5 business days.</p>
                    <p>Express delivery available at checkout.</p>
                    <p className="pt-2">Free returns within 30 days of purchase in original condition and packaging.</p>
                  </div>
                </details>
              </div>
            </section>
          </div>

          <Separator className="my-16" />

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">You might also like</h2>
              <Link href={`/stores/${store.slug}/products`} className="text-sm font-medium hover:underline">
                View all
              </Link>
            </div>
            <RecommendedProducts storeSlug={store.slug} current={product} />
          </div>

        </StoreFrontContainer>
      </main>

      <StoreFrontFooter store={store} />
    </div>
  );
}
