'use client';

import Link from 'next/link';
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils/price';
import { useState } from 'react';

interface CartSummaryProps {
  subtotal: number;
  currency: string;
  storeSlug: string;
  isAuthenticatedForStore: boolean;
  accountHref: string;
}

export default function CartSummary({
  subtotal,
  currency,
  storeSlug,
  isAuthenticatedForStore,
  accountHref,
}: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState('');
  const displayPrice = (amount: number) => formatPrice(amount, currency);

  return (
    <div className="sticky top-24 bg-muted/5 border border-border p-6 md:p-8">
      <h2 className="text-xl font-black uppercase tracking-tight mb-8">
        Summary
      </h2>

      <div className="space-y-4 font-mono text-sm uppercase">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="text-foreground">{displayPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>Calculated Next</span>
        </div>

        <Separator className="bg-border" />

        <div className="space-y-2">
          <span className="text-[10px] text-muted-foreground tracking-widest">
            Promo Code
          </span>
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="rounded-none border-border bg-background h-10 font-mono text-xs uppercase placeholder:text-muted-foreground/50"
              placeholder="CODE"
            />
            <Button
              variant="outline"
              className="rounded-none h-10 border-border uppercase font-bold text-xs"
            >
              Apply
            </Button>
          </div>
        </div>

        <Separator className="bg-black dark:bg-white h-[2px]" />

        <div className="flex justify-between items-baseline text-lg font-bold">
          <span>Total</span>
          <span>{displayPrice(subtotal)}</span>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <Button
          size="lg"
          className="w-full h-14 rounded-none uppercase font-black tracking-widest text-sm bg-foreground text-background hover:bg-background hover:text-foreground border-2 border-foreground transition-all"
          disabled={!isAuthenticatedForStore}
          onClick={() =>
            (window.location.href = `/stores/${storeSlug}/checkout`)
          }
        >
          Checkout <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        {!isAuthenticatedForStore && (
          <div className="p-4 border border-yellow-600/30 bg-yellow-600/5 text-yellow-600 dark:text-yellow-500">
            <div className="flex gap-2 items-start">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide">
                  Authentication Required
                </p>
                <Link href={accountHref} className="block">
                  <span className="text-xs border-b border-yellow-600/50 hover:border-yellow-600 transition-colors cursor-pointer">
                    Sign in to proceed &rarr;
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-border flex flex-col gap-2 text-[10px] uppercase font-mono text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" />
          <span>Encrypted Transaction</span>
        </div>
        <p>All sales are final unless stated otherwise.</p>
      </div>
    </div>
  );
}
