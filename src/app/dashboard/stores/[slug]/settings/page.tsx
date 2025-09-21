import { StoreSettings } from "@/components";

export default function StoreSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  return <StoreSettings params={params} />;
}
