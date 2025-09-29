import { ProductImage } from "@/lib/db/schema";

export type ProductType = "physical" | "digital" | "service";
export type ProductStatus = "draft" | "active" | "inactive" | "out_of_stock";

type ProductRow = typeof import("@/lib/db/schema/ecommerce/products").products.$inferSelect;

export type ProductVariant = {
  id: string;
  name: string;
  price?: number | null;
  compareAtPrice?: number | null;
  attributes?: Record<string, string>;
};

export type ProductData = Omit<ProductRow, "images" | "categories" | "tags"> & {
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
