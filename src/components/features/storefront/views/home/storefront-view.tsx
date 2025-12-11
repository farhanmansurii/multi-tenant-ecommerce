'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import { Loader } from '@/components/shared/common/loader';
import ProductGrid from '../../components/products/product-grid';
// UI Components
import { Button } from '@/components/ui/button';

import { useCategories } from '@/hooks/use-categories';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { useStorefrontCustomer } from '@/hooks/use-storefront-customer';
import { toast } from 'sonner';
import { fetchStore } from '@/lib/domains/stores/service';
import { fetchProducts } from '@/lib/domains/products/service';
import { ProductData } from '@/lib/domains/products';
import { StoreData } from '@/lib/domains/stores/types';
import { Category } from '@/lib/db/schema';
import { useStorefrontFilters } from '@/hooks/use-storefront-filters';
import StoreFrontContainer from '../../shared/layout/container';
import StorefrontControls from '../../shared/modules/storefront-controls';

interface StorefrontViewProps {
  slug: string;
  initialStore?: StoreData;
  initialProducts?: ProductData[];
  initialCategories?: Category[];
  hideHero?: boolean;
}

export default function StorefrontView({
  slug,
  initialStore,
  initialProducts = [],
  initialCategories = [],
  hideHero = false,
}: StorefrontViewProps) {
  const { selectedCategoryId, setStoreSlug, setSelectedCategoryId } = useStorefrontStore(
    (state) => ({
      selectedCategoryId: state.selectedCategoryId,
      setStoreSlug: state.setStoreSlug,
      setSelectedCategoryId: state.setSelectedCategoryId,
    })
  );

  const { customerProfile, addWishlistItem } = useStorefrontCustomer();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setStoreSlug(slug);
  }, [setStoreSlug, slug]);

  useEffect(() => {
    const categoryFromQuery = searchParams.get('category');
    if (categoryFromQuery) setSelectedCategoryId(categoryFromQuery);
  }, [searchParams, setSelectedCategoryId]);

  // --- DATA FETCHING ---
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => fetchStore(slug),
    initialData: initialStore,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => fetchProducts(slug),
    enabled: !!store,
    initialData: initialProducts,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useCategories(slug, {
    initialData: initialCategories,
  });

  // --- FILTER LOGIC ---
  const {
    filtersFromUrl,
    filteredProducts,
    updateFilters,
    hasActiveFilters,
  } = useStorefrontFilters({
    products: products as ProductData[],
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
  });

  const handleAddToWishlist = (product: ProductData) => {
    if (!store) return;
    if (!customerProfile || customerProfile.storeSlug !== store.slug) {
      toast.info('Sign in to wishlist', {
        action: { label: 'Sign in', onClick: () => router.push(`/stores/${store.slug}/login`) },
      });
      return;
    }
    const wishPrice = Number.parseFloat(product.price ?? '0');
    addWishlistItem({
      id: `${product.id}-${product.slug}`,
      storeSlug: store.slug,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: Number.isFinite(wishPrice) ? wishPrice : 0,
      image: product.images?.[0]?.url ?? null,
      addedAt: new Date().toISOString(),
    });
    toast.success('Saved to wishlist');
  };

  if (storeLoading || productsLoading || categoriesLoading) return <Loader text="Loading interface..." className="min-h-screen font-mono uppercase" />;
  if (!store) return <div className="min-h-screen flex items-center justify-center font-mono">STORE NOT FOUND</div>;

  // Use "active" view state if user is searching/filtering, otherwise "landing" view
  const isLandingView = !hasActiveFilters && !filtersFromUrl.search && !hideHero;

  return (
    <div id="products" className="min-h-screen bg-background">

      {/* Sticky Control Bar */}
      <StorefrontControls
        productCount={filteredProducts.length}
        hasActiveFilters={hasActiveFilters}
        filters={filtersFromUrl}
        categories={categories}
        onUpdateFilters={updateFilters}
      />

      {/* Product Grid */}
      <StoreFrontContainer>
        <div className="py-12 min-h-[50vh]">
          {filteredProducts.length > 0 ? (
            <ProductGrid
              products={filteredProducts}
              layout="grid"
              title={isLandingView ? "New Arrivals" : undefined}
              subtitle={isLandingView ? "Explore our latest collection of premium goods." : undefined}
              storeSlug={slug}
              storeCurrency={store.currency}
              onAddToWishlist={handleAddToWishlist}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-border bg-muted/5 text-center">
              <span className="text-6xl mb-4">∅</span>
              <h3 className="text-lg font-medium font-mono uppercase">No Inventory Found</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2 mb-8">
                Adjust your filters or search criteria to view available products.
              </p>
              <Button
                variant="outline"
                className="rounded-none uppercase tracking-widest"
                onClick={() => updateFilters({ search: '', sort: 'relevance', categories: [], priceRange: [0, 100000], inStockOnly: false })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </StoreFrontContainer>

    </div>
  );
}
