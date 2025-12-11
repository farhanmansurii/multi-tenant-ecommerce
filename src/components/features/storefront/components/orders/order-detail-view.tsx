'use client';

import { StoreData } from '@/lib/domains/stores/types';
import StoreFrontContainer from '../../shared/layout/container';

interface OrderDetailViewProps {
  store: StoreData;
  orderId: string;
}

export default function OrderDetailView({ store, orderId }: OrderDetailViewProps) {
  return (
    <StoreFrontContainer className="py-20">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Order Details</h1>
        <p className="text-muted-foreground font-mono uppercase">
          [ Order #{orderId} Data Unavailable ]
        </p>
        <div className="p-4 border border-dashed border-border bg-muted/5 mt-8 max-w-md">
          <p className="text-xs font-mono text-muted-foreground">
            TODO: Implement order status and details view.
            <br />
            - Order Summary
            <br />
            - Shipping Status
            <br />
            - Invoice Download
          </p>
        </div>
      </div>
    </StoreFrontContainer>
  );
}
