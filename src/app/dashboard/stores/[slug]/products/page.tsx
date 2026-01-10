import { Package } from 'lucide-react';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import ProductManager from '@/components/shared/common/product-manager';
import { getStoreBySlug } from '@/lib/domains/stores/helpers';

interface ProductsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  return (
    <DashboardLayout
      title="Products"
      desc="Manage your store products"
      icon={<Package />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Products' },
      ]}
    >
      <ProductManager storeSlug={slug} />
    </DashboardLayout>
  );
}
