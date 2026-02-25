import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/ecommerce/products";
import type { DbExecutor, RepositoryOptions } from "@/lib/repositories/types";

export type ProductRecord = typeof products.$inferSelect;
export type ProductInsertInput = typeof products.$inferInsert;

export interface ProductRepository {
  listForStore(storeId: string, options?: RepositoryOptions): Promise<ProductRecord[]>;
  findBySlug(
    storeId: string,
    slug: string,
    options?: RepositoryOptions,
  ): Promise<ProductRecord | null>;
  findById(
    storeId: string,
    productId: string,
    options?: RepositoryOptions,
  ): Promise<ProductRecord | null>;
  updateById(
    id: string,
    data: Partial<ProductInsertInput>,
    options?: RepositoryOptions,
  ): Promise<ProductRecord | null>;
  deleteById(id: string, options?: RepositoryOptions): Promise<void>;
  insert(product: ProductInsertInput, options?: RepositoryOptions): Promise<void>;
}

export class DrizzleProductRepository implements ProductRepository {
  constructor(private readonly defaultExecutor: DbExecutor = db) {}

  private resolveExecutor(options?: RepositoryOptions): DbExecutor {
    return options?.executor ?? this.defaultExecutor;
  }

  async listForStore(storeId: string, options?: RepositoryOptions): Promise<ProductRecord[]> {
    const executor = this.resolveExecutor(options);
    return executor
      .select()
      .from(products)
      .where(eq(products.storeId, storeId))
      .orderBy(desc(products.updatedAt));
  }

  async findById(
    storeId: string,
    productId: string,
    options?: RepositoryOptions,
  ): Promise<ProductRecord | null> {
    const executor = this.resolveExecutor(options);
    const [product] = await executor
      .select()
      .from(products)
      .where(and(eq(products.storeId, storeId), eq(products.id, productId)))
      .limit(1);
    return product ?? null;
  }

  async findBySlug(
    storeId: string,
    slug: string,
    options?: RepositoryOptions,
  ): Promise<ProductRecord | null> {
    const executor = this.resolveExecutor(options);
    const [product] = await executor
      .select()
      .from(products)
      .where(and(eq(products.storeId, storeId), eq(products.slug, slug)))
      .limit(1);
    return product ?? null;
  }

  async updateById(
    id: string,
    data: Partial<ProductInsertInput>,
    options?: RepositoryOptions,
  ): Promise<ProductRecord | null> {
    const executor = this.resolveExecutor(options);
    const [updated] = await executor
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return updated ?? null;
  }

  async deleteById(id: string, options?: RepositoryOptions): Promise<void> {
    const executor = this.resolveExecutor(options);
    await executor.delete(products).where(eq(products.id, id));
  }

  async insert(product: ProductInsertInput, options?: RepositoryOptions): Promise<void> {
    const executor = this.resolveExecutor(options);
    await executor.insert(products).values(product);
  }
}
