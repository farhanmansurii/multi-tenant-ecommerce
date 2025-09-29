import { eq, and, desc, like, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { setTenantContext } from "@/lib/middleware/tenant";

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
  const [product] = await db
    .insert(products)
    .values({
      id: crypto.randomUUID(),
      storeId,
      ...data,
      type: data.type || "physical",
      status: data.status || "draft",
      trackQuantity: data.trackQuantity ?? true,
      quantity: data.quantity || "0",
      allowBackorder: data.allowBackorder ?? false,
      images: data.images || [],
      categories: data.categories || [],
      tags: data.tags || [],
      featured: data.featured ?? false,
      requiresShipping: data.requiresShipping ?? true,
      taxable: data.taxable ?? true,
    })
    .returning();

  return product;
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
  const [updatedProduct] = await db
    .update(products)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  return updatedProduct;
}

/**
 * Delete product
 */
export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
}

/**
 * List products with filters
 */
export async function listProducts(storeId: string, filters: ProductFilters = {}) {
  // For now, just return basic products list
  // TODO: Implement proper filtering when Drizzle types are fixed
  return await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(desc(products.createdAt))
    .limit(filters.limit || 50);
}

/**
 * Get product count
 */
export async function getProductCount(storeId: string, filters: ProductFilters = {}) {
  // Build conditions array
  const conditions = [eq(products.storeId, storeId)];

  // Apply same filters as list method
  if (filters.status && filters.status.length > 0) {
    conditions.push(inArray(products.status, filters.status as ("draft" | "active" | "inactive" | "out_of_stock")[]));
  }

  if (filters.type && filters.type.length > 0) {
    conditions.push(inArray(products.type, filters.type as ("physical" | "digital" | "service")[]));
  }

  if (filters.featured !== undefined) {
    conditions.push(eq(products.featured, filters.featured));
  }

  if (filters.search) {
    conditions.push(like(products.name, `%${filters.search}%`));
  }

  const result = await db
    .select({ count: products.id })
    .from(products)
    .where(and(...conditions));

  return result.length;
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
