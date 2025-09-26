/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

import StoreFrontContainer from '../storefront-reusables/container';
import { Button } from '@/components/ui/button';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { formatPrice } from '@/lib/utils/price';

type CartViewProps = {
	storeSlug: string;
	currency?: string;
};

export default function CartView({ storeSlug, currency = 'INR' }: CartViewProps) {
	const { cart, updateQuantity, removeItem, clearCart, setStoreSlug } = useStorefrontStore(
		(state) => ({
			cart: state.cart,
			updateQuantity: state.updateQuantity,
			removeItem: state.removeItem,
			clearCart: state.clearCart,
			setStoreSlug: state.setStoreSlug,
		})
	);

	useEffect(() => {
		setStoreSlug(storeSlug);
	}, [setStoreSlug, storeSlug]);

	const continueShoppingHref = `/stores/${storeSlug}`;

	if (!cart.items.length) {
		return (
			<StoreFrontContainer className="py-24">
				<div className="mx-auto flex max-w-md flex-col items-center space-y-6 text-center">
					<h1 className="text-3xl font-semibold">Your cart is empty</h1>
					<p className="text-muted-foreground">
						Browse the catalog to discover products youll love and add them to your
						cart.
					</p>
					<Button asChild>
						<Link href={continueShoppingHref}>Continue shopping</Link>
					</Button>
				</div>
			</StoreFrontContainer>
		);
	}

	return (
		<StoreFrontContainer className="py-16">
			<div className="flex flex-col gap-10 lg:grid lg:grid-cols-[2fr_1fr]">
				<div className="space-y-4">
					{cart.items.map((item) => {
						const lineTotal = item.price * item.quantity;
						return (
							<div
								key={item.id}
								className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
							>
								<div className="flex w-full items-center gap-4 sm:w-auto">
									<div className="h-20 w-20 overflow-hidden rounded-md bg-muted">
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
									<div className="flex flex-1 flex-col gap-2">
										<div className="flex items-start justify-between gap-4">
											<div>
												<h2 className="text-base font-semibold sm:text-lg">
													{item.name}
												</h2>
												{item.variantId && (
													<p className="text-xs text-muted-foreground">
														Variant: {item.variantId}
													</p>
												)}
											</div>
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													removeItem(item.productId, item.variantId)
												}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
										<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
											<div className="flex items-center gap-3">
												<Button
													variant="outline"
													size="icon"
													onClick={() =>
														updateQuantity(
															item.productId,
															item.quantity - 1,
															item.variantId
														)
													}
													disabled={item.quantity <= 1}
												>
													<Minus className="h-4 w-4" />
												</Button>
												<span className="w-8 text-center font-medium">
													{item.quantity}
												</span>
												<Button
													variant="outline"
													size="icon"
													onClick={() =>
														updateQuantity(
															item.productId,
															item.quantity + 1,
															item.variantId
														)
													}
												>
													<Plus className="h-4 w-4" />
												</Button>
											</div>
											<p className="font-semibold">
												{formatPrice(lineTotal, currency)}
											</p>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				<div className="space-y-4">
					<div className="rounded-xl border p-6">
						<h2 className="text-lg font-semibold">Order summary</h2>
						<div className="mt-4 space-y-3 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Subtotal</span>
								<span className="font-medium">
									{formatPrice(cart.subtotal, currency)}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Shipping</span>
								<span className="text-muted-foreground">
									Calculated at checkout
								</span>
							</div>
						</div>
						<Button className="mt-6 w-full">Proceed to checkout</Button>
						<Button variant="ghost" className="mt-3 w-full" onClick={clearCart}>
							Clear cart
						</Button>
					</div>
					<div className="rounded-xl border p-6 text-sm text-muted-foreground">
						<p>
							Taxes and shipping are estimated. You can review final totals during the
							checkout process.
						</p>
					</div>
				</div>
			</div>
		</StoreFrontContainer>
	);
}
