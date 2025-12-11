import { OrderDetailView } from '@/components/features/storefront/orders';

interface OrderDetailPageProps {
  params: Promise<{ slug: string; orderId: string }>;
}

import { fetchStore } from '@/lib/domains/stores/service';

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { slug } = await params;
  const store = await fetchStore(slug);

  return <OrderDetailView store={store} />;
}
