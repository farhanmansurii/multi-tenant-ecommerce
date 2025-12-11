import { StoreSidebar } from "@/components/features/dashboard/store-sidebar";
import { StoreCategoriesClient } from "./categories-client";

interface StoreCategoriesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoreCategoriesPage({ params }: StoreCategoriesPageProps) {
  const { slug } = await params;

  return (
    <StoreCategoriesClient
      slug={slug}
      sidebar={<StoreSidebar slug={slug} />}
    />
  );
}
