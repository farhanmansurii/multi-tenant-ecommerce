'use client';

import { StoreData } from '@/lib/domains/stores/types';
import StoreFrontContainer from '../layout/container';

export function StoreServiceStrip({ store }: { store: StoreData }) {
  return (
    <StoreFrontContainer className="bg-background text-foreground">
      {/* A static grid for desktop, stacked for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200">

        <ServiceItem
          label="Shipping"
          value={store.shippingEnabled ? "Worldwide Express" : "Digital Delivery"}
          sub={store.freeShippingThreshold ? `Free over ${store.currency}${store.freeShippingThreshold}` : undefined}
        />
        <ServiceItem
          label="Returns"
          value="30-Day Guarantee"
          sub="Hassle-free policy"
        />
        <ServiceItem
          label="Secure Checkout"
          value="Encrypted Payment"
          sub="Stripe • Cash on Delivery"
        />
        <ServiceItem
          label="Authenticity"
          value="100% Verified"
          sub="Direct from the store"
        />

      </div>
    </StoreFrontContainer>
  );
}

function ServiceItem({ label, value, sub }: { label: string, value: string, sub?: string }) {
  return (
    <div className="p-8 flex flex-col justify-center hover:bg-foreground/10 transition-colors group cursor-default border-b border-zinc-200">
      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 group-hover:text-foreground">
        {label}
      </span>
      <span className="text-lg text-foreground font-bold uppercase tracking-tight">
        {value}
      </span>
      {sub && (
        <span className="text-sm text-foreground mt-1 font-medium">
          {sub}
        </span>
      )}
    </div>
  )
}
