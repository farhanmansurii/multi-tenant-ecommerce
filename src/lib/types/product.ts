import { ProductImage } from "@/lib/db/schema/product";

export type ProductType = "physical" | "digital" | "service";
export type ProductStatus = "draft" | "active" | "inactive" | "out_of_stock";


export interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  sku?: string | null;
  type: ProductType;
  status: ProductStatus;
  price: string;
  compareAtPrice?: string | null;
  quantity: string;
  requiresShipping: boolean;
  taxable: boolean;
  trackQuantity: boolean;
  allowBackorder: boolean;
  featured: boolean;
  categories: string[];
  tags: string[];
  images?: ProductImage[];
}

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

export interface StoreProductEditProps {
  params: Promise<{ slug: string; productSlug: string }>;
}
