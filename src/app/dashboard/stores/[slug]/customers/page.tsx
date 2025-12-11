import { Users } from 'lucide-react';

import AdminCustomersList from '@/components/features/dashboard/admin-customers-list';
import DashboardLayout from '@/components/shared/layout/dashboard-container';

interface CustomersPageProps {
  params: Promise<{ slug: string }>;
}

import { StoreSidebar } from '@/components/features/dashboard/store-sidebar';

// ...

export default async function CustomersPage({ params }: CustomersPageProps) {
  const { slug } = await params;

  return (
    <DashboardLayout
      title="Customers"
      desc="View and manage your store customers"
      icon={<Users />}
      sidebar={<StoreSidebar slug={slug} />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: slug, href: `/dashboard/stores/${slug}` },
        { label: 'Customers' },
      ]}
    >
      <AdminCustomersList storeSlug={slug} />
    </DashboardLayout>
  );
}
