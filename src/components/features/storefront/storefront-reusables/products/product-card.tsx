import Link from 'next/link';
import { ProductData } from '@/lib/types/product';
import { Heart, ImageIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import { formatPrice } from '@/lib/utils/price';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

type Props = {
	product: ProductData;
	categoryLookup?: Record<string, string>;
	storeSlug?: string;
	onAddToWishlist?: (product: ProductData) => void;
};

export default function ProductCard({
	product,
	categoryLookup,
	storeSlug,
	onAddToWishlist,
}: Props) {
	const [loaded, setLoaded] = useState(false);
	const [showDetails, setShowDetails] = useState(false);

	const productImages = Array.isArray(product.images) ? product.images : [];
	const primaryImage = productImages.find((image) => image.isPrimary) ?? productImages[0];
	const productImage = primaryImage?.url || 'https://picsum.photos/1000/500';
	const productHref = storeSlug ? `/stores/${storeSlug}/products/${product.slug}` : undefined;

	const categoryLabels = useMemo(() => {
		const identifiers = Array.isArray(product.categories) ? product.categories : [];
		const seen = new Set<string>();
		return identifiers
			.map((identifier) => categoryLookup?.[identifier] ?? identifier)
			.filter((label): label is string => {
				if (!label) return false;
				if (seen.has(label)) return false;
				seen.add(label);
				return true;
			});
	}, [product.categories, categoryLookup]);

	const handleActionClick = () => setShowDetails((prev) => !prev);

	return (
		<motion.div
			className="w-full h-full aspect-[4/5] flex flex-col  overflow-hidden "
			whileHover={{ scale: 1.02 }}
			transition={{ type: 'spring', stiffness: 200, damping: 20 }}
		>
			<div
				className={cn(
					'flex-1 flex items-center justify-center bg-muted relative overflow-hidden'
				)}
			>
				<Button
					size="icon"
					onClick={handleActionClick}
					className="absolute top-2 right-2 h-7 w-7 z-10 rounded-full  shadow-md"
				>
					<Plus />
				</Button>

				{!loaded && (
					<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
						<ImageIcon className="h-8 w-8 animate-pulse" />
					</div>
				)}

				{productHref ? (
					<Link
						href={productHref}
						className="absolute inset-0"
						aria-label={`View ${product.name}`}
					>
						<span className="sr-only">View {product.name}</span>
					</Link>
				) : null}

				<motion.img
					src={productImage}
					alt={product.name}
					className={cn(
						'object-cover w-full h-full transition-opacity duration-300',
						loaded ? 'opacity-100' : 'opacity-0'
					)}
					onLoad={() => setLoaded(true)}
					initial={{ scale: 1.1 }}
					animate={{ scale: 1 }}
					transition={{ duration: 0.5 }}
				/>

				<AnimatePresence>
					{showDetails && (
						<motion.div
							initial={{ y: 50, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 50, opacity: 0 }}
							transition={{ type: 'spring', stiffness: 200, damping: 25 }}
							className="bottom-0 p-2 absolute w-full bg-background/90 backdrop-blur-sm"
						>
							<div className="grid grid-cols-5 gap-2">
								{['XS', 'S', 'M', 'L', 'XL'].map((size) => (
									<motion.button
										key={size}
										whileHover={{ scale: 1.05 }}
										className="h-10  flex items-center justify-center border rounded-md cursor-pointer text-sm font-medium"
									>
										{size}
									</motion.button>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<div className="flex p-3 flex-col">
				<div className=" flex gap-2 mb-2 flex-row w-fit left-1">
					{categoryLabels.map((category) => (
						<Badge key={category} className="text-xs">
							{category}
						</Badge>
					))}
				</div>
				<div className="font-semibold text-base lg:text-lg line-clamp-1">
					{productHref ? (
						<Link href={productHref} className="hover:underline">
							{product.name}
						</Link>
					) : (
						product.name
					)}
				</div>
				<div className="text-sm mt-1">
					{formatPrice(product.price)}{' '}
					{product.compareAtPrice && (
						<span className="text-destructive line-through opacity-50 ml-2">
							{formatPrice(product.compareAtPrice)}
						</span>
					)}
				</div>
				{onAddToWishlist && (
					<Button
						variant="ghost"
						size="sm"
						className="mt-3 w-fit gap-2"
						onClick={() => onAddToWishlist(product)}
					>
						<Heart className="h-4 w-4" /> Save for later
					</Button>
				)}
			</div>
		</motion.div>
	);
}
