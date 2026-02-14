import { notFound } from "next/navigation";
import { storeHelpers } from "@/lib/domains/stores";

interface RefundsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RefundsPage({ params }: RefundsPageProps) {
  const { slug } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) notFound();

  const refunds = (store.settings as any)?.refundPolicy as string | undefined;
  if (!refunds) notFound();

  return (
    <main className="container max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
      <p className="text-sm text-muted-foreground mt-1">{store.name}</p>
      <div className="mt-8 whitespace-pre-wrap leading-7 text-sm">{refunds}</div>
    </main>
  );
}

