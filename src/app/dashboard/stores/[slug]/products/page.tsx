import { Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Products' },
      ]}
      headerActions={
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/dashboard/stores/${slug}/products/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      }
    >
      <ProductManager storeSlug={slug} />
    </DashboardLayout>
  );
}
