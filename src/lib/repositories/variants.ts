import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { productVariants } from "@/lib/db/schema/ecommerce/product-variants";
import type { DbExecutor, RepositoryOptions } from "@/lib/repositories/types";

export type VariantRecord = typeof productVariants.$inferSelect;
export type VariantInsertInput = typeof productVariants.$inferInsert;

export interface VariantRepository {
  listByProductId(productId: string, options?: RepositoryOptions): Promise<VariantRecord[]>;
  bulkInsert(variants: VariantInsertInput[], options?: RepositoryOptions): Promise<void>;
}

export class DrizzleVariantRepository implements VariantRepository {
  constructor(private readonly defaultExecutor: DbExecutor = db) {}

  private resolveExecutor(options?: RepositoryOptions): DbExecutor {
    return options?.executor ?? this.defaultExecutor;
  }

  async listByProductId(productId: string, options?: RepositoryOptions): Promise<VariantRecord[]> {
    const executor = this.resolveExecutor(options);
    return executor.select().from(productVariants).where(eq(productVariants.productId, productId));
  }

  async bulkInsert(variants: VariantInsertInput[], options?: RepositoryOptions): Promise<void> {
    const executor = this.resolveExecutor(options);
    await executor.insert(productVariants).values(variants);
  }
}
