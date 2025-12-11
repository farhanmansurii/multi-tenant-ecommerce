import { ProductData } from '@/lib/domains/products/types';
import React from 'react';
import ProductCard from './product-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import CarouselButtons from './product-carousel-buttons';
import { ArrowUpRight } from 'lucide-react';



type Props = {
  products: ProductData[];
  layout?: 'grid' | 'carousel';
  title?: string;
  subtitle?: string;
  viewAll?: boolean;
  categoryLookup?: Record<string, string>;
  storeSlug?: string;
  onAddToWishlist?: (product: ProductData) => void;
};

export default function ProductGrid({
  products,
  layout = 'grid',
  title,
  subtitle,
  viewAll,
  categoryLookup,
  storeSlug,
  onAddToWishlist,
}: Props) {
  const mergedProducts = React.useMemo(() => {
    const seenIds = new Set<string>();
    const combined = [...products];
    return combined.filter((product) => {
      if (seenIds.has(product.id)) return false;
      seenIds.add(product.id);
      return true;
    });
  }, [products]);

  if (layout === 'grid') {
    return (
      <section className="space-y-4">
        {(title || subtitle) && (
          <div className="flex items-center justify-between">
            <div>
              {title && <h2 className="text-2xl font-bold">{title}</h2>}
              {subtitle && (
                <p className="text-muted-foreground tracking-tight leading-5 mt-2 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
            {viewAll && (
              <Button variant="link" className="text-sm font-medium">
                View all
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mergedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryLookup={categoryLookup}
              storeSlug={storeSlug}
              onAddToWishlist={onAddToWishlist}
            />
          ))}
        </div>
      </section>
    );
  }

  // Carousel layout
  return (
    <section className="space-y-4 ">
      <Carousel opts={{ align: 'start' }}>
        <div className="flex items-start gap-4 justify-between">
          <div>
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {subtitle && (
              <p className="text-muted-foreground tracking-tight leading-5 mt-2 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <CarouselButtons />
          </div>
        </div>

        <CarouselContent className="mt-4">
          {mergedProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductCard
                product={product}
                categoryLookup={categoryLookup}
                storeSlug={storeSlug}
                onAddToWishlist={onAddToWishlist}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {!viewAll && (
        <Button
          variant="link"
          className="text-sm w-full sm:w-fit justify-end flex  font-medium"
        >
          View all <ArrowUpRight />
        </Button>
      )}
    </section>
  );
}
