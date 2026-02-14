import React from "react";
import './storefront.scoped.css';
import { Koulen, DM_Mono, Host_Grotesk } from 'next/font/google';

import { fetchStore } from '@/lib/domains/stores/service';
import StorefrontShell from './storefront-shell';
import { toStorefrontThemeConfig } from '@/components/storefront-ui/storefront/theme-config';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const koulen = Koulen({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-koulen',
});

const hostGrotesk = Host_Grotesk({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-host-grotesk',
});

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
});

export default async function layout({ children, params }: Props) {
  const { slug } = await params;
  const store = await fetchStore(slug).catch(() => null);

  return (
    <div
      className={[
        'overflow-hidden',
        'storefront-ui',
        koulen.variable,
        hostGrotesk.variable,
        dmMono.variable,
      ].join(' ')}
    >
      <div
        className="storefront-scope"
        style={store ? ({ ['--storefront-accent' as any]: store.primaryColor } as any) : undefined}
      >
        {store ? (
          <StorefrontShell
            slug={slug}
            config={toStorefrontThemeConfig(store)}
            initialOverrides={((store.settings || {}) as any).storefrontContent || {}}
          >
            {children}
          </StorefrontShell>
        ) : (
          <div className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
            <h3>Store not found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
