'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  Minus,
  Plus,
  ArrowUpRight,
  Globe,
  Shield,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import RecommendedProducts from '../../components/products/recommended-products';

import type { StoreData } from '@/lib/domains/stores/types';
import type { ProductData } from '@/lib/domains/products/types';
import { useFormatPrice } from '@/lib/utils/price';
import { cn } from '@/lib/utils';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { StoreFrontHeader } from '../../shared/layout/navbar';
import StoreFrontPageWrapper from '../../shared/layout/page-wrapper';
import { useAnalytics } from '@/hooks/use-analytics-tracking';

interface StorefrontProductViewProps {
  store: StoreData;
  product: ProductData;
}

export default function StorefrontProductView({ store, product }: StorefrontProductViewProps) {
  // --- Logic State (Kept strictly functional) ---
  const { addItem, cart, setStoreSlug } = useStorefrontStore((state) => ({
    addItem: state.addItem,
    cart: state.cart,
    setStoreSlug: state.setStoreSlug,
  }));

  const analytics = useAnalytics();

  useEffect(() => {
    setStoreSlug(store.slug);
  }, [setStoreSlug, store.slug]);



  // Derived Data
  const images = useMemo(() => (Array.isArray(product.images) ? product.images : []), [product.images]);
  const variants = useMemo(() => (Array.isArray(product.variants) ? product.variants : []), [product.variants]);

  // Selection State
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variants[0]?.id ?? null);
  const selectedVariant = useMemo(() => variants.find((v) => v.id === selectedVariantId) ?? null, [variants, selectedVariantId]);
  const [isAdding, setIsAdding] = useState(false);

  // Price & Stock Logic
  const priceSource = selectedVariant?.price ?? Number.parseFloat(String(product.price ?? '0'));
  const compareAtSource = selectedVariant?.compareAtPrice ?? (product.compareAtPrice ? Number(product.compareAtPrice) : undefined);
  const quantityNumber = Number.parseFloat(String(product.quantity ?? '0'));
  const isInStock = product.status === 'active' && (quantityNumber > 0 || product.allowBackorder);

  const formatPrice = useFormatPrice();

  useEffect(() => {
    analytics.trackProductView(product.id, selectedVariantId || undefined);
  }, [analytics, product.id, selectedVariantId]);

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);

    setTimeout(() => {
      addItem({
        id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
        productId: product.id,
        name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
        price: typeof priceSource === 'number' ? priceSource : Number(priceSource ?? 0),
        quantity: 1,
        image: images[0]?.url ?? null,
        variantId: selectedVariant?.id ?? null,
      });

      // Track add to cart event
      analytics.trackAddToCart(
        product.id,
        selectedVariant?.id,
        1,
        typeof priceSource === 'number' ? priceSource : Number(priceSource ?? 0)
      );

      setIsAdding(false);
      toast.success("ITEM ACQUIRED", {
        description: `${product.name} added to manifest.`,
        className: "font-mono uppercase"
      });
    }, 500);
  };

  // Dimensions formatter for the "Spec Sheet"
  const getSpecs = () => {
    const specs = [];
    if (product.length || product.width || product.height) {
      specs.push({ label: 'DIMENSIONS', value: `${product.length || '-'} x ${product.width || '-'} x ${product.height || '-'} CM` });
    }
    if (product.weight) {
      specs.push({ label: 'WEIGHT', value: `${product.weight} KG` });
    }
    if (product.sku) {
      specs.push({ label: 'SKU', value: product.sku });
    }
    specs.push({ label: 'ORIGIN', value: store.name.toUpperCase() });
    return specs;
  };

  return (
    <StoreFrontPageWrapper store={store} cartItemCount={cart.totalQuantity}>
      <main className="pt-16 lg:pt-0">
        {/* --- Top Meta Bar (Mobile Only) --- */}
        <div className="lg:hidden border-b border-border p-4 flex justify-between items-center text-xs font-mono uppercase tracking-widest">
          <span>REF: {product.id.slice(0, 8)}</span>
          <span className={isInStock ? "text-green-600" : "text-red-600"}>
            {isInStock ? "● IN STOCK" : "○ OUT OF STOCK"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">

          {/* --- LEFT: Editorial Image Scroll (7 Cols) --- */}
          <section className="lg:col-span-7 border-r border-border bg-muted/5">
            {images.length > 0 ? (
              <div className="flex flex-col divide-y divide-border">
                {images.map((img, idx) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt={img.alt || product.name}
                      className="w-full h-auto object-cover max-h-[120vh]"
                    />
                    <div className="absolute top-4 left-4 bg-background/80 backdrop-blur border border-border px-2 py-1 text-[10px] font-mono uppercase">
                      IMG_0{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-screen flex items-center justify-center bg-muted/20">
                <span className="text-9xl font-black text-muted-foreground/10 select-none">NO IMG</span>
              </div>
            )}
          </section>

          {/* --- RIGHT: Sticky Data Terminal (5 Cols) --- */}
          <section className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] flex flex-col">

              {/* 1. Product Identity */}
              <div className="p-6 md:p-8 lg:p-10 border-b border-border space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {product.categories && product.categories.length > 0 && (
                      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                        {product.categories[0].name}
                      </p>
                    )}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[0.85] tracking-tight">
                      {product.name}
                    </h1>
                  </div>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="text-2xl font-mono tracking-tight">
                    {formatPrice(priceSource)}
                  </span>
                  {compareAtSource && (
                    <span className="text-lg text-muted-foreground line-through font-mono">
                      {formatPrice(compareAtSource)}
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Controls & Description (Scrollable Area) */}
              <div className="flex-1 overflow-y-auto">

                {/* Description */}
                <div className="p-6 md:p-8 lg:p-10 border-b border-border">
                  <p className="text-base md:text-lg leading-relaxed text-muted-foreground text-justify hyphens-auto">
                    {product.description || product.shortDescription || "No technical description available for this item."}
                  </p>
                </div>

                {/* Variant Selector Matrix */}
                {variants.length > 0 && (
                  <div className="p-6 md:p-8 lg:p-10 border-b border-border">
                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-4">
                      CONFIGURATION
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={cn(
                            "min-w-[4rem] h-12 px-4 border text-sm font-mono uppercase transition-all",
                            selectedVariantId === variant.id
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-foreground text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Specs Table */}
                <div className="divide-y divide-border border-b border-border">
                  {getSpecs().map((spec) => (
                    <div key={spec.label} className="grid grid-cols-2 p-4 px-6 md:px-10 text-xs font-mono uppercase">
                      <span className="text-muted-foreground">{spec.label}</span>
                      <span className="text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>

                {/* Service Tickers */}
                <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
                  <div className="p-6 flex flex-col gap-2 items-center text-center">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-mono uppercase">Global Shipping</span>
                  </div>
                  <div className="p-6 flex flex-col gap-2 items-center text-center">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-mono uppercase">14-Day Returns</span>
                  </div>
                </div>
              </div>

              {/* 3. Action Footer (Sticky Bottom) */}
              <div className="p-6 md:p-8 border-t border-border bg-background">
                <Button
                  size="lg"
                  disabled={!isInStock || isAdding}
                  onClick={handleAddToCart}
                  className={cn(
                    "w-full h-16 rounded-none uppercase font-bold tracking-widest text-lg flex justify-between px-8 border-2 transition-all duration-300",
                    isInStock
                      ? "bg-foreground text-background border-foreground hover:bg-background hover:text-foreground"
                      : "bg-muted text-muted-foreground border-transparent cursor-not-allowed"
                  )}
                >
                  <span>{isInStock ? (isAdding ? "PROCESSING..." : "ADD TO CART") : "UNAVAILABLE"}</span>
                  {isInStock && !isAdding && <Plus className="w-6 h-6" />}
                </Button>
              </div>

            </div>
          </section>

        </div>

        {/* --- Footer: Recommendations --- */}
        <section className="border-t border-border bg-muted/10 py-20 lg:py-32">
          <div className="container max-w-[1600px] px-6">
            <div className="flex items-center justify-between mb-12 border-b border-border pb-6">
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
                Related Objects
              </h2>
              <Link href={`/stores/${store.slug}/products`} className="hidden md:flex items-center gap-2 text-sm font-mono uppercase hover:underline">
                View Index <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <RecommendedProducts storeSlug={store.slug} current={product} />
          </div>
        </section>

      </main>
    </StoreFrontPageWrapper>
  );
}
