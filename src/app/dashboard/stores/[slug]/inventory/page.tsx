import { AlertTriangle } from 'lucide-react';

import AdminInventoryAlerts from '@/components/features/dashboard/admin-inventory-alerts';
import DashboardLayout from '@/components/shared/layout/dashboard-container';

interface InventoryPageProps {
  params: Promise<{ slug: string }>;
}

import { StoreSidebar } from '@/components/features/dashboard/store-sidebar';

// ...

export default async function InventoryPage({ params }: InventoryPageProps) {
  const { slug } = await params;

  return (
    <DashboardLayout
      title="Inventory Alerts"
      desc="Monitor and manage product stock levels"
      icon={<AlertTriangle />}
      sidebar={<StoreSidebar slug={slug} />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: slug, href: `/dashboard/stores/${slug}` },
        { label: 'Inventory' },
      ]}
    >
      <AdminInventoryAlerts storeSlug={slug} />
    </DashboardLayout>
  );
}
