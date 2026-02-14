import { AlertTriangle } from 'lucide-react';

import AdminInventoryAlerts from '@/components/features/dashboard/admin-inventory-alerts';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { getStoreBySlug } from '@/lib/domains/stores/helpers';

interface InventoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function InventoryPage({ params }: InventoryPageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  return (
    <DashboardLayout
      title="Inventory Alerts"
      desc="Monitor and manage product stock levels"
      icon={<AlertTriangle />}
      breadcrumbs={[
        { label: 'Stores', href: '/dashboard/stores' },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Inventory' },
      ]}
    >
      <AdminInventoryAlerts storeSlug={slug} />
    </DashboardLayout>
  );
}
