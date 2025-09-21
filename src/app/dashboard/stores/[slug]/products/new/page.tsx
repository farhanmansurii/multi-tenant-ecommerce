import StoreProductCreate from "@/components/features/dashboard/store-product-create";
import { CreateProductForm } from "@/components/forms/product/create-product-form";

interface StoreProductCreatePageProps {
  params: { slug: string };
}

export default function StoreProductCreatePage({ params }: StoreProductCreatePageProps) {
  return <StoreProductCreate params={Promise.resolve(params)} />;
}
