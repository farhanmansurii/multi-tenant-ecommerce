import { getStoreBySlug } from '@/lib/domains/stores/helpers';
import { CustomersPageClient } from './customers-client';

interface CustomersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CustomersPage({ params }: CustomersPageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  return <CustomersPageClient slug={slug} storeName={store?.name} />;
}
