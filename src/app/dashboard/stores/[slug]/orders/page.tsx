import { Suspense } from 'react';
import { ClipboardList } from 'lucide-react';

import AdminOrdersList from '@/components/features/dashboard/admin-orders-list';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { Loader } from '@/components/shared/common/loader';

interface OrdersPageProps {
  params: Promise<{ slug: string }>;
}

import { StoreSidebar } from '@/components/features/dashboard/store-sidebar';


export default async function OrdersPage({ params }: OrdersPageProps) {
  const { slug } = await params;

  return (
    <DashboardLayout
      title="Orders"
      desc="View and manage all customer orders"
      icon={<ClipboardList />}
      sidebar={<StoreSidebar slug={slug} />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: slug, href: `/dashboard/stores/${slug}` },
        { label: 'Orders' },
      ]}
    >
      <Suspense fallback={<Loader text="Loading orders..." className="py-24" />}>
        <AdminOrdersList storeSlug={slug} />
      </Suspense>
    </DashboardLayout>
  );
}
