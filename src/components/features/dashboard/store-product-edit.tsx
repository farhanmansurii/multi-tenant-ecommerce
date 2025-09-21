import ProductForm from "./product-form";

interface StoreProductEditProps {
  params: { slug: string; productSlug: string };
}

export default function StoreProductEdit({ params }: StoreProductEditProps) {
  const { slug, productSlug } = params || {};

  if (!slug || !productSlug) return null;

  return <ProductForm mode="edit" storeSlug={slug} productSlug={productSlug} />;
}
