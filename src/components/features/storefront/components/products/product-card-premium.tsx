'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProductData } from '@/lib/domains/products/types';
import { formatPrice } from '@/lib/utils/price';

type Props = {
  product: ProductData;
  storeSlug?: string;
  storeCurrency?: string; // Passed from parent to ensure correct currency
  onAddToWishlist?: (product: ProductData) => void; // Optional for this brutalist style
  onAddToCart?: (product: ProductData) => void;
};

export default function ProductCard({
  product,
  storeSlug,
  storeCurrency = 'USD', // Default fallback
  onAddToCart
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Data Safety
  const productImages = Array.isArray(product.images) ? product.images : [];
  const primaryImage = productImages.find((img) => img.isPrimary) || productImages[0];
  const imageUrl = primaryImage?.url || null;
  const productHref = storeSlug ? `/stores/${storeSlug}/products/${product.slug}` : '#';

  // Logic
  const quantity = Number(product.quantity ?? 0);
  const isInStock = product.status === 'active' && (quantity > 0 || product.allowBackorder);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && isInStock) {
      onAddToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  return (
    <motion.div
      className="group relative flex flex-col border border-border bg-background"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 1. Image Area (Sharp, No Radius) */}
      <Link href={productHref} className="block relative aspect-[3/4] overflow-hidden bg-muted/20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
            <span className="text-4xl font-thin select-none">×</span>
            <span className="text-[10px] font-mono uppercase tracking-widest">No Image</span>
          </div>
        )}

        {/* Stock Badge (Absolute Top Left) */}
        {!isInStock && (
          <div className="absolute top-2 left-2 bg-background/90 backdrop-blur px-2 py-1 border border-border">
            <span className="text-[10px] font-mono uppercase text-red-600 tracking-widest">
              Out of Stock
            </span>
          </div>
        )}

        {/* Action Overlay (Slides up from bottom) */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
          <Button
            onClick={handleCartClick}
            disabled={!isInStock}
            className={cn(
              "w-full h-12 rounded-none uppercase font-bold tracking-widest text-xs flex items-center justify-between px-6 shadow-none border-t border-border",
              isAdded
                ? "bg-green-600 hover:bg-green-600 text-white"
                : "bg-background hover:bg-foreground hover:text-background text-foreground"
            )}
          >
            <span>{isAdded ? "Added" : isInStock ? "Add to Cart" : "Unavailable"}</span>
            {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </Link>

      {/* 2. Technical Data Block (Bottom) */}
      <div className="flex flex-col border-t border-border divide-y divide-border">

        {/* Row A: Title & Arrow */}
        <Link href={productHref} className="flex justify-between items-start p-4 hover:bg-muted/10 transition-colors group/title">
          <h3 className="text-sm font-medium uppercase tracking-tight line-clamp-2 pr-4 leading-relaxed group-hover/title:underline decoration-1 underline-offset-4">
            {product.name}
          </h3>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
        </Link>

        {/* Row B: Meta Grid */}
        <div className="grid grid-cols-2 text-[10px] font-mono uppercase tracking-widest">
          <div className="p-3 border-r border-border text-muted-foreground">
            Price
          </div>
          <div className="p-3 text-right font-medium text-foreground">
            {formatPrice(product.price, storeCurrency)}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
