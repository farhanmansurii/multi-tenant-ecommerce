import { notFound } from 'next/navigation';

import { StoreFrontHeader } from '@/components/features/storefront/storefront-reusables/navbar';
import StoreFrontFooter from '@/components/features/storefront/storefront-reusables/footer';
import CartView from '@/components/features/storefront/cart/cart-view';
import { fetchStore } from '@/lib/services/store-api';

type CartPageProps = {
	params: { slug: string };
};

export default async function CartPage({ params }: CartPageProps) {
	const store = await fetchStore(params.slug).catch(() => null);

	if (!store) {
		notFound();
	}

	return (
		<div className="min-h-screen bg-background">
			{/* <StoreFrontHeader storeData={store} />
			{/* <CartView storeSlug={params.slug} currency={store.currency} /> */}
		</div>
	);
}
