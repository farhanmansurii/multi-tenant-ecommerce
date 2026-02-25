import { eq, and } from "drizzle-orm";
import "server-only";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { setTenantContext } from "@/lib/middleware/tenant";
import { productsService } from "./products-service";

export interface CreateProductData {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku?: string;
  type?: "physical" | "digital" | "service";
  status?: "draft" | "active" | "inactive" | "out_of_stock";
  price: string;
  compareAtPrice?: string;
  costPrice?: string;
  trackQuantity?: boolean;
  quantity?: string;
  allowBackorder?: boolean;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  downloadUrl?: string;
  downloadExpiry?: string;
  metaTitle?: string;
  metaDescription?: string;
  images?: Array<{
    id: string;
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  categories?: string[];
  tags?: string[];
  featured?: boolean;
  requiresShipping?: boolean;
  taxable?: boolean;
}

export interface ProductFilters {
  status?: string[];
  type?: string[];
  categories?: string[];
  tags?: string[];
  featured?: boolean;
  search?: string;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Create a new product
 */
export async function createProduct(storeId: string, data: CreateProductData) {
  return productsService.createProduct(storeId, data);
}

/**
 * Get product by ID
 */
export async function getProductById(id: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return product || null;
}

/**
 * Get product by slug
 */
export async function getProductBySlug(storeId: string, slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.slug, slug)
      )
    )
    .limit(1);

  return product || null;
}

/**
 * Update product
 */
export async function updateProduct(id: string, data: Partial<CreateProductData>) {
  return productsService.updateProduct(id, data);
}

/**
 * Delete product
 */
export async function deleteProduct(id: string) {
  await productsService.deleteProduct(id);
}

/**
 * List products with filters
 */
export async function listProducts(storeId: string, filters: ProductFilters = {}) {
  const products = await productsService.listForStore(storeId);
  if (filters.limit) {
    return products.slice(0, filters.limit);
  }
  return products;
}

/**
 * Get product count
 */
export async function getProductCount(storeId: string, filters: ProductFilters = {}) {
  return productsService.countForStore(storeId, filters);
}

/**
 * Get product with tenant context (for RLS)
 */
export async function getProductWithContext(storeId: string, productId: string) {
  await setTenantContext(storeId);
  return await getProductById(productId);
}

/**
 * List products with tenant context (for RLS)
 */
export async function listProductsWithContext(storeId: string, filters: ProductFilters = {}) {
  await setTenantContext(storeId);
  return await listProducts(storeId, filters);
}
