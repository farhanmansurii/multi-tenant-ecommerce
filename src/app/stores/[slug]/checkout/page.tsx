import { notFound } from 'next/navigation';
import { storeHelpers } from '@/lib/domains/stores';
import { CheckoutView } from '@/components/features/storefront/components/checkout';

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  // Transform raw DB store data to StoreData interface
  const storeData: any = {
    ...store,
    codEnabled: store.settings?.codEnabled ?? false,
    paymentMethods: store.settings?.paymentMethods || [],
    productCount: 0, // Not used in checkout
    shippingEnabled: store.settings?.shippingEnabled ?? false,
    freeShippingThreshold: store.settings?.freeShippingThreshold ?? null,
    termsOfService: store.settings?.termsOfService || '',
    privacyPolicy: store.settings?.privacyPolicy || '',
    refundPolicy: store.settings?.refundPolicy || '',
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
  };

  return <CheckoutView store={storeData} />;
}
