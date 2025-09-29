/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { Heart, LogOut, MapPin, Package, Plus, Trash2 } from 'lucide-react';

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
import type { StoreData } from '@/lib/types/store';
import { useSessionContext } from '@/lib/session-context';
import { signOut } from '@/lib/auth-client';
import { useStorefrontCustomer } from '@/hooks/use-storefront-customer';
import { formatPrice } from '@/lib/utils/price';
import type { StorefrontAddress } from '@/lib/state/storefront/types';

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
		return String(user.id) === store.ownerId;
	}, [store.ownerId, user?.id]);

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
			<div className="min-h-screen bg-background">
				<StoreFrontHeader storeData={store} />
				<StoreFrontContainer className="py-24">
					<Card className="mx-auto max-w-2xl border border-dashed border-border/60">
						<CardHeader>
							<CardTitle className="text-2xl">
								Store owners manage customers separately
							</CardTitle>
							<CardDescription>
								You&apos;re signed in as the owner of {store.name}. Customer
								accounts are tenant-specific and separate from store administration.
								Continue to the dashboard to manage your store or sign out before
								accessing customer features.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
							<Button asChild>
								<Link href={`/dashboard/stores/${store.slug}`}>
									Go to dashboard
								</Link>
							</Button>
							<Button
								variant="secondary"
								onClick={handleSignOut}
								className="sm:w-auto"
							>
								Sign out
							</Button>
						</CardContent>
					</Card>
				</StoreFrontContainer>
				<StoreFrontFooter store={store} />
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
