export type ProductType = "physical" | "digital" | "service";
export type ProductStatus = "draft" | "active" | "inactive" | "out_of_stock";
export type ProductViewMode = "grid" | "list";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

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
  images: ProductImage[];
  categories: { id: string; name: string }[];
  tags: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormValues {
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  type: ProductType;
  status: ProductStatus;
  price: string;
  compareAtPrice: string;
  quantity: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  requiresShipping: boolean;
  taxable: boolean;
  trackQuantity: boolean;
  allowBackorder: boolean;
  images: ProductImage[];
}
