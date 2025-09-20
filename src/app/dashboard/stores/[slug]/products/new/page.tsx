import StoreProductCreate from "@/components/dashboard/stores/store-product-create";
import { CreateProductForm } from "@/components/products/create-product-form";

interface StoreProductCreatePageProps {
  params: { slug: string };
}

export default function StoreProductCreatePage({ params }: StoreProductCreatePageProps) {
  return <StoreProductCreate params={params} />;
}
