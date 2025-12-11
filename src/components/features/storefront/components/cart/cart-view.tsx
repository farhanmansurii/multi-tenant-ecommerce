'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { Button } from '@/components/ui/button';
import { useStorefrontCustomer } from '@/hooks/use-storefront-customer';

import { StoreData } from '@/lib/domains/stores/types';
import { useSessionContext } from '@/lib/session';

import CartItem from './cart-item';
import CartSummary from './cart-summary';
import CartEmptyState from './cart-empty-state';
import StoreFrontContainer from '../../shared/layout/container';
import StoreFrontPageWrapper from '../../shared/layout/page-wrapper';

type CartViewProps = {
  store: StoreData;
};

export default function CartView({ store }: CartViewProps) {
  const storeSlug = store.slug;
  const currency = store.currency;

  // Store State
  const { cart, updateQuantity, removeItem, clearCart, setStoreSlug } = useStorefrontStore(
    (state) => ({
      cart: state.cart,
      updateQuantity: state.updateQuantity,
      removeItem: state.removeItem,
      clearCart: state.clearCart,
      setStoreSlug: state.setStoreSlug,
    })
  );

  // Auth & Session Logic
  const { customerProfile, syncCustomerSession } = useStorefrontCustomer();
  const { user, isPending } = useSessionContext();

  useEffect(() => {
    setStoreSlug(storeSlug);
  }, [setStoreSlug, storeSlug]);

  useEffect(() => {
    if (isPending) return;
    if (user && user.id) {
      if (!customerProfile || customerProfile.id !== user.id) {
        syncCustomerSession({
          storeSlug,
          user: {
            id: String(user.id),
            name: (user.name as string | undefined) ?? null,
            email: (user.email as string | undefined) ?? null,
            image: (user.image as string | undefined) ?? null,
          },
        });
      }
    }
  }, [user, isPending, customerProfile, syncCustomerSession, storeSlug]);

  // Derived State
  const continueShoppingHref = `/stores/${storeSlug}/products`;
  const isAuthenticatedForStore = customerProfile?.storeSlug === storeSlug && Boolean(customerProfile?.id);
  const accountHref = `/stores/${storeSlug}/login?redirect=/stores/${storeSlug}/cart`;

  if (!cart.items.length) {
    return (
      <CartEmptyState store={store} continueShoppingHref={continueShoppingHref} />
    );
  }
  return (
    <StoreFrontPageWrapper store={store} cartItemCount={cart.totalQuantity}>
      <div className="min-h-screen bg-background text-foreground">

        {/* Header Strip */}
        <div className="border-b border-border py-6">
          <StoreFrontContainer>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">
                  [ Transaction Pending ]
                </span>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                  Manifest
                </h1>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono uppercase">
                <span>Ref: {new Date().getTime().toString().slice(-8)}</span>
                <span className="text-muted-foreground">|</span>
                <span>Count: {cart.totalQuantity}</span>
              </div>
            </div>
          </StoreFrontContainer>
        </div>

        <StoreFrontContainer className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

            {/* --- Left: Cart Items (Manifest Style) --- */}
            <div className="lg:col-span-8">

              <div className="flex justify-between border-b border-black text-[10px] font-mono uppercase tracking-widest pb-2 mb-0 opacity-60">
                <span>Item Description</span>
                <span className="hidden md:inline">Configuration</span>
                <span>Value</span>
              </div>

              <ul className="divide-y divide-border border-b border-border">
                <AnimatePresence initial={false}>
                  {cart.items.map((item) => (
                    <CartItem
                      key={`${item.productId}-${item.variantId}`}
                      item={item}
                      storeSlug={storeSlug}
                      currency={currency}
                      updateQuantity={updateQuantity}
                      removeItem={removeItem}
                    />
                  ))}
                </AnimatePresence>
              </ul>

              <div className="mt-8">
                <Button
                  variant="link"
                  className="text-muted-foreground hover:text-foreground px-0 uppercase text-xs font-bold tracking-widest"
                  onClick={clearCart}
                >
                  Clear All Data
                </Button>
              </div>
            </div>

            {/* --- Right: Summary (Sticky Terminal) --- */}
            <div className="lg:col-span-4">
              <CartSummary
                subtotal={cart.subtotal}
                currency={currency}
                storeSlug={storeSlug}
                isAuthenticatedForStore={isAuthenticatedForStore}
                accountHref={accountHref}
              />

              <div className="mt-6 text-center">
                <Link href={continueShoppingHref} className="inline-flex items-center text-xs font-bold uppercase tracking-widest hover:underline">
                  <ArrowLeft className="w-3 h-3 mr-2" /> Return to Index
                </Link>
              </div>
            </div>

          </div>
        </StoreFrontContainer>
      </div>
    </StoreFrontPageWrapper>
  );
}
