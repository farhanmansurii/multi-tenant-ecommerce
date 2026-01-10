import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StorefrontFiltersState } from '@/components/features/storefront/shared/modules/filters/storefront-filters';
import { ProductData } from '@/lib/domains/products';
import { Category } from '@/lib/db/schema';

interface UseStorefrontFiltersProps {
  products: ProductData[];
  categories: Category[];
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
}

export function useStorefrontFilters({
  products,
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
}: UseStorefrontFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filtersFromUrl: StorefrontFiltersState = useMemo(() => {
    const getAll = (key: string) => searchParams.getAll(key).filter(Boolean);
    const getOne = (key: string) => searchParams.get(key) || '';
    const num = (v: string | null, fallback: number) => {
      const n = Number(v);
      return v !== null && v !== '' && Number.isFinite(n) ? n : fallback;
    };

    const categoriesFromUrl = getAll('category');
    const categoriesSel =
      categoriesFromUrl.length > 0
        ? categoriesFromUrl
        : selectedCategoryId
        ? [selectedCategoryId]
        : [];

    return {
      search: getOne('q'),
      sort: (getOne('sort') as StorefrontFiltersState['sort']) || 'relevance',
      categories: categoriesSel,
      priceRange: [
        num(searchParams.get('min'), 0),
        num(searchParams.get('max'), 100000),
      ] as [number, number],
      inStockOnly: searchParams.get('stock') === '1',
    };
  }, [searchParams, selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    let result = products as ProductData[];

    // 1. Search
    if (filtersFromUrl.search.trim()) {
      const q = filtersFromUrl.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.shortDescription ?? '').toLowerCase().includes(q)
      );
    }

    // 2. Category
    if (filtersFromUrl.categories.length > 0) {
      result = result.filter((p) => {
        const productCategoryIds = Array.isArray(p.categories)
          ? p.categories.map((c) => (typeof c === 'string' ? c : c.id))
          : [];
        return filtersFromUrl.categories.some((filterCat: string) => {
          if (productCategoryIds.includes(filterCat)) return true;
          const matchingCategory = categories.find(
            (cat) => cat.slug === filterCat || cat.id === filterCat
          );
          return matchingCategory
            ? productCategoryIds.includes(matchingCategory.id)
            : false;
        });
      });
    }

    // 3. Price
    const min = Number(filtersFromUrl.priceRange?.[0] ?? 0);
    const max = Number(filtersFromUrl.priceRange?.[1] ?? 100000);
    result = result.filter((p) => {
      const priceNum = Number(p.price ?? '0');
      return priceNum >= min && priceNum <= max;
    });

    // 4. Stock
    if (filtersFromUrl.inStockOnly) {
      result = result.filter((p) => {
        const qty = Number(p.quantity ?? '0');
        return p.status === 'active' && (qty > 0 || p.allowBackorder);
      });
    }

    // 5. Sort
    const byPrice = (a: ProductData, b: ProductData) =>
      Number(a.price ?? '0') - Number(b.price ?? '0');
    const byNewest = (a: ProductData, b: ProductData) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();

    if (filtersFromUrl.sort === 'price_asc') result = [...result].sort(byPrice);
    else if (filtersFromUrl.sort === 'price_desc')
      result = [...result].sort((a, b) => byPrice(b, a));
    else if (filtersFromUrl.sort === 'newest')
      result = [...result].sort(byNewest);

    return result;
  }, [products, filtersFromUrl, categories]);

  const updateFilters = (next: StorefrontFiltersState) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('sort');
    url.searchParams.delete('category');
    url.searchParams.delete('min');
    url.searchParams.delete('max');
    url.searchParams.delete('stock');

    if (next.search) url.searchParams.set('q', next.search);
    if (next.sort && next.sort !== 'relevance')
      url.searchParams.set('sort', next.sort);
    next.categories.forEach((c: string) => url.searchParams.append('category', c));
    if (next.priceRange?.[0] > 0)
      url.searchParams.set('min', String(next.priceRange[0]));
    if (next.priceRange?.[1] < 100000)
      url.searchParams.set('max', String(next.priceRange[1]));
    if (next.inStockOnly) url.searchParams.set('stock', '1');

    if (next.categories.length === 0) setSelectedCategoryId(null);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const hasActiveFilters =
    filtersFromUrl.categories.length > 0 ||
    !!filtersFromUrl.search ||
    filtersFromUrl.inStockOnly ||
    filtersFromUrl.priceRange[0] > 0 ||
    filtersFromUrl.priceRange[1] < 100000;

  return {
    filtersFromUrl,
    filteredProducts,
    updateFilters,
    hasActiveFilters,
  };
}
