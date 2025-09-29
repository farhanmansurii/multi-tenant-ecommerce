import { notFound } from 'next/navigation';

import CartView from '@/components/features/storefront/cart/cart-view';
import StoreFrontFooter from '@/components/features/storefront/storefront-reusables/footer';
import { StoreFrontHeader } from '@/components/features/storefront/storefront-reusables/navbar';
import { fetchStore } from '@/lib/services/store-api';

type CartPageProps = {
	params: { slug: string };
};

export default async function CartPage({ params }: CartPageProps) {
	const { slug } = params;

	if (!slug) {
		notFound();
	}

	const store = await fetchStore(slug).catch(() => null);

	if (!store) {
		notFound();
	}

	return (
		<div className="min-h-screen bg-background">
			<StoreFrontHeader storeData={store} />
			<CartView storeSlug={slug} currency={store.currency} />
			<StoreFrontFooter store={store} />
		</div>
	);
}
