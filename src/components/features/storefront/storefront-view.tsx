'use client';

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Loader } from '@/components/shared/common/loader';
import { fetchProducts } from '@/lib/services/product-api';
import { StoreFrontHeader } from './storefront-reusables/navbar';
import StoreFrontFooter from './storefront-reusables/footer';
import { fetchStore } from '@/lib/services/store-api';
import ProductGrid from './storefront-reusables/products/product-grid';
import StoreFrontContainer from './storefront-reusables/container';
import { useCategories } from '@/hooks/use-categories';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import type { ProductData } from '@/lib/types/product';
import { Category } from '@/lib/db/schema';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StorefrontViewProps {
	slug: string;
}

export default function StorefrontView({ slug }: StorefrontViewProps) {
	const {
		selectedCategoryId,
		toggleCategory,
		setStoreSlug,
		setSelectedCategoryId,
		cart,
		addItem,
	} = useStorefrontStore((state) => ({
		selectedCategoryId: state.selectedCategoryId,
		toggleCategory: state.toggleCategory,
		setStoreSlug: state.setStoreSlug,
		setSelectedCategoryId: state.setSelectedCategoryId,
		cart: state.cart,
		addItem: state.addItem,
	}));

	useEffect(() => {
		setStoreSlug(slug);
	}, [setStoreSlug, slug]);

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

	const filteredProducts = useMemo(() => {
		if (!selectedCategoryId) return products;

		return products.filter((product) =>
			product.categories?.some((category) => category === selectedCategoryId)
		);
	}, [products, selectedCategoryId]);

	const loading = storeLoading || productsLoading || categoriesLoading || categoriesFetching;
	const error = storeError ?? categoriesError ?? null;

	// Event handlers
	const handleSearch = (query: string) => {
		// Implement search functionality
	};

	const handleCartClick = () => {
		// Implement cart functionality
	};

	const handleAccountClick = () => {
		// Implement account functionality
	};

	const handleProductClick = (productId: string) => {
		// Navigate to product detail page
	};

	const handleAddToCart = (product: ProductData) => {
		const price = Number.parseFloat(product.price ?? '0');
		addItem({
			id: `${product.id}-${product.slug}`,
			productId: product.id,
			name: product.name,
			price: Number.isFinite(price) ? price : 0,
			quantity: 1,
			image: product.images?.[0]?.url ?? null,
		});
	};

	const handleAddToWishlist = (productId: string) => {
		// Implement add to wishlist functionality
	};

	const handleCategorySelect = (categoryId: string) => {
		toggleCategory(categoryId);
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

	return (
		<div className="min-h-screen ">
			<StoreFrontHeader storeData={store} cartItemCount={cart.totalQuantity} />
			<StoreFrontContainer className="py-30">
				<ProductGrid
					products={filteredProducts}
					title="All Products"
					layout="grid"
					subtitle="Minim amet deserunt ullamco quis pariatur deserunt consequat enim est ullamco quis tempor reprehenderit. Proident est veniam aliquip consequat consequat pariatur commodo sunt et aliquip dolore labore officia tempor. Ea culpa velit nostrud ex deserunt sunt commodo elit nisi incididunt id."
					categoryLookup={categoryLookup}
				/>
			</StoreFrontContainer>
			{categories.map((category: Category) => (
				<div
					key={category.id}
					style={{ background: category.color || '' }}
					className={cn(`bg-${category.color}`)}
				>
					<img src={category.image || ''} />
				</div>
			))}

			<StoreFrontFooter store={store} />
		</div>
	);
}
