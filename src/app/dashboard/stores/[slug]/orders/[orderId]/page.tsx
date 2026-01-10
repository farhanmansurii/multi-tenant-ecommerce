import { Package } from 'lucide-react';

import AdminOrderDetail from '@/components/features/dashboard/admin-order-detail';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { getStoreBySlug } from '@/lib/domains/stores/helpers';

interface OrderDetailPageProps {
  params: Promise<{ slug: string; orderId: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { slug, orderId } = await params;
  const store = await getStoreBySlug(slug);

  return (
    <DashboardLayout
      title="Order Details"
      desc="View and manage order information"
      icon={<Package />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Orders', href: `/dashboard/stores/${slug}/orders` },
        { label: `Order` },
      ]}
    >
      <AdminOrderDetail storeSlug={slug} orderId={orderId} />
    </DashboardLayout>
  );
}
