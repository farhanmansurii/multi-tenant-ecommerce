import { ProductData } from '@/lib/domains/products/types';
import React from 'react';
import ProductCard from './product-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import CarouselButtons from './product-carousel-buttons';
import { ArrowUpRight } from 'lucide-react';

const dummyProducts: ProductData[] = [
	{
		id: 'demo-espresso-maker',
		storeId: 'demo-store',
		name: 'Barista Pro Espresso Maker',
		slug: 'barista-pro-espresso-maker',
		description:
			'Commercial-grade stainless steel espresso machine with precise temperature control.',
		shortDescription: 'Stainless steel espresso machine',
		sku: 'SKU-ESP-001',
		type: 'physical',
		status: 'active',
		price: '899.00',
		compareAtPrice: '999.00',
		quantity: '7',
		trackQuantity: true,
		allowBackorder: false,
		requiresShipping: true,
		taxable: true,
		featured: true,
		categories: ['coffee', 'equipment'],
		tags: ['featured', 'espresso'],
		images: [
			{
				id: 'espresso-maker-primary',
				url: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e',
				alt: 'Barista Pro Espresso Maker',
				isPrimary: true,
			},
		],
		variants: [],
		costPrice: null,
		weight: null,
		length: null,
		width: null,
		height: null,
		downloadUrl: null,
		downloadExpiry: null,
		metaTitle: null,
		metaDescription: null,
		publishedAt: null,
		createdAt: new Date('2024-01-01T00:00:00.000Z'),
		updatedAt: new Date('2024-01-01T00:00:00.000Z'),
	},
	{
		id: 'demo-beans-subscription',
		storeId: 'demo-store',
		name: 'Single-Origin Beans Subscription',
		slug: 'single-origin-beans-subscription',
		description:
			'Monthly rotation of freshly roasted single-origin beans delivered to your door.',
		shortDescription: 'Monthly curated beans',
		sku: 'SKU-BEAN-002',
		type: 'physical',
		status: 'active',
		price: '34.00',
		quantity: '100',
		trackQuantity: true,
		allowBackorder: true,
		requiresShipping: true,
		taxable: true,
		featured: false,
		categories: ['coffee', 'subscription'],
		tags: ['coffee', 'subscription'],
		images: [
			{
				id: 'beans-subscription-primary',
				url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e',
				alt: 'Single-Origin Beans Subscription',
				isPrimary: true,
			},
		],
		variants: [],
		compareAtPrice: null,
		costPrice: null,
		weight: null,
		length: null,
		width: null,
		height: null,
		downloadUrl: null,
		downloadExpiry: null,
		metaTitle: null,
		metaDescription: null,
		publishedAt: null,
		createdAt: new Date('2024-01-01T00:00:00.000Z'),
		updatedAt: new Date('2024-01-01T00:00:00.000Z'),
	},
	{
		id: 'demo-barista-workshop',
		storeId: 'demo-store',
		name: 'Barista Skills Workshop',
		slug: 'barista-skills-workshop',
		description:
			'Hands-on training covering latte art, espresso dialing, and machine maintenance.',
		shortDescription: 'Hands-on barista class',
		sku: 'SKU-WS-003',
		type: 'service',
		status: 'active',
		price: '149.00',
		quantity: '20',
		trackQuantity: false,
		allowBackorder: false,
		requiresShipping: false,
		taxable: false,
		featured: false,
		categories: ['education', 'coffee'],
		tags: ['class', 'training'],
		images: [
			{
				id: 'barista-workshop-primary',
				url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
				alt: 'Barista Skills Workshop',
				isPrimary: true,
			},
		],
		variants: [],
		compareAtPrice: null,
		costPrice: null,
		weight: null,
		length: null,
		width: null,
		height: null,
		downloadUrl: null,
		downloadExpiry: null,
		metaTitle: null,
		metaDescription: null,
		publishedAt: null,
		createdAt: new Date('2024-01-01T00:00:00.000Z'),
		updatedAt: new Date('2024-01-01T00:00:00.000Z'),
	},
	{
		id: 'demo2-espresso-maker',
		storeId: 'demo-store',
		name: 'Barista Pro Espresso Maker',
		slug: 'barista-pro-espresso-maker',
		description:
			'Commercial-grade stainless steel espresso machine with precise temperature control.',
		shortDescription: 'Stainless steel espresso machine',
		sku: 'SKU-ESP-001',
		type: 'physical',
		status: 'active',
		price: '899.00',
		compareAtPrice: '999.00',
		quantity: '7',
		trackQuantity: true,
		allowBackorder: false,
		requiresShipping: true,
		taxable: true,
		featured: true,
		categories: ['coffee', 'equipment'],
		tags: ['featured', 'espresso'],
		images: [
			{
				id: 'espresso-maker-secondary',
				url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
				alt: 'Barista Pro Espresso Maker alternate angle',
				isPrimary: true,
			},
		],
		variants: [],
		costPrice: null,
		weight: null,
		length: null,
		width: null,
		height: null,
		downloadUrl: null,
		downloadExpiry: null,
		metaTitle: null,
		metaDescription: null,
		publishedAt: null,
		createdAt: new Date('2024-01-01T00:00:00.000Z'),
		updatedAt: new Date('2024-01-01T00:00:00.000Z'),
	},
	{
		id: 'dem2o-beans-subscription',
		storeId: 'demo-store',
		name: 'Single-Origin Beans Subscription',
		slug: 'single-origin-beans-subscription',
		description:
			'Monthly rotation of freshly roasted single-origin beans delivered to your door.',
		shortDescription: 'Monthly curated beans',
		sku: 'SKU-BEAN-002',
		type: 'physical',
		status: 'active',
		price: '34.00',
		quantity: '100',
		trackQuantity: true,
		allowBackorder: true,
		requiresShipping: true,
		taxable: true,
		featured: false,
		categories: ['coffee', 'subscription'],
		tags: ['coffee', 'subscription'],
		images: [
			{
				id: 'beans-subscription-secondary',
				url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
				alt: 'Coffee beans subscription pack',
				isPrimary: true,
			},
		],
		variants: [],
		compareAtPrice: null,
		costPrice: null,
		weight: null,
		length: null,
		width: null,
		height: null,
		downloadUrl: null,
		downloadExpiry: null,
		metaTitle: null,
		metaDescription: null,
		publishedAt: null,
		createdAt: new Date('2024-01-01T00:00:00.000Z'),
		updatedAt: new Date('2024-01-01T00:00:00.000Z'),
	},
	{
		id: 'demo2-barista-workshop',
		storeId: 'demo-store',
		name: 'Barista Skills Workshop',
		slug: 'barista-skills-workshop',
		description:
			'Hands-on training covering latte art, espresso dialing, and machine maintenance.',
		shortDescription: 'Hands-on barista class',
		sku: 'SKU-WS-003',
		type: 'service',
		status: 'active',
		price: '149.00',
		quantity: '20',
		trackQuantity: false,
		allowBackorder: false,
		requiresShipping: false,
		taxable: false,
		featured: false,
		categories: ['education', 'coffee'],
		tags: ['class', 'training'],
		images: [
			{
				id: 'barista-workshop-secondary',
				url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814',
				alt: 'Barista workshop tools',
				isPrimary: true,
			},
		],
		variants: [],
		compareAtPrice: null,
		costPrice: null,
		weight: null,
		length: null,
		width: null,
		height: null,
		downloadUrl: null,
		downloadExpiry: null,
		metaTitle: null,
		metaDescription: null,
		publishedAt: null,
		createdAt: new Date('2024-01-01T00:00:00.000Z'),
		updatedAt: new Date('2024-01-01T00:00:00.000Z'),
	},
];

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
		const combined = [...products, ...dummyProducts];
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
