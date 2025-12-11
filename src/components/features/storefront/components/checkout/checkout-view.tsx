'use client';

import { StoreData } from '@/lib/domains/stores/types';
import StoreFrontContainer from '../../shared/layout/container';

interface CheckoutViewProps {
  store: StoreData;
}

export default function CheckoutView({ store }: CheckoutViewProps) {
  return (
    <StoreFrontContainer className="py-20">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Checkout</h1>
        <p className="text-muted-foreground font-mono uppercase">
          [ System Under Maintenance ]
        </p>
        <div className="p-4 border border-dashed border-border bg-muted/5 mt-8 max-w-md">
          <p className="text-xs font-mono text-muted-foreground">
            TODO: Implement checkout flow integration with payment gateway.
            <br />
            - Address Collection
            <br />
            - Shipping Method Selection
            <br />
            - Payment Processing
          </p>
        </div>
      </div>
    </StoreFrontContainer>
  );
}
