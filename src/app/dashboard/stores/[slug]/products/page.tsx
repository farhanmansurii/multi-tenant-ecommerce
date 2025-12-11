import { Package } from 'lucide-react';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { StoreSidebar } from '@/components/features/dashboard/store-sidebar';
import ProductManager from '@/components/shared/common/product-manager';

interface ProductsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { slug } = await params;

  return (
    <DashboardLayout
      title="Products"
      desc="Manage your store products"
      icon={<Package />}
      sidebar={<StoreSidebar slug={slug} />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: slug, href: `/dashboard/stores/${slug}` },
        { label: 'Products' },
      ]}
    >
      <ProductManager storeSlug={slug} />
    </DashboardLayout>
  );
}
