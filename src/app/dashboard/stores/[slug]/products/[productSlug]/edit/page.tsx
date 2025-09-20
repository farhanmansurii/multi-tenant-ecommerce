import StoreProductEdit from '@/components/dashboard/stores/store-product-edit';

export default function StoreProductEditPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  return <StoreProductEdit params={params} />;
}
