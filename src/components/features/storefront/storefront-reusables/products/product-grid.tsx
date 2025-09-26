import { ProductData } from '@/lib/types/product';
import React from 'react';
import ProductCard from './product-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import CarouselButtons from './product-carousel-buttons';
import { ArrowUpRight } from 'lucide-react';

const dummyProducts: ProductData[] = [
	{
		id: 'demo-espresso-maker',
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
		requiresShipping: true,
		taxable: true,
		trackQuantity: true,
		allowBackorder: false,
		featured: true,
		categories: ['coffee', 'equipment'],
		tags: ['featured', 'espresso'],
	},
	{
		id: 'demo-beans-subscription',
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
		requiresShipping: true,
		taxable: true,
		trackQuantity: true,
		allowBackorder: true,
		featured: false,
		categories: ['coffee', 'subscription'],
		tags: ['coffee', 'subscription'],
	},
	{
		id: 'demo-barista-workshop',
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
		requiresShipping: false,
		taxable: false,
		trackQuantity: false,
		allowBackorder: false,
		featured: false,
		categories: ['education', 'coffee'],
		tags: ['class', 'training'],
	},
	{
		id: 'demo2-espresso-maker',
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
		requiresShipping: true,
		taxable: true,
		trackQuantity: true,
		allowBackorder: false,
		featured: true,
		categories: ['coffee', 'equipment'],
		tags: ['featured', 'espresso'],
	},
	{
		id: 'dem2o-beans-subscription',
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
		requiresShipping: true,
		taxable: true,
		trackQuantity: true,
		allowBackorder: true,
		featured: false,
		categories: ['coffee', 'subscription'],
		tags: ['coffee', 'subscription'],
	},
	{
		id: 'demo2-barista-workshop',
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
		requiresShipping: false,
		taxable: false,
		trackQuantity: false,
		allowBackorder: false,
		featured: false,
		categories: ['education', 'coffee'],
		tags: ['class', 'training'],
	},
];

type Props = {
	products: ProductData[];
	layout?: 'grid' | 'carousel';
	title?: string;
	subtitle?: string;
	viewAll?: boolean;
	categoryLookup?: Record<string, string>;
};

export default function ProductGrid({
	products,
	layout = 'grid',
	title,
	subtitle,
	viewAll,
	categoryLookup,
}: Props) {
	console.log('(log) ~ ProductGrid ~ categoryLookup:', categoryLookup);
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
							<ProductCard product={product} />
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
