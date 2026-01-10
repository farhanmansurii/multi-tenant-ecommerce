import { Users } from 'lucide-react';

import AdminCustomersList from '@/components/features/dashboard/admin-customers-list';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { getStoreBySlug } from '@/lib/domains/stores/helpers';

interface CustomersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CustomersPage({ params }: CustomersPageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  return (
    <DashboardLayout
      title="Customers"
      desc="View and manage your store customers"
      icon={<Users />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Customers' },
      ]}
    >
      <AdminCustomersList storeSlug={slug} />
    </DashboardLayout>
  );
}
