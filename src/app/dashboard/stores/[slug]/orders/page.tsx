import { Suspense } from 'react';
import { ClipboardList } from 'lucide-react';

import AdminOrdersList from '@/components/features/dashboard/admin-orders-list';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { Loader } from '@/components/shared/common/loader';
import { getStoreBySlug } from '@/lib/domains/stores/helpers';

interface OrdersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  return (
    <DashboardLayout
      title="Orders"
      desc="View and manage all customer orders"
      icon={<ClipboardList />}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Orders' },
      ]}
    >
      <Suspense fallback={<Loader text="Loading orders..." className="py-24" />}>
        <AdminOrdersList storeSlug={slug} />
      </Suspense>
    </DashboardLayout>
  );
}
