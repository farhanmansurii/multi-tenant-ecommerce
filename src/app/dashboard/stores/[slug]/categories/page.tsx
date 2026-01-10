import { StoreCategoriesClient } from "./categories-client";
import { getStoreBySlug } from "@/lib/domains/stores/helpers";

interface StoreCategoriesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoreCategoriesPage({ params }: StoreCategoriesPageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  return <StoreCategoriesClient slug={slug} initialStore={store} />;
}
