'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { createStoreSettingsSlice, StoreSettingsSlice } from './store-settings-slice';

const storage =
  typeof window === 'undefined'
    ? undefined
    : createJSONStorage<{
        storeSettings: any;
      }>(() => window.localStorage);

export const useStoreSettings = create<StoreSettingsSlice>()(
  persist(
    (set, get, api) => ({
      ...createStoreSettingsSlice(set, get, api),
    }),
    {
      name: 'store-settings',
      storage,
      partialize: (state) => ({
        storeSettings: state.storeSettings,
      }),
    }
  )
);
