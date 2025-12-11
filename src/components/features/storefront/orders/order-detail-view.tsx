'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Package, Store, ShieldAlert, User, LayoutDashboard, LogOut, ChevronLeft } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import StoreFrontContainer from '@/components/features/storefront/storefront-reusables/container';
import { StoreFrontHeader } from '@/components/features/storefront/storefront-reusables/navbar';
import StoreFrontFooter from '@/components/features/storefront/storefront-reusables/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { useStorefrontCustomer } from '@/hooks/use-storefront-customer';
import { formatPrice } from '@/lib/utils/price';
import { StoreData } from '@/lib/domains/stores';
import { useSessionContext } from '@/lib/session';
import { signOut } from '@/lib/auth/client';
import { ModeToggle } from '@/components/shared/common/theme-toggle';

export default function OrderDetailView({ store }: { store: StoreData }) {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const { customerProfile, syncCustomerSession, clearCustomerData } = useStorefrontCustomer();
  const { user, isPending, isAuthenticated } = useSessionContext();

  const isStoreOwner = useMemo(() => {
    if (!user?.id) return false;
    return String(user.id) === store.ownerUserId;
  }, [store.ownerUserId, user?.id]);

  useEffect(() => {
    if (isPending) return;

    if (user && user.id && !isStoreOwner) {
      syncCustomerSession({
        storeSlug: store.slug,
        user: {
          id: String(user.id),
          name: (user.name as string | undefined) ?? null,
          email: (user.email as string | undefined) ?? null,
          image: (user.image as string | undefined) ?? null,
        },
      });
    } else {
      // clearCustomerData();
    }
  }, [isPending, isStoreOwner, store.slug, syncCustomerSession, user]);

  const handleSignOut = async () => {
    await signOut();
    clearCustomerData();
    router.push(`/stores/${store.slug}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StoreFrontHeader storeData={store} />
        <StoreFrontContainer className="py-24 flex-1">
          <Card className="mx-auto max-w-2xl border border-dashed border-border/60">
            <CardHeader>
              <CardTitle className="text-2xl">
                Sign in to view order
              </CardTitle>
              <CardDescription>
                Please sign in to view the details of this order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full">
                <Link href={`/stores/${store.slug}/login?redirect=/stores/${store.slug}/orders/${orderId}`}>
                  Sign in with Google
                </Link>
              </Button>
            </CardContent>
          </Card>
        </StoreFrontContainer>
        <StoreFrontFooter store={store} />
      </div>
    );
  }

  if (isStoreOwner) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background font-sans selection:bg-indigo-500/10">

        {/* 1. Background Texture (Full Screen) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]"></div>
        </div>

        {/* 2. Top Bar (Minimal) */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
          {/* Store Name / Logo */}
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center">
              <Store className="h-4 w-4" />
            </div>
            {store.name}
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>

        {/* 3. Main Centered Content */}
        <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in-95 duration-700">

          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/60 backdrop-blur-2xl shadow-2xl shadow-black/10 p-8 md:p-10 text-center">

            {/* Decorative Background Icon */}
            <ShieldAlert className="absolute -top-10 -right-10 h-48 w-48 text-indigo-500/5 rotate-12 pointer-events-none" />

            {/* Avatar Stack */}
            <div className="relative mx-auto mb-8 h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 animate-pulse"></div>
              <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center border border-border shadow-sm z-10">
                <User className="h-8 w-8 text-foreground" />
              </div>
              {/* Badge */}
              <div className="absolute -bottom-1 -right-1 z-20 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-background shadow-sm">
                ADMIN
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">
              Admin Access Detected
            </h1>

            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              You are currently logged in as the owner. <br />
              Order details are disabled for admin accounts to prevent data conflicts.
            </p>

            <div className="space-y-3">
              <Button
                asChild
                size="lg"
                className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Link href={`/dashboard/stores/${store.slug}`}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Return to Dashboard
                </Link>
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/40"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background/50 backdrop-blur-sm px-2 text-muted-foreground">or</span></div>
              </div>

              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full h-12 rounded-xl border-border/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 transition-all"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out & Continue Shopping
              </Button>
            </div>

          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center">
              <ChevronLeft className="mr-1 h-3 w-3" /> Back to Home
            </Link>
          </div>

        </div>

      </div>
    );
  }

  const order = customerProfile?.orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreFrontHeader storeData={store} />
        <StoreFrontContainer className="py-24 flex-1">
          <div className="mx-auto flex max-w-md flex-col items-center space-y-6 text-center">
            <Package className="h-16 w-16 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Order not found</h1>
            <p className="text-muted-foreground">
              This order doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Button asChild>
              <Link href={`/stores/${store.slug}/account`}>Back to account</Link>
            </Button>
          </div>
        </StoreFrontContainer>
        <StoreFrontFooter store={store} />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    processing: 'bg-yellow-500/10 text-yellow-600',
    fulfilled: 'bg-blue-500/10 text-blue-600',
    shipped: 'bg-purple-500/10 text-purple-600',
    delivered: 'bg-green-500/10 text-green-600',
    cancelled: 'bg-red-500/10 text-red-600',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StoreFrontHeader storeData={store} />
      <StoreFrontContainer className="py-8 flex-1">
        <div className="mb-6">
          <Link
            href={`/stores/${store.slug}/account?tab=orders`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order {order.orderNumber}</CardTitle>
                  <Badge className={statusColors[order.status] || ''}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Placed on</span>
                    <span>{new Date(order.placedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span>{order.items} item{order.items > 1 ? 's' : ''}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.totalAmount, order.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <div className="flex-1 w-px bg-border" />
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">Order placed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.placedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {order.status !== 'processing' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{order.status}</p>
                        <p className="text-sm text-muted-foreground">Status updated</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Need help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  If you have any questions about your order, please contact the store.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/stores/${store.slug}`}>Visit store</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </StoreFrontContainer>
      <StoreFrontFooter store={store} />
    </div>
  );
}
