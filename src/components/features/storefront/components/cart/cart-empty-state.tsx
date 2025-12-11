'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoreData } from '@/lib/domains/stores/types';
import StoreFrontPageWrapper from '../../shared/layout/page-wrapper';

interface CartEmptyStateProps {
  store: StoreData;
  continueShoppingHref: string;
}

export default function CartEmptyState({ store, continueShoppingHref }: CartEmptyStateProps) {
  return (
    <StoreFrontPageWrapper store={store} cartItemCount={0}>
      <div className="min-h-[70vh] flex flex-col items-center justify-center border-b border-border">
        <div className="text-center space-y-6 max-w-lg px-6">
          <h1 className="text-9xl font-black text-muted-foreground/10 select-none">
            NULL
          </h1>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold uppercase tracking-tight">
              Cart is Empty
            </h2>
            <p className="text-muted-foreground font-mono text-sm">
              NO ITEMS DETECTED IN CURRENT SESSION.
            </p>
          </div>
          <Link href={continueShoppingHref}>
            <Button
              size="lg"
              className="mt-4 rounded-none h-12 px-8 uppercase font-bold tracking-widest border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-all"
            >
              Access Index <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </StoreFrontPageWrapper>
  );
}
