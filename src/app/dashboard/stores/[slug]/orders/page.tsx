import { getStoreBySlug } from '@/lib/domains/stores/helpers';
import { OrdersPageClient } from './orders-client';

interface OrdersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  return <OrdersPageClient slug={slug} storeName={store?.name} />;
}
