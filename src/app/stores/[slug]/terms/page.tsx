import { notFound } from "next/navigation";
import { storeHelpers } from "@/lib/domains/stores";

interface TermsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { slug } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) notFound();

  const terms = (store.settings as any)?.termsOfService as string | undefined;
  if (!terms) notFound();

  return (
    <main className="container max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mt-1">{store.name}</p>
      <div className="mt-8 whitespace-pre-wrap leading-7 text-sm">{terms}</div>
    </main>
  );
}

