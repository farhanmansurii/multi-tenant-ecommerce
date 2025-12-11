'use client';

import React from 'react';
import Link from 'next/link';
import { ProductData } from '@/lib/domains/products/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import StoreFrontContainer from '../../shared/layout/container';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { ProductCarouselButtons } from './product-carousel-buttons';
import ProductCard from './product-card-premium';



type Props = {
  products: ProductData[];
  layout?: 'grid' | 'carousel';
  title?: string;
  subtitle?: string;
  viewAll?: boolean;
  storeSlug?: string;
  onAddToWishlist?: (product: ProductData) => void;
  onAddToCart?: (product: ProductData) => void;
  // Added currency to props to pass down to cards
  storeCurrency?: string;
};

export default function ProductGrid({
  products,
  layout = 'grid',
  title,
  subtitle,
  viewAll,
  storeSlug,
  storeCurrency = 'USD',
  onAddToWishlist,
  onAddToCart,
}: Props) {

  // Deduplicate products based on ID
  const mergedProducts = React.useMemo(() => {
    const seenIds = new Set<string>();
    return products.filter((product) => {
      if (seenIds.has(product.id)) return false;
      seenIds.add(product.id);
      return true;
    });
  }, [products]);

  if (mergedProducts.length === 0) return null;

  // --- Shared Header Component ---
  const SectionHeader = ({ showControls = false }: { showControls?: boolean }) => (
    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10 border-b border-zinc-200 dark:border-zinc-800 pb-6">
      <div className="space-y-2 max-w-2xl">
        {title && (
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              [ Collection ]
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]">
              {title}
            </h2>
          </div>
        )}
        {subtitle && (
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide max-w-lg leading-relaxed">
            // {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {viewAll && (
          <Link href={storeSlug ? `/stores/${storeSlug}/products` : '#'}>
            <Button variant="ghost" className="rounded-none h-10 px-4 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors gap-2 group">
              View Index <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Button>
          </Link>
        )}

        {/* Carousel Controls (Only visible in carousel layout) */}
        {showControls && (
          <div className="flex items-center gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
            <CarouselPrevious className="static translate-y-0 translate-x-0 h-10 w-10 rounded-none border-none bg-background hover:bg-black hover:text-white" />
            <CarouselNext className="static translate-y-0 translate-x-0 h-10 w-10 rounded-none border-none bg-background hover:bg-black hover:text-white" />
          </div>
        )}
      </div>
    </div>
  );

  // --- Grid Layout ---
  if (layout === 'grid') {
    return (
      <section className="py-12 md:py-20">
        {(title || subtitle) && <SectionHeader />}

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mergedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              storeSlug={storeSlug}
              storeCurrency={storeCurrency}
              onAddToWishlist={onAddToWishlist}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>
    );
  }

  // --- Carousel Layout ---
  return (
    <section className="py-12 md:py-20 overflow-hidden">
      <Carousel opts={{ align: 'start', loop: true }} className="w-full">

        <SectionHeader showControls={true} />

        <CarouselContent className="-ml-4">
          {mergedProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-4 basis-4/5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductCard
                product={product}
                storeSlug={storeSlug}
                storeCurrency={storeCurrency}
                onAddToWishlist={onAddToWishlist}
                onAddToCart={onAddToCart}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
