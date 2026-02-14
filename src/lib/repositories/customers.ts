import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { storeCustomers } from "@/lib/db/schema/core/store-customers";
import type { DbExecutor, RepositoryOptions } from "@/lib/repositories/types";

export type CustomerRecord = typeof storeCustomers.$inferSelect;
export type CustomerInsertInput = typeof storeCustomers.$inferInsert;

export interface CustomerRepository {
  findById(customerId: string, options?: RepositoryOptions): Promise<CustomerRecord | null>;
  findByEmail(
    storeId: string,
    email: string,
    options?: RepositoryOptions,
  ): Promise<CustomerRecord | null>;
  listByStore(storeId: string, options?: RepositoryOptions): Promise<CustomerRecord[]>;
  upsert(customer: CustomerInsertInput, options?: RepositoryOptions): Promise<void>;
}

export class DrizzleCustomerRepository implements CustomerRepository {
  constructor(private readonly defaultExecutor: DbExecutor = db) {}

  private resolveExecutor(options?: RepositoryOptions): DbExecutor {
    return options?.executor ?? this.defaultExecutor;
  }

  async findById(customerId: string, options?: RepositoryOptions): Promise<CustomerRecord | null> {
    const executor = this.resolveExecutor(options);
    const [customer] = await executor
      .select()
      .from(storeCustomers)
      .where(eq(storeCustomers.id, customerId))
      .limit(1);
    return customer ?? null;
  }

  async findByEmail(
    storeId: string,
    email: string,
    options?: RepositoryOptions,
  ): Promise<CustomerRecord | null> {
    const executor = this.resolveExecutor(options);
    const [customer] = await executor
      .select()
      .from(storeCustomers)
      .where(and(eq(storeCustomers.storeId, storeId), eq(storeCustomers.email, email)))
      .limit(1);
    return customer ?? null;
  }

  async listByStore(storeId: string, options?: RepositoryOptions): Promise<CustomerRecord[]> {
    const executor = this.resolveExecutor(options);
    return executor.select().from(storeCustomers).where(eq(storeCustomers.storeId, storeId));
  }

  async upsert(customer: CustomerInsertInput, options?: RepositoryOptions): Promise<void> {
    const executor = this.resolveExecutor(options);
    await executor
      .insert(storeCustomers)
      .values(customer)
      .onConflictDoUpdate({
        target: [storeCustomers.storeId, storeCustomers.email],
        set: {
          data: customer.data,
          wishlist: customer.wishlist,
          savedAddresses: customer.savedAddresses,
          updatedAt: customer.updatedAt,
        },
      });
  }
}
