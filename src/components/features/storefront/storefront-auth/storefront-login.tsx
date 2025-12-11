'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StoreFrontContainer from '@/components/features/storefront/storefront-reusables/container';
import { StoreFrontHeader } from '@/components/features/storefront/storefront-reusables/navbar';
import StoreFrontFooter from '@/components/features/storefront/storefront-reusables/footer';

import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';

import { useStorefrontCustomer } from '@/hooks/use-storefront-customer';
import { useSessionContext } from '@/lib/session';
import { StoreData } from '@/lib/domains/stores';
import { signIn } from '@/lib/auth/client';

interface StorefrontLoginProps {
  store: StoreData;
}

export default function StorefrontLogin({ store }: StorefrontLoginProps) {
  const setStoreSlug = useStorefrontStore((state) => state.setStoreSlug);
  const { customerProfile, setAuthRole } = useStorefrontCustomer();
  const { user, isPending } = useSessionContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStoreSlug(store.slug);
  }, [setStoreSlug, store.slug]);

  const callbackURL = useMemo(() => `/stores/${store.slug}/account`, [store.slug]);
  const isStoreOwner = useMemo(() => {
    if (!user?.id) return false;
    return String(user.id) === store.ownerUserId;
  }, [store.ownerUserId, user?.id]);

  const isCustomerForStore = useMemo(() => {
    if (!customerProfile) return false;
    return customerProfile.storeSlug === store.slug;
  }, [customerProfile, store.slug]);

  useEffect(() => {
    if (isPending) return;
    if (isCustomerForStore) {
      router.replace(`/stores/${store.slug}/account`);
    }
  }, [isCustomerForStore, isPending, router, store.slug]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthRole('storefront_customer');
      await signIn.social({
        provider: 'google',
        callbackURL,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreFrontHeader storeData={store} />
      <StoreFrontContainer className="py-24">
        <div className="mx-auto max-w-3xl">
          <Card className="border border-border/60 shadow-lg">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-semibold">
                Sign in to {store.name}
              </CardTitle>
              <CardDescription className="text-base">
                {isStoreOwner
                  ? `You are signed in as the owner of ${store.name}. Customer accounts use separate Google sign-ins.`
                  : 'Use your Google account to sign in as a customer of this storefront. You’ll have access to your wishlist, saved addresses, and orders for this store only.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleGoogleSignIn}
                disabled={loading || isStoreOwner}
              >
                <LogIn className="h-5 w-5" />
                {isStoreOwner
                  ? 'Store owners cannot sign in as customers'
                  : loading
                    ? 'Redirecting…'
                    : 'Continue with Google'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Prefer to keep browsing?{' '}
                <Link
                  className="font-medium hover:underline"
                  href={`/stores/${store.slug}`}
                >
                  Continue without signing in
                </Link>
              </p>
              <div className="rounded-lg border border-dashed border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Tenant-scoped access</p>
                <p className="mt-1">
                  Customers who sign in from this storefront are automatically
                  scoped to the
                  <span className="font-semibold"> {store.name}</span> tenant.
                  Wishlist items, saved addresses, and orders are stored per store
                  and won&apos;t affect other storefronts.
                </p>
                {isStoreOwner && (
                  <p className="mt-2 text-orange-500">
                    Use a separate customer Google account or sign out of your
                    owner session to access customer features.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </StoreFrontContainer>
      <StoreFrontFooter store={store} />
    </div>
  );
}
