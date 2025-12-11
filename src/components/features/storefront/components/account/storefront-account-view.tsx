'use client';

import { StoreData } from '@/lib/domains/stores/types';
import StoreFrontContainer from '../../shared/layout/container';

interface StorefrontAccountViewProps {
  store: StoreData;
}

export default function StorefrontAccountView({ store }: StorefrontAccountViewProps) {
  return (
    <StoreFrontContainer className="py-20">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Account</h1>
        <p className="text-muted-foreground font-mono uppercase">
          [ User Profile Inactive ]
        </p>
        <div className="p-4 border border-dashed border-border bg-muted/5 mt-8 max-w-md">
          <p className="text-xs font-mono text-muted-foreground">
            TODO: Implement customer account management.
            <br />
            - Order History
            <br />
            - Address Book
            <br />
            - Profile Settings
          </p>
        </div>
      </div>
    </StoreFrontContainer>
  );
}
