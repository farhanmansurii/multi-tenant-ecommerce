"use client";

import { ReactNode, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchStore } from "@/lib/domains/stores/service";

interface StoreDataProviderProps {
  children: ReactNode;
  initialStore?: { id: string; name: string; slug: string; ownerUserId: string; currency?: string } | null;
}

export function StoreDataProvider({ children, initialStore }: StoreDataProviderProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialStore) {
      // Pre-populate React Query cache with store data
      queryClient.setQueryData(
        ["store", initialStore.slug],
        initialStore,
        {
          updatedAt: Date.now(),
        }
      );
    }
  }, [initialStore, queryClient]);

  return <>{children}</>;
}
