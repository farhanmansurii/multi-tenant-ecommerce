/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { ArrowRight, Heart, LayoutDashboard, LogOut, MapPin, Package, Plus, ShieldAlert, Store, Trash2, User, ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import StoreFrontContainer from '@/components/features/storefront/storefront-reusables/container';
import { StoreFrontHeader } from '@/components/features/storefront/storefront-reusables/navbar';
import StoreFrontFooter from '@/components/features/storefront/storefront-reusables/footer';

import { useStorefrontCustomer } from '@/hooks/use-storefront-customer';
import { formatPrice } from '@/lib/utils/price';
import type { StorefrontAddress } from '@/lib/state/storefront/types';
import { StoreData } from '@/lib/domains/stores';
import { useSessionContext } from '@/lib/session';
import { signOut } from '@/lib/auth/client';
import { ModeToggle } from '@/components/shared/common/theme-toggle';

interface StorefrontAccountViewProps {
  store: StoreData;
}

interface AddressFormState {
  id?: string;
  label: string;
  recipient: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

const emptyAddressForm: AddressFormState = {
  label: 'Home',
  recipient: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  isDefault: false,
};

const toAddressPayload = (storeSlug: string, form: AddressFormState): StorefrontAddress => ({
  id: form.id ?? nanoid(),
  storeSlug,
  label: form.label,
  recipient: form.recipient,
  line1: form.line1,
  line2: form.line2 ?? null,
  city: form.city,
  state: form.state,
  postalCode: form.postalCode,
  country: form.country,
  isDefault: form.isDefault,
});

export default function StorefrontAccountView({ store }: StorefrontAccountViewProps) {
  const router = useRouter();
  const { user, isPending, isAuthenticated } = useSessionContext();
  const {
    customerProfile,
    authRole,
    syncCustomerSession,
    clearCustomerData,
    removeWishlistItem,
    upsertAddress,
    removeAddress,
    recordOrder,
  } = useStorefrontCustomer();
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);

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
      clearCustomerData();
    }
  }, [clearCustomerData, isPending, isStoreOwner, store.slug, syncCustomerSession, user]);

  // Fetch orders from database on mount
  useEffect(() => {
    if (!user?.id || !store.slug || !customerProfile) return;

    const fetchOrders = async () => {
      try {
        // Use userId to fetch orders (API will lookup customer by userId)
        const res = await fetch(`/api/stores/${store.slug}/orders?userId=${user.id}`);
        if (!res.ok) return;

        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          // Hydrate orders into state
          data.orders.forEach((order: {
            id: string;
            orderNumber: number;
            status: string;
            amounts: { total: number };
            currency: string;
            items?: { length: number }[] | number;
            createdAt: string;
          }) => {
            // Check if order already exists
            const exists = customerProfile.orders.some((o) => o.id === order.id);
            if (!exists) {
              recordOrder({
                id: order.id,
                orderNumber: `#${order.orderNumber}`,
                storeSlug: store.slug,
                status: order.status as 'processing' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled',
                totalAmount: order.amounts?.total || 0,
                currency: order.currency || store.currency,
                items: Array.isArray(order.items) ? order.items.length : 1,
                placedAt: order.createdAt,
              });
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchOrders();
  }, [user?.id, store.slug, store.currency, recordOrder, customerProfile]);

  const hasWishlistItems = customerProfile?.wishlist.length;
  const hasAddresses = customerProfile?.savedAddresses.length;
  const hasOrders = customerProfile?.orders.length;

  const accountHeading = useMemo(() => {
    if (customerProfile?.name) return customerProfile.name;
    if (user?.name) return String(user.name);
    return 'Your account';
  }, [customerProfile?.name, user?.name]);

  const handleSignOut = async () => {
    await signOut();
    clearCustomerData();
    router.push(`/stores/${store.slug}`);
  };

  const handleOpenNewAddress = () => {
    setAddressForm(emptyAddressForm);
    setAddressDialogOpen(true);
  };

  const handleSubmitAddress = () => {
    if (!customerProfile) return;
    if (
      !addressForm.recipient ||
      !addressForm.line1 ||
      !addressForm.city ||
      !addressForm.postalCode
    ) {
      return;
    }

    upsertAddress(toAddressPayload(store.slug, addressForm));
    setAddressDialogOpen(false);
  };

  const handleAddSampleOrder = () => {
    if (!customerProfile) return;
    recordOrder({
      id: nanoid(),
      orderNumber: `#${Math.floor(Math.random() * 90000 + 10000)}`,
      storeSlug: store.slug,
      status: 'processing',
      totalAmount: Math.random() * 500 + 50,
      currency: store.currency,
      items: Math.floor(Math.random() * 3) + 1,
      placedAt: new Date().toISOString(),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <StoreFrontHeader storeData={store} />
        <StoreFrontContainer className="py-24">
          <Card className="mx-auto max-w-2xl border border-dashed border-border/60">
            <CardHeader>
              <CardTitle className="text-2xl">
                Sign in to manage your account
              </CardTitle>
              <CardDescription>
                Access your wishlist, saved addresses, and order history once you
                sign in with Google.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full">
                <Link href={`/stores/${store.slug}/login`}>
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

  if (isStoreOwner || (authRole && authRole !== 'storefront_customer')) {
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
              Customer checkout flows are disabled for admin accounts to prevent data conflicts.
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

  return (
    <div className="min-h-screen bg-background">
      <StoreFrontHeader storeData={store} />
      <StoreFrontContainer className="py-16 space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{accountHeading}</h1>
            <p className="text-muted-foreground">
              Manage your customer profile for{' '}
              <span className="font-medium">{store.name}</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href={`/stores/${store.slug}`}>Return to storefront</Link>
            </Button>
            <Button variant="ghost" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="wishlist" className="space-y-6">
          <TabsList>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" /> Wishlist
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Addresses
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Wishlist</CardTitle>
                <CardDescription>
                  Keep track of items you love. Add products to your wishlist from
                  the storefront.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!hasWishlistItems ? (
                  <div className="rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
                    No items yet. Explore the catalog and tap the heart icon to
                    save products for later.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerProfile?.wishlist.map((item) => (
                      <div
                        key={item.productId}
                        className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                No image
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Added{' '}
                              {new Date(
                                item.addedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-4">
                          <span className="font-semibold">
                            {formatPrice(item.price, store.currency)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeWishlistItem(item.productSlug)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button asChild>
                            <Link
                              href={`/stores/${store.slug}/products/${item.productSlug}`}
                            >
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Saved addresses</h2>
                <p className="text-sm text-muted-foreground">
                  Store delivery locations for faster checkout.
                </p>
              </div>
              <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleOpenNewAddress}
                  >
                    <Plus className="h-4 w-4" /> Add address
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {addressForm.id ? 'Edit address' : 'Add new address'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <Input
                      placeholder="Label (e.g. Home, Office)"
                      value={addressForm.label}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          label: event.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Recipient"
                      value={addressForm.recipient}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          recipient: event.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Address line 1"
                      value={addressForm.line1}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          line1: event.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Address line 2"
                      value={addressForm.line2}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          line2: event.target.value,
                        }))
                      }
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(event) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            city: event.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(event) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            state: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="Postal code"
                        value={addressForm.postalCode}
                        onChange={(event) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            postalCode: event.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Country"
                        value={addressForm.country}
                        onChange={(event) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            country: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(event) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            isDefault: event.target.checked,
                          }))
                        }
                      />
                      Set as default shipping address
                    </label>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAddressDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitAddress}>Save address</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {!hasAddresses ? (
              <Card className="border border-dashed border-border/60">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No addresses saved yet. Add your first address to speed up
                  checkout.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {customerProfile?.savedAddresses.map((address) => (
                  <Card key={address.id} className="relative">
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{address.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.recipient}
                          </p>
                        </div>
                        {address.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">
                        {[
                          address.line1,
                          address.line2,
                          address.city,
                          address.state,
                          address.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{address.country}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAddress(address.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Orders</h2>
                <p className="text-sm text-muted-foreground">
                  Track the status of your storefront purchases.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleAddSampleOrder}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Add sample order
              </Button>
            </div>

            {!hasOrders ? (
              <Card className="border border-dashed border-border/60">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  You don&apos;t have any orders yet. Complete a purchase to see
                  it listed here.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {customerProfile?.orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Order {order.orderNumber}
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {formatPrice(order.totalAmount, order.currency)}{' '}
                          • {order.items} item
                          {order.items > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Placed on{' '}
                          {new Date(order.placedAt).toLocaleDateString()}{' '}
                          • Status:{' '}
                          <span className="font-medium capitalize">
                            {order.status}
                          </span>
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link
                          href={`/stores/${store.slug}/orders/${order.id}`}
                        >
                          View details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </StoreFrontContainer>
      <StoreFrontFooter store={store} />
    </div>
  );
}
