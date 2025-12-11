import { Percent } from 'lucide-react';

import AdminDiscountsList from '@/components/features/dashboard/admin-discounts-list';
import DashboardLayout from '@/components/shared/layout/dashboard-container';

interface DiscountsPageProps {
  params: Promise<{ slug: string }>;
}

import { StoreSidebar } from '@/components/features/dashboard/store-sidebar';


export default async function DiscountsPage({ params }: DiscountsPageProps) {
  const { slug } = await params;

  return (
    <DashboardLayout
      title="Discounts"
      desc="Create and manage promotional discount codes"
      icon={<Percent />}
      sidebar={<StoreSidebar slug={slug} />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: slug, href: `/dashboard/stores/${slug}` },
        { label: 'Discounts' },
      ]}
    >
      <AdminDiscountsList storeSlug={slug} />
    </DashboardLayout>
  );
}
