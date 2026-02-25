import { ProductImage } from "@/lib/db/schema";
import type { productVariants } from "@/lib/db/schema/ecommerce/product-variants";
import type { products } from "@/lib/db/schema/ecommerce/products";

export type ProductType = "physical" | "digital" | "service";
export type ProductStatus = "draft" | "active" | "inactive" | "out_of_stock";

type ProductRow = typeof products.$inferSelect;
type ProductVariantRow = typeof productVariants.$inferSelect;

export type ProductVariant = ProductVariantRow & {
  name?: string;
  price?: number | null;
  compareAtPrice?: number | null;
};

export type ProductData = Omit<ProductRow, "images" | "categories" | "tags"> & {
  images: ProductImage[];
  variants: ProductVariant[];
  categories: { id: string; name: string }[];
  tags: string[];
};

export type ProductInput = Omit<ProductData, "categories"> & {
  categories: string[];
};

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

export interface StoreProductEditProps {
  params: Promise<{ slug: string; productSlug: string }>;
}
