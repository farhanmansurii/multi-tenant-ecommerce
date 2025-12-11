/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import StoreFrontContainer from '../storefront-reusables/container';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { formatPrice } from '@/lib/utils/price'; // Assuming updated utility
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStorefrontCustomer } from '@/hooks/use-storefront-customer';
import { cn } from '@/lib/utils';

type CartViewProps = {
  storeSlug: string;
  currency?: string;
};

export default function CartView({ storeSlug, currency = 'USD' }: CartViewProps) {
  const { cart, updateQuantity, removeItem, clearCart, setStoreSlug } = useStorefrontStore(
    (state) => ({
      cart: state.cart,
      updateQuantity: state.updateQuantity,
      removeItem: state.removeItem,
      clearCart: state.clearCart,
      setStoreSlug: state.setStoreSlug,
    })
  );

  const { customerProfile } = useStorefrontCustomer();
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    setStoreSlug(storeSlug);
  }, [setStoreSlug, storeSlug]);

  // --- Derived State ---
  const continueShoppingHref = `/stores/${storeSlug}`;
  const isAuthenticatedForStore = customerProfile?.storeSlug === storeSlug && Boolean(customerProfile?.id);
  const accountHref = `/stores/${storeSlug}/login?redirect=/stores/${storeSlug}/cart`;

  // Helper for pricing
  const displayPrice = (amount: number) => formatPrice(amount, currency);

  // --- Empty State ---
  if (!cart.items.length) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden bg-background">
        {/* Background Texture */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-1/2 top-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]"></div>
        </div>

        <StoreFrontContainer>
          <div className="mx-auto flex max-w-md flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center border border-border/50 shadow-sm">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Your bag is empty</h1>
              <p className="text-muted-foreground text-lg">
                Looks like you haven't added anything to your cart yet.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/20">
              <Link href={continueShoppingHref}>
                Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </StoreFrontContainer>
      </div>
    );
  }

  // --- Main Cart View ---
  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10"></div>

      <StoreFrontContainer className="py-12 md:py-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Shopping Bag</h1>
            <p className="text-muted-foreground">
              {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link href={continueShoppingHref} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
            </Link>
          </Button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_1fr] gap-10 xl:gap-16 items-start">

          {/* --- Left Column: Cart Items --- */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden">
              <div className="divide-y divide-border/40">
                <AnimatePresence initial={false}>
                  {cart.items.map((item) => {
                    const lineTotal = item.price * item.quantity;
                    return (
                      <motion.div
                        key={`${item.productId}-${item.variantId}`}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, padding: 0 }}
                        className="p-6 flex flex-col sm:flex-row gap-6 bg-card"
                      >
                        {/* Image */}
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground/50">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1.5">
                              <h3 className="font-semibold text-lg leading-tight text-foreground">
                                {item.name}
                              </h3>
                              {item.variantId && (
                                <Badge variant="secondary" className="font-normal text-xs bg-muted/50 border-border/50">
                                  Variant: {item.variantId}
                                </Badge>
                              )}
                            </div>

                            <p className="font-bold text-lg tabular-nums">
                              {displayPrice(lineTotal)}
                            </p>
                          </div>

                          <div className="flex items-end justify-between mt-4 sm:mt-0">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 bg-muted/30 p-1 rounded-lg border border-border/50">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md hover:bg-background shadow-sm disabled:opacity-30"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium tabular-nums">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md hover:bg-background shadow-sm"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Remove */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    onClick={() => removeItem(item.productId, item.variantId)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    <span className="text-xs font-medium">Remove</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove from cart</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear Shopping Bag
              </Button>
            </div>
          </div>

          {/* --- Right Column: Order Summary --- */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-card rounded-2xl border border-border/40 shadow-lg shadow-black/5 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold tabular-nums">{displayPrice(cart.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping Estimate</span>
                  <span className="text-muted-foreground text-xs">Calculated at checkout</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax Estimate</span>
                  <span className="text-muted-foreground text-xs">Calculated at checkout</span>
                </div>

                <Separator className="my-4" />

                {/* Promo Code Input (Visual Only for now) */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                  <Button variant="outline" disabled={!promoCode}>Apply</Button>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl tabular-nums tracking-tight">
                    {displayPrice(cart.subtotal)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 space-y-3">
                <Button
                  size="lg"
                  className="w-full h-12 text-base font-semibold shadow-xl shadow-primary/20 rounded-full"
                  disabled={!isAuthenticatedForStore}
                  onClick={() => window.location.href = `/stores/${storeSlug}/checkout`}
                >
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {!isAuthenticatedForStore && (
                  <div className="text-center bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-2">
                      You need to sign in to complete your purchase.
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full h-9 border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      <Link href={accountHref}>Sign In / Create Account</Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Trust Signals */}
              <div className="mt-6 flex flex-col gap-2 items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                  <span>Secure SSL Encrypted Checkout</span>
                </div>
                <div className="flex gap-3 mt-2 opacity-60 grayscale">
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </StoreFrontContainer>
    </div>
  );
}
