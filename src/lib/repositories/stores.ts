import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stores, storeMembers } from "@/lib/db/schema/core/stores";
import type { DbExecutor, RepositoryOptions } from "@/lib/repositories/types";

export type StoreRecord = typeof stores.$inferSelect;
export type StoreMemberRecord = typeof storeMembers.$inferSelect;

export interface StoreRepository {
  getById(storeId: string, options?: RepositoryOptions): Promise<StoreRecord | null>;
  findBySlug(slug: string, options?: RepositoryOptions): Promise<StoreRecord | null>;
  updateSettings(
    storeId: string,
    settings: Partial<StoreRecord["settings"]>,
    options?: RepositoryOptions,
  ): Promise<void>;
  listMembers(storeId: string, options?: RepositoryOptions): Promise<StoreMemberRecord[]>;
  addMember(
    member: Omit<StoreMemberRecord, "createdAt">,
    options?: RepositoryOptions,
  ): Promise<void>;
}

export class DrizzleStoreRepository implements StoreRepository {
  constructor(private readonly defaultExecutor: DbExecutor = db) {}

  private resolveExecutor(options?: RepositoryOptions): DbExecutor {
    return options?.executor ?? this.defaultExecutor;
  }

  async getById(storeId: string, options?: RepositoryOptions): Promise<StoreRecord | null> {
    const executor = this.resolveExecutor(options);
    const [store] = await executor.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    return store ?? null;
  }

  async findBySlug(slug: string, options?: RepositoryOptions): Promise<StoreRecord | null> {
    const executor = this.resolveExecutor(options);
    const [store] = await executor.select().from(stores).where(eq(stores.slug, slug)).limit(1);
    return store ?? null;
  }

  async updateSettings(
    storeId: string,
    settings: Partial<StoreRecord["settings"]>,
    options?: RepositoryOptions,
  ): Promise<void> {
    const executor = this.resolveExecutor(options);
    const [current] = await executor
      .select({ settings: stores.settings })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!current) {
      return;
    }

    await executor
      .update(stores)
      .set({
        settings: { ...(current.settings ?? {}), ...(settings ?? {}) } as StoreRecord["settings"],
      })
      .where(eq(stores.id, storeId));
  }

  async listMembers(storeId: string, options?: RepositoryOptions): Promise<StoreMemberRecord[]> {
    const executor = this.resolveExecutor(options);
    return executor.select().from(storeMembers).where(eq(storeMembers.storeId, storeId));
  }

  async addMember(
    member: Omit<StoreMemberRecord, "createdAt">,
    options?: RepositoryOptions,
  ): Promise<void> {
    const executor = this.resolveExecutor(options);
    await executor.insert(storeMembers).values(member as typeof storeMembers.$inferInsert);
  }
}
