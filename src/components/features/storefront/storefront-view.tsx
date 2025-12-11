'use client';

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import { Loader } from '@/components/shared/common/loader';

import { StoreFrontHeader } from './storefront-reusables/navbar';
import StoreFrontFooter from './storefront-reusables/footer';

import ProductGrid from './storefront-reusables/products/product-grid';
import { StorefrontFilters, type StorefrontFiltersState } from './storefront-reusables/filters/storefront-filters';
import StoreFrontContainer from './storefront-reusables/container';
import { useCategories } from '@/hooks/use-categories';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';

import { useStorefrontCustomer } from '@/hooks/use-storefront-customer';
import { toast } from 'sonner';
import { fetchStore } from '@/lib/domains/stores/service';
import { fetchProducts } from '@/lib/domains/products/service';
import { ProductData } from '@/lib/domains/products';

interface StorefrontViewProps {
  slug: string;
}

export default function StorefrontView({ slug }: StorefrontViewProps) {
  const { selectedCategoryId, setStoreSlug, setSelectedCategoryId, cart } = useStorefrontStore(
    (state) => ({
      selectedCategoryId: state.selectedCategoryId,
      setStoreSlug: state.setStoreSlug,
      setSelectedCategoryId: state.setSelectedCategoryId,
      cart: state.cart,
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
    if (!categoryFromQuery) return;
    setSelectedCategoryId(categoryFromQuery);
  }, [searchParams, setSelectedCategoryId]);

  const {
    data: store,
    isLoading: storeLoading,
    error: storeError,
  } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => fetchStore(slug),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => fetchProducts(slug),
    enabled: !!store,
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
    error: categoriesError,
  } = useCategories(slug);

  useEffect(() => {
    if (!selectedCategoryId) return;
    const exists = categories.some(
      (category) => category.id === selectedCategoryId || category.slug === selectedCategoryId
    );
    if (!exists) {
      setSelectedCategoryId(null);
    }
  }, [categories, selectedCategoryId, setSelectedCategoryId]);

  const categoryLookup = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = category.name;
      if (category.slug) {
        acc[category.slug] = category.name;
      }
      return acc;
    }, {});
  }, [categories]);

  const filtersFromUrl: StorefrontFiltersState = useMemo(() => {
    const getAll = (key: string) => searchParams.getAll(key).filter(Boolean);
    const getOne = (key: string) => searchParams.get(key) || '';
    const num = (v: string | null, fallback: number) => {
      if (v === null || v === '') return fallback;
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    const categoriesFromUrl = getAll('category');
    const categoriesSel = categoriesFromUrl.length > 0
      ? categoriesFromUrl
      : selectedCategoryId
        ? [selectedCategoryId]
        : [];

    return {
      search: getOne('q'),
      sort: (getOne('sort') as StorefrontFiltersState['sort']) || 'relevance',
      categories: categoriesSel,
      priceRange: [num(searchParams.get('min'), 0), num(searchParams.get('max'), 100000)] as [number, number],
      inStockOnly: searchParams.get('stock') === '1',
    };
  }, [searchParams, selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    let result = products as ProductData[];

    // Search
    if (filtersFromUrl.search.trim()) {
      const q = filtersFromUrl.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.shortDescription ?? '').toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
      );
    }

    // Category filter (supports slugs and ids)
    if (filtersFromUrl.categories.length > 0) {
      result = result.filter((p) => {
        const productCategoryIds = Array.isArray(p.categories)
          ? p.categories.map(c => typeof c === 'string' ? c : c.id)
          : [];
        // Product matches if ANY of the selected categories match
        return filtersFromUrl.categories.some((filterCat) => {
          // Check direct ID match
          if (productCategoryIds.includes(filterCat)) return true;
          // Check if filterCat is a slug that matches a category ID
          const matchingCategory = categories.find(cat => cat.slug === filterCat || cat.id === filterCat);
          if (matchingCategory) {
            return productCategoryIds.includes(matchingCategory.id);
          }
          return false;
        });
      });
    }

    // Price range
    const min = Number(filtersFromUrl.priceRange?.[0] ?? 0);
    const max = Number(filtersFromUrl.priceRange?.[1] ?? 100000);
    result = result.filter((p) => {
      const priceNum = Number(p.price ?? '0');
      return priceNum >= min && priceNum <= max;
    });

    // Stock
    if (filtersFromUrl.inStockOnly) {
      result = result.filter((p) => {
        const qty = Number(p.quantity ?? '0');
        return p.status === 'active' && (qty > 0 || p.allowBackorder);
      });
    }

    // Sort
    const byPrice = (a: ProductData, b: ProductData) =>
      Number(a.price ?? '0') - Number(b.price ?? '0');
    const byNewest = (a: ProductData, b: ProductData) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    if (filtersFromUrl.sort === 'price_asc') result = [...result].sort(byPrice);
    else if (filtersFromUrl.sort === 'price_desc') result = [...result].sort((a, b) => byPrice(b, a));
    else if (filtersFromUrl.sort === 'newest') result = [...result].sort(byNewest);

    return result;
  }, [products, filtersFromUrl]);

  const loading = storeLoading || productsLoading || categoriesLoading || categoriesFetching;
  const error = storeError ?? categoriesError ?? null;

  const handleAddToWishlist = (product: ProductData) => {
    if (!store) {
      toast.error('Store details are still loading. Please try again.');
      return;
    }

    if (!customerProfile || customerProfile.storeSlug !== store.slug) {
      toast.info('Sign in to save products to your wishlist.', {
        description: `${store.name} customers can create wishlists after signing in.`,
        action: {
          label: 'Sign in',
          onClick: () => router.push(`/stores/${store.slug}/login`),
        },
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
    toast.success('Saved to your wishlist.');
  };

  if (loading) {
    return <Loader text="Loading storefront..." className="min-h-screen" />;
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-red-100 p-4">
              <svg
                className="h-8 w-8 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Store unavailable</h1>
            <p className="text-gray-600">
              {error instanceof Error
                ? error.message
                : 'We could not find the store you were looking for.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Build header title based on selected categories
  const getHeaderTitle = () => {
    const selectedCategories = filtersFromUrl.categories;
    if (selectedCategories.length === 0) return 'All Products';
    if (selectedCategories.length === 1) return categoryLookup[selectedCategories[0]] || 'Products';
    return `${selectedCategories.length} Categories`;
  };

  const getHeaderSubtitle = () => {
    const selectedCategories = filtersFromUrl.categories;
    if (selectedCategories.length === 0) return 'Discover our full catalog of products';
    if (selectedCategories.length === 1) {
      const name = categoryLookup[selectedCategories[0]];
      return name ? `Browse products in ${name}` : 'Browse our products';
    }
    const names = selectedCategories.map(id => categoryLookup[id]).filter(Boolean);
    return `Browsing: ${names.join(', ')}`;
  };

  return (
    <div className="min-h-screen ">
      <StoreFrontHeader storeData={store} cartItemCount={cart.totalQuantity} />
      <StoreFrontContainer className="py-30">
        <div className="space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold">
              {getHeaderTitle()}
            </h1>
            <p className="text-muted-foreground">
              {getHeaderSubtitle()}
            </p>
          </header>

          <StorefrontFilters
            categories={categories}
            value={filtersFromUrl}
            onChange={(next) => {
              const url = new URL(window.location.href);
              // Clear existing params first for a clean slate
              url.searchParams.delete('q');
              url.searchParams.delete('sort');
              url.searchParams.delete('category');
              url.searchParams.delete('min');
              url.searchParams.delete('max');
              url.searchParams.delete('stock');

              // Only set non-default values
              if (next.search) url.searchParams.set('q', next.search);
              if (next.sort && next.sort !== 'relevance') url.searchParams.set('sort', next.sort);
              next.categories.forEach((c) => url.searchParams.append('category', c));
              if (next.priceRange?.[0] && next.priceRange[0] > 0) url.searchParams.set('min', String(next.priceRange[0]));
              if (next.priceRange?.[1] && next.priceRange[1] < 100000) url.searchParams.set('max', String(next.priceRange[1]));
              if (next.inStockOnly) url.searchParams.set('stock', '1');


              if (next.categories.length === 0) {
                setSelectedCategoryId(null);
              }

              router.replace(url.pathname + url.search, { scroll: false });
            }}
          />

          <ProductGrid
            products={filteredProducts}
            layout="grid"
            subtitle={
              filtersFromUrl.categories.length > 0
                ? undefined
                : "Explore our latest arrivals and best-selling collections. Find exactly what you've been looking for."
            }
            categoryLookup={categoryLookup}
            storeSlug={slug}
            onAddToWishlist={handleAddToWishlist}
          />
        </div>
      </StoreFrontContainer>
      <StoreFrontFooter store={store} />
    </div>
  );
}
