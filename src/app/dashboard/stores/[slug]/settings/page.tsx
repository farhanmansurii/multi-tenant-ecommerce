import StoreSettings from '@/components/dashboard/stores/store-settings';

export default function StoreSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  return <StoreSettings params={params} />;
}
