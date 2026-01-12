"use client";

import { ReactNode, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchStore } from "@/lib/domains/stores/service";
import { useStoreSettings } from "@/lib/state/store-settings/store-settings-store";

interface StoreDataProviderProps {
  children: ReactNode;
  initialStore?: any;
}

export function StoreDataProvider({ children, initialStore }: StoreDataProviderProps) {
  const queryClient = useQueryClient();
  const { setStoreSettings } = useStoreSettings();

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

      // Cache store settings in Zustand for global access
      setStoreSettings(initialStore);
    }
  }, [initialStore, queryClient, setStoreSettings]);

  return <>{children}</>;
}
