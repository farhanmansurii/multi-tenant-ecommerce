'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, MapPin, Plus, Check, CreditCard, Banknote, Truck, ShieldCheck, Store, ShieldAlert, User, LayoutDashboard, LogOut, ChevronLeft } from 'lucide-react';

import StoreFrontContainer from '../storefront-reusables/container';
import { StoreFrontHeader } from '../storefront-reusables/navbar';
import StoreFrontFooter from '../storefront-reusables/footer';

import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { useStorefrontCustomer } from '@/hooks/use-storefront-customer';
import { formatPrice } from '@/lib/utils/price';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { StoreData } from '@/lib/domains/stores/types';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormFieldHook } from '@/components/ui/form-field';
import { useSessionContext } from '@/lib/session';
import { signOut } from '@/lib/auth/client';
import { ModeToggle } from '@/components/shared/common/theme-toggle';

const addressSchema = z.object({
  recipient: z.string().min(1, "Recipient name is required"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
});

const baseSchema = z.object({
  shippingAddress: addressSchema,
  sameAsBilling: z.boolean(),
  saveAddress: z.boolean(),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  discountCode: z.string().optional(),
});

const checkoutFormSchema = z.discriminatedUnion("sameAsBilling", [
  baseSchema.extend({
    sameAsBilling: z.literal(true),
    billingAddress: z.any().optional(),
  }),
  baseSchema.extend({
    sameAsBilling: z.literal(false),
    billingAddress: addressSchema,
  }),
]);

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

type CheckoutViewProps = {
  store: StoreData;
};

const initialAddress = {
  recipient: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  phone: '',
};

export default function CheckoutView({ store }: CheckoutViewProps) {
  const router = useRouter();
  const { cart, clearCart } = useStorefrontStore((state) => ({
    cart: state.cart,
    clearCart: state.clearCart,
  }));
  const { customerProfile, recordOrder, upsertAddress, clearCustomerData, syncCustomerSession } = useStorefrontCustomer();
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
      // If not logged in or is store owner, clear customer data to prevent conflicts
      // clearCustomerData();
      // Actually, for checkout, we might want to keep guest data until they sign in?
      // But the requirement is to force sign in.
    }
  }, [isPending, isStoreOwner, store.slug, syncCustomerSession, user]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);


  // Discount state
  const [discountInput, setDiscountInput] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isVerifyingDiscount, setIsVerifyingDiscount] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: initialAddress,
      billingAddress: initialAddress,
      sameAsBilling: true,
      saveAddress: true,
      paymentMethod: '',
      discountCode: '',
    },
  });

  const { setValue, watch, handleSubmit, control } = form;
  const sameAsBilling = watch('sameAsBilling');
  const paymentMethod = watch('paymentMethod');

  // Initialize payment method
  useEffect(() => {
    if (store.paymentMethods && store.paymentMethods.length > 0) {
      setValue('paymentMethod', store.paymentMethods[0]);
    } else if (store.codEnabled) {
      setValue('paymentMethod', 'cod');
    }
  }, [store, setValue]);

  // Autofill from default saved address
  useEffect(() => {
    if (customerProfile?.savedAddresses.length) {
      const defaultAddr = customerProfile.savedAddresses.find((a) => a.isDefault) || customerProfile.savedAddresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setValue('shippingAddress', {
          recipient: defaultAddr.recipient,
          line1: defaultAddr.line1,
          line2: defaultAddr.line2 || '',
          city: defaultAddr.city,
          state: defaultAddr.state,
          postalCode: defaultAddr.postalCode,
          country: defaultAddr.country,
          phone: '',
        });
      }
    }
  }, [customerProfile?.savedAddresses, setValue]);

  const handleSelectAddress = (addressId: string) => {
    const addr = customerProfile?.savedAddresses.find((a) => a.id === addressId);
    if (addr) {
      setSelectedAddressId(addressId);
      setValue('shippingAddress', {
        recipient: addr.recipient,
        line1: addr.line1,
        line2: addr.line2 || '',
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        phone: '',
      });
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) return;
    setIsVerifyingDiscount(true);
    try {
      const res = await fetch(`/api/stores/${store.slug}/checkout/verify-discount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountInput,
          cartTotal: cart.subtotal
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid discount code");

      setDiscountCode(data.code);
      setDiscountAmount(data.amount);
      setValue('discountCode', data.code); // Sync with form
      toast.success(`Discount applied: ${data.code}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply discount");
      setDiscountCode("");
      setDiscountAmount(0);
      setValue('discountCode', "");
    } finally {
      setIsVerifyingDiscount(false);
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsProcessing(true);

    try {
      let customerId = customerProfile?.id;

      const customerCheckResponse = await fetch(`/api/stores/${store.slug}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerProfile?.email,
          userId: customerProfile?.id,
          data: {
            name: customerProfile?.name || data.shippingAddress.recipient,
            phone: data.shippingAddress.phone,
          },
        }),
      });

      if (customerCheckResponse.ok) {
        const customerData = await customerCheckResponse.json();
        customerId = customerData.customer?.id;
      } else if (customerCheckResponse.status === 409) {
        const customerData = await customerCheckResponse.json();
        customerId = customerData.customer?.id;
      }

      if (!customerId) {
        throw new Error('Failed to create or find customer account');
      }

      // Step 1: Sync cart to backend
      const cartResponse = await fetch(`/api/stores/${store.slug}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: cart.items[0].productId,
          qty: cart.items[0].quantity,
        }),
      });

      if (!cartResponse.ok) {
        const errorData = await cartResponse.json();
        throw new Error(errorData.error || 'Failed to sync cart');
      }

      const cartData = await cartResponse.json();

      for (let i = 1; i < cart.items.length; i++) {
        await fetch(`/api/stores/${store.slug}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: cart.items[i].productId,
            variantId: cart.items[i].variantId,
            qty: cart.items[i].quantity,
          }),
        });
      }

      const getCartResponse = await fetch(`/api/stores/${store.slug}/cart`);
      const getCartData = await getCartResponse.json();
      const cartId = getCartData.cart?.id || cartData.cartId;

      if (!cartId) {
        throw new Error('Failed to get cart ID');
      }

      // Step 2: Initiate checkout
      const checkoutResponse = await fetch(`/api/stores/${store.slug}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          customerId,
          shippingAddress: {
            ...data.shippingAddress,
            line2: data.shippingAddress.line2 || undefined,
            phone: data.shippingAddress.phone || undefined,
          },
          billingAddress: data.sameAsBilling
            ? undefined
            : {
              ...data.billingAddress,
              line2: data.billingAddress?.line2 || undefined,
              phone: data.billingAddress?.phone || undefined,
            },
          discountCode: discountCode || undefined,
        }),
      });

      if (!checkoutResponse.ok) {
        const error = await checkoutResponse.json();
        throw new Error(error.error || 'Checkout failed');
      }

      const checkoutData = await checkoutResponse.json();

      // Step 3: Confirm checkout
      const confirmResponse = await fetch(`/api/stores/${store.slug}/checkout/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: checkoutData.session.orderId,
          paymentMethod: data.paymentMethod,
        }),
      });

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json();
        throw new Error(error.error || 'Payment failed');
      }

      const confirmData = await confirmResponse.json();

      // Save shipping address if requested
      if (data.saveAddress && !selectedAddressId) {
        upsertAddress({
          id: '',
          storeSlug: store.slug,
          label: 'Shipping',
          recipient: data.shippingAddress.recipient,
          line1: data.shippingAddress.line1,
          line2: data.shippingAddress.line2 || null,
          city: data.shippingAddress.city,
          state: data.shippingAddress.state,
          postalCode: data.shippingAddress.postalCode,
          country: data.shippingAddress.country,
          isDefault: !customerProfile?.savedAddresses.length,
        });
      }

      recordOrder({
        id: checkoutData.session.orderId,
        orderNumber: `#${checkoutData.session.orderNumber}`,
        storeSlug: store.slug,
        status: 'processing',
        totalAmount: total,
        currency: store.currency,
        items: cart.items.length,
        placedAt: new Date().toISOString(),
      });

      clearCart();
      toast.success(confirmData.message || 'Order placed successfully!');
      router.push(`/stores/${store.slug}/account?tab=orders`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    clearCustomerData();
    router.push(`/stores/${store.slug}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreFrontHeader storeData={store} cartItemCount={cart.totalQuantity} />
        <StoreFrontContainer className="py-24 flex-1">
          <div className="mx-auto flex max-w-md flex-col items-center space-y-6 text-center">
            <h1 className="text-3xl font-semibold">Sign in to checkout</h1>
            <p className="text-muted-foreground">
              You need to be signed in to complete your purchase.
            </p>
            <Button asChild>
              <Link href={`/stores/${store.slug}/login?redirect=/stores/${store.slug}/checkout`}>Sign in</Link>
            </Button>
          </div>
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
              Checkout is disabled for admin accounts to prevent data conflicts.
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



  if (!cart.items.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreFrontHeader storeData={store} cartItemCount={cart.totalQuantity} />
        <StoreFrontContainer className="py-24 flex-1">
          <div className="mx-auto flex max-w-md flex-col items-center space-y-6 text-center">
            <h1 className="text-3xl font-semibold">Your cart is empty</h1>
            <p className="text-muted-foreground">Add some products to checkout.</p>
            <Button asChild>
              <Link href={`/stores/${store.slug}`}>Continue shopping</Link>
            </Button>
          </div>
        </StoreFrontContainer>
        <StoreFrontFooter store={store} />
      </div>
    );
  }

  // Calculate totals
  const subtotal = cart.subtotal;
  const tax = Math.round(subtotal * 0.18);
  const shipping = 0;
  const total = Math.max(0, subtotal + tax + shipping - discountAmount);

  return (
    <div className="min-h-screen flex flex-col">
      <StoreFrontHeader storeData={store} cartItemCount={cart.totalQuantity} />
      <StoreFrontContainer className="py-8 flex-1">
        <div className="mb-6">
          <Link
            href={`/stores/${store.slug}/cart`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>
        </div>

        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left: Forms */}
            <div className="space-y-8">
              {/* Shipping Address */}
              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  Shipping Address
                </h2>

                {/* Saved Addresses Selector */}
                {customerProfile?.savedAddresses.length ? (
                  <div className="mb-6">
                    <Label className="text-sm text-muted-foreground mb-3 block">Select a saved address</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {customerProfile.savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr.id)}
                          className={cn(
                            "cursor-pointer rounded-lg border p-4 transition-all hover:border-primary/50 relative",
                            selectedAddressId === addr.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
                          )}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{addr.label || 'Address'}</span>
                            {selectedAddressId === addr.id && <Check className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-sm font-medium">{addr.recipient}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                        </div>
                      ))}
                      <div
                        onClick={() => {
                          setSelectedAddressId(null);
                          setValue('shippingAddress', initialAddress);
                        }}
                        className={cn(
                          "cursor-pointer rounded-lg border border-dashed p-4 transition-all hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:bg-muted/50",
                          selectedAddressId === null ? "border-primary bg-primary/5 ring-1 ring-primary text-primary" : ""
                        )}
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-sm font-medium">Add New Address</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className={cn("grid gap-4 sm:grid-cols-2 transition-all duration-300", selectedAddressId ? "opacity-50 pointer-events-none" : "opacity-100")}>
                  <div className="sm:col-span-2">
                    <FormFieldHook<CheckoutFormValues> form={form} name="shippingAddress.recipient" label="Full Name" required placeholder="John Doe" disabled={!!selectedAddressId} type="text" />
                  </div>
                  <div className="sm:col-span-2">
                    <FormFieldHook<CheckoutFormValues> form={form} name="shippingAddress.line1" label="Address Line 1" required placeholder="123 Main Street" disabled={!!selectedAddressId} type="text" />
                  </div>
                  <div className="sm:col-span-2">
                    <FormFieldHook<CheckoutFormValues> form={form} name="shippingAddress.line2" label="Address Line 2" placeholder="Apartment, suite, etc." disabled={!!selectedAddressId} type="text" />
                  </div>
                  <div>
                    <FormFieldHook<CheckoutFormValues> form={form} name="shippingAddress.city" label="City" required placeholder="Mumbai" disabled={!!selectedAddressId} type="text" />
                  </div>
                  <div>
                    <FormFieldHook<CheckoutFormValues> form={form} name="shippingAddress.state" label="State" required placeholder="Maharashtra" disabled={!!selectedAddressId} type="text" />
                  </div>
                  <div>
                    <FormFieldHook<CheckoutFormValues> form={form} name="shippingAddress.postalCode" label="Postal Code" required placeholder="400001" disabled={!!selectedAddressId} type="text" />
                  </div>
                  <div>
                    <FormFieldHook<CheckoutFormValues> form={form} name="shippingAddress.country" label="Country" required placeholder="India" disabled={!!selectedAddressId} type="text" />
                  </div>
                  <div className="sm:col-span-2">
                    <FormFieldHook<CheckoutFormValues> form={form} name="shippingAddress.phone" label="Phone" placeholder="+91 98765 43210" disabled={!!selectedAddressId} type="tel" />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <FormField
                    control={control}
                    name="sameAsBilling"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            Billing address is same as shipping
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!selectedAddressId && (
                    <FormField
                      control={control}
                      name="saveAddress"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-muted-foreground cursor-pointer">
                              Save this address for future orders
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Billing Address (if different) */}
              {!sameAsBilling && (
                <div className="rounded-lg border p-6">
                  <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    Billing Address
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <FormFieldHook<CheckoutFormValues> form={form} name="billingAddress.recipient" label="Full Name" required placeholder="John Doe" type="text" />
                    </div>
                    <div className="sm:col-span-2">
                      <FormFieldHook<CheckoutFormValues> form={form} name="billingAddress.line1" label="Address Line 1" required placeholder="123 Main Street" type="text" />
                    </div>
                    <div className="sm:col-span-2">
                      <FormFieldHook<CheckoutFormValues> form={form} name="billingAddress.line2" label="Address Line 2" placeholder="Apartment, suite, etc." type="text" />
                    </div>
                    <div>
                      <FormFieldHook<CheckoutFormValues> form={form} name="billingAddress.city" label="City" required placeholder="Mumbai" type="text" />
                    </div>
                    <div>
                      <FormFieldHook<CheckoutFormValues> form={form} name="billingAddress.state" label="State" required placeholder="Maharashtra" type="text" />
                    </div>
                    <div>
                      <FormFieldHook<CheckoutFormValues> form={form} name="billingAddress.postalCode" label="Postal Code" required placeholder="400001" type="text" />
                    </div>
                    <div>
                      <FormFieldHook<CheckoutFormValues> form={form} name="billingAddress.country" label="Country" required placeholder="India" type="text" />
                    </div>
                    <div className="sm:col-span-2">
                      <FormFieldHook<CheckoutFormValues> form={form} name="billingAddress.phone" label="Phone" placeholder="+91 98765 43210" type="tel" />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Payment Method
                </h2>

                <FormField
                  control={control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          className="grid gap-3 sm:grid-cols-3"
                        >
                          <div>
                            <RadioGroupItem value="cod" id="pm-cod" className="peer sr-only" />
                            <Label
                              htmlFor="pm-cod"
                              className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer h-full transition-all"
                            >
                              <Truck className="mb-2 h-6 w-6" />
                              <span className="font-medium">Cash on Delivery</span>
                            </Label>
                          </div>

                          {store.paymentMethods?.includes('card') && (
                            <div>
                              <RadioGroupItem value="card" id="pm-card" className="peer sr-only" />
                              <Label
                                htmlFor="pm-card"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer h-full transition-all"
                              >
                                <CreditCard className="mb-2 h-6 w-6" />
                                <span className="font-medium">Card</span>
                              </Label>
                            </div>
                          )}

                          {store.paymentMethods?.includes('upi') && (
                            <div>
                              <RadioGroupItem value="upi" id="pm-upi" className="peer sr-only" />
                              <Label
                                htmlFor="pm-upi"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer h-full transition-all"
                              >
                                <Banknote className="mb-2 h-6 w-6" />
                                <span className="font-medium">UPI</span>
                              </Label>
                            </div>
                          )}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                  {paymentMethod === 'cod' && 'Pay cash when your order is delivered to your doorstep.'}
                  {paymentMethod === 'card' && 'Securely pay with your credit or debit card.'}
                  {paymentMethod === 'upi' && 'Pay instantly using any UPI app.'}
                  {!paymentMethod && 'Select a payment method to proceed.'}
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="h-fit rounded-lg border p-6 sticky top-24">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="h-12 w-12 bg-muted rounded-md overflow-hidden relative shrink-0">
                      {item.image && <img src={item.image} className="object-cover w-full h-full" alt="" />}
                      <span className="absolute bottom-0 right-0 bg-black/50 text-white text-[10px] px-1 rounded-tl-md">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.variantId}</p>
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity, store.currency)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal, store.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18% GST)</span>
                  <span>{formatPrice(tax, store.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(shipping, store.currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountCode})</span>
                    <span>-{formatPrice(discountAmount, store.currency)}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Discount Input */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Discount code"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  disabled={discountAmount > 0}
                />
                {discountAmount > 0 ? (
                  <Button type="button" variant="outline" onClick={() => {
                    setDiscountAmount(0);
                    setDiscountCode("");
                    setDiscountInput("");
                    setValue('discountCode', "");
                  }}>
                    Remove
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" onClick={handleApplyDiscount} disabled={!discountInput || isVerifyingDiscount}>
                    {isVerifyingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </Button>
                )}
              </div>

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total, store.currency)}</span>
              </div>

              <Button
                type="submit"
                className="mt-6 w-full h-12 text-base shadow-lg shadow-primary/20"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order • ${formatPrice(total, store.currency)}`
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Secure Encrypted Payment
              </p>
            </div>
          </form>
        </Form>
      </StoreFrontContainer>
      <StoreFrontFooter store={store} />
    </div>
  );
}
