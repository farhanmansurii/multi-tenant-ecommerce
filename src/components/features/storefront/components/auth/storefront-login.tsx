'use client';

import { StoreData } from '@/lib/domains/stores/types';
import StoreFrontContainer from '../../shared/layout/container';

interface StorefrontLoginViewProps {
  store: StoreData;
}

export default function StorefrontLoginView({ store }: StorefrontLoginViewProps) {
  return (
    <StoreFrontContainer className="py-20">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Authentication</h1>
        <p className="text-muted-foreground font-mono uppercase">
          [ Login System Offline ]
        </p>
        <div className="p-4 border border-dashed border-border bg-muted/5 mt-8 max-w-md">
          <p className="text-xs font-mono text-muted-foreground">
            TODO: Implement customer authentication.
            <br />
            - Email/Password Login
            <br />
            - Registration
            <br />
            - Password Recovery
          </p>
        </div>
      </div>
    </StoreFrontContainer>
  );
}
