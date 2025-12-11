import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Eye,
  ImageIcon,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProductData } from '@/lib/domains/products/types';
import { formatPrice } from '@/lib/utils/price';

type Props = {
  product: ProductData;
  categoryLookup?: Record<string, string>;
  storeSlug?: string;
  onAddToWishlist?: (product: ProductData) => void;
  onAddToCart?: (product: ProductData) => void;
};

export default function ProductCard({
  product,
  categoryLookup,
  storeSlug,
  onAddToWishlist,
  onAddToCart
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // --- Data Logic ---
  const productImages = Array.isArray(product.images) ? product.images : [];
  const primaryImage = productImages.find((img) => img.isPrimary) || productImages[0];
  const secondaryImage = productImages.find((img) => !img.isPrimary && img.id !== primaryImage?.id);

  const imageUrl = primaryImage?.url || null;
  const hoverImageUrl = secondaryImage?.url || null;
  const productHref = storeSlug ? `/stores/${storeSlug}/products/${product.slug}` : '#';

  // --- Category Label ---
  const categoryLabel = useMemo(() => {
    const cats = Array.isArray(product.categories) ? product.categories : [];
    if (cats.length === 0) return null;
    return cats[0].name;
  }, [product.categories]);

  // --- Price Logic ---
  const price = Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : 0;
  const isOnSale = compareAtPrice > price;

  const discountPercent = isOnSale
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  // --- Handlers ---
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  return (
    <TooltipProvider>
      <motion.div
        className="group relative flex flex-col h-full bg-card rounded-xl border border-border/40 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* --- Image Container --- */}
        <Link
          href={productHref}
          className="relative block w-full aspect-[4/5] bg-muted overflow-hidden"
        >
          {/* 1. Badges (Absolute) */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 pointer-events-none">
            {isOnSale && (
              <Badge className="bg-red-500 text-white border-0 shadow-sm font-bold">
                -{discountPercent}%
              </Badge>
            )}
            {categoryLabel && (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-md shadow-sm border-border/20">
                {categoryLabel}
              </Badge>
            )}
          </div>

          {/* 2. Wishlist Button */}
          {onAddToWishlist && (
            <button
              onClick={handleWishlistClick}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border/10 text-muted-foreground transition-all hover:bg-background hover:text-red-500 hover:scale-110 shadow-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 duration-300"
            >
              <Heart className="w-4 h-4" />
            </button>
          )}

          {/* 3. Placeholder (While Loading) */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center text-muted-foreground/20 z-0 bg-muted transition-opacity duration-500",
            isImageLoaded ? "opacity-0" : "opacity-100"
          )}>
            <ImageIcon className="w-12 h-12 animate-pulse" />
          </div>

          {/* 4. Primary Image (Native <img>) */}
          {imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onLoad={() => setIsImageLoaded(true)}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out z-10 will-change-transform",
                // Fade in on load
                isImageLoaded ? "opacity-100" : "opacity-0",
                // Zoom effect (disabled if secondary image exists and hovered)
                hoverImageUrl && isHovered ? "opacity-0" : "scale-100 group-hover:scale-110"
              )}
            />
          )}

          {/* 5. Secondary Image (Native <img>) */}
          {hoverImageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={hoverImageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out z-10 will-change-transform",
                isHovered ? "opacity-100 scale-110" : "opacity-0 scale-100"
              )}
            />
          )}

          {/* 6. Action Bar (Slide Up) */}
          <div className="absolute inset-x-0 bottom-0 z-30 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
            <div className="flex gap-2">
              <Button
                className={cn(
                  "flex-1 gap-2 shadow-lg transition-all active:scale-95",
                  isAdded
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-background/95 hover:bg-background text-foreground hover:text-primary backdrop-blur-md"
                )}
                onClick={handleCartClick}
              >
                {isAdded ? (
                  <><Check className="w-4 h-4" /> Added</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> Quick Add</>
                )}
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="secondary" className="bg-background/80 backdrop-blur-md shadow-lg hover:bg-background">
                    <Eye className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Details</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Link>

        {/* --- Product Info --- */}
        <div className="flex flex-col p-4 gap-1.5 bg-card z-20">
          <Link href={productHref} className="group/title block">
            <h3 className="font-semibold text-base leading-tight truncate text-foreground group-hover/title:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg text-foreground">
                {formatPrice(product.price)}
              </span>
              {isOnSale && (
                <span className="text-xs text-muted-foreground line-through opacity-70">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
