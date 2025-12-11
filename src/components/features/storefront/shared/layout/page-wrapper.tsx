'use client';

import React, { ReactNode } from 'react';
import { StoreData } from '@/lib/domains/stores/types';
import { StoreFrontHeader } from './navbar';
import { cn } from '@/lib/utils';

interface StoreFrontPageWrapperProps {
  store: StoreData;
  children: ReactNode;
  cartItemCount?: number;
  className?: string;
  hideFooter?: boolean;
  hideHeader?: boolean;
}

export default function StoreFrontPageWrapper({
  store,
  children,
  cartItemCount,
  className,
  hideFooter = false,
  hideHeader = false,
}: StoreFrontPageWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased selection:bg-primary/10 selection:text-primary">
      {!hideHeader && (
        <StoreFrontHeader storeData={store} cartItemCount={cartItemCount} />
      )}

      <main className={cn(
        "flex-1 w-full",
        // Add top padding to account for fixed header (approx 80px/5rem)
        // Use pt-20 (5rem) or pt-24 (6rem) for safe clearance
        !hideHeader && "pt-24",
        className
      )}>
        {children}
      </main>

    </div>
  );
}
