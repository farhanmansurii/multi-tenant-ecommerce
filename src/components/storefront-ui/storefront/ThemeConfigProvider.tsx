'use client';

import React, { createContext, useContext } from 'react';

import type { StorefrontThemeConfig } from './theme-config';

const StorefrontConfigContext = createContext<StorefrontThemeConfig | null>(null);

export function ThemeConfigProvider({
  value,
  children,
}: {
  value: StorefrontThemeConfig;
  children: React.ReactNode;
}) {
  return <StorefrontConfigContext.Provider value={value}>{children}</StorefrontConfigContext.Provider>;
}

export function useThemeConfig() {
  const ctx = useContext(StorefrontConfigContext);
  if (!ctx) {
    throw new Error('useThemeConfig must be used within ThemeConfigProvider');
  }
  return ctx;
}
