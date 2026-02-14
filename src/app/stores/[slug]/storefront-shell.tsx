'use client';

import { useEffect } from 'react';

import TransitionProvider from '@/components/storefront-ui/providers/TransitionProvider';
import ClientLayout from '@/components/storefront-ui/client-layout';
import Menu from '@/components/storefront-ui/Menu/Menu';
import Footer from '@/components/storefront-ui/Footer/Footer';
import ShoppingCart from '@/components/storefront-ui/ShoppingCart/ShoppingCart';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { ThemeConfigProvider } from '@/components/storefront-ui/storefront/ThemeConfigProvider';
import type { StorefrontThemeConfig } from '@/components/storefront-ui/storefront/theme-config';
import { StorefrontEditProvider } from '@/components/storefront-ui/edit/StorefrontEditProvider';

export default function StorefrontShell({
  slug,
  config,
  initialOverrides,
  children,
}: {
  slug: string;
  config: StorefrontThemeConfig;
  initialOverrides: Record<string, any>;
  children: React.ReactNode;
}) {
  const setStoreSlug = useStorefrontStore((s) => s.setStoreSlug);
  const syncCart = useStorefrontStore((s) => s.syncCart);

  useEffect(() => {
    setStoreSlug(slug);
    syncCart({ slug });
  }, [setStoreSlug, slug, syncCart]);

  return (
    <StorefrontEditProvider slug={slug} initialOverrides={initialOverrides}>
      <ThemeConfigProvider value={config}>
        <TransitionProvider>
          <ClientLayout footer={<Footer />}>
            <Menu />
            {children}
          </ClientLayout>
          <ShoppingCart />
        </TransitionProvider>
      </ThemeConfigProvider>
    </StorefrontEditProvider>
  );
}
