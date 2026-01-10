'use client';

import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils/price';
import { CartItem as CartItemType } from '@/lib/state/storefront/types';

interface CartItemProps {
  item: CartItemType;
  storeSlug: string;
  currency: string;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
}

export default function CartItem({
  item,
  storeSlug,
  currency,
  updateQuantity,
  removeItem,
}: CartItemProps) {
  const displayPrice = (amount: number) => formatPrice(amount, currency);

  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8 flex gap-6 md:gap-8 group"
    >
      {/* Image (Editorial Ratio) */}
      <Link
        href={`/stores/${storeSlug}/products/${item.productId}`}
        className="shrink-0 w-24 md:w-32 aspect-[3/4] bg-muted relative overflow-hidden"
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[10px] font-mono uppercase text-muted-foreground">
            No Img
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between py-1">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <Link href={`/stores/${storeSlug}/products/${item.productId}`}>
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight leading-tight hover:underline">
                {item.name}
              </h3>
            </Link>
            {item.variantId && (
              <div className="text-xs font-mono uppercase text-muted-foreground">
                [ Variant: {item.variantId} ]
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="font-mono text-lg">
              {displayPrice(item.price * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="text-[10px] text-muted-foreground font-mono">
                {displayPrice(item.price)} ea.
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-end justify-between mt-4">
          <div className="flex items-center border border-border">
            <button
              className="w-8 h-8 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors disabled:opacity-30"
              onClick={() =>
                updateQuantity(item.productId, item.quantity - 1, item.variantId ?? undefined)
              }
              disabled={item.quantity <= 1}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-10 text-center text-sm font-mono">
              {item.quantity}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              onClick={() =>
                updateQuantity(item.productId, item.quantity + 1, item.variantId ?? undefined)
              }
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.productId, item.variantId ?? undefined)}
            className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        </div>
      </div>
    </motion.li>
  );
}
