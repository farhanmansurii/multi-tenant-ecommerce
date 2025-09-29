import type { ProductImage, ProductVariant } from "@/lib/db/schema/product";

export type ProductType = "physical" | "digital" | "service";
export type ProductStatus = "draft" | "active" | "inactive" | "out_of_stock";

type ProductRow = typeof import("@/lib/db/schema/product").products.$inferSelect;

export type ProductData = Omit<ProductRow, "images" | "variants" | "categories" | "tags"> & {
  images: ProductImage[];
  variants: ProductVariant[];
  categories: string[];
  tags: string[];
};

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

export interface StoreProductEditProps {
  params: Promise<{ slug: string; productSlug: string }>;
}
