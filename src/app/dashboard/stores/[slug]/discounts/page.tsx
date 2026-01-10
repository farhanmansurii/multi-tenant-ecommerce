import { Percent } from 'lucide-react';

import AdminDiscountsList from '@/components/features/dashboard/admin-discounts-list';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { getStoreBySlug } from '@/lib/domains/stores/helpers';

interface DiscountsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DiscountsPage({ params }: DiscountsPageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  return (
    <DashboardLayout
      title="Discounts"
      desc="Create and manage promotional discount codes"
      icon={<Percent />}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Discounts' },
      ]}
    >
      <AdminDiscountsList storeSlug={slug} />
    </DashboardLayout>
  );
}
