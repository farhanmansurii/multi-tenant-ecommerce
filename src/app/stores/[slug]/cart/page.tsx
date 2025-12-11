import { notFound } from 'next/navigation';

import { fetchStore } from '@/lib/domains/stores/service';
import CartView from '@/components/features/storefront/components/cart/cart-view';


type CartPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CartPage({ params }: CartPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const store = await fetchStore(slug).catch(() => null);

  if (!store) {
    notFound();
  }

  return (
    <CartView store={store} />
  );
}
