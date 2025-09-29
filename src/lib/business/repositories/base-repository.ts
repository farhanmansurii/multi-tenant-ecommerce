


import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export abstract class BaseRepository {
  protected db = db;

  /**
   * Set the current store context for RLS
   */
  protected async setStoreContext(storeId: string): Promise<void> {
    await this.db.execute(sql`SELECT set_config('app.current_store_id', ${storeId}, true)`);
  }

  /**
   * Get the current store context
   */
  protected async getStoreContext(): Promise<string | null> {
    const result = await this.db.execute(sql`SELECT current_setting('app.current_store_id', true)`);
    const rows = Array.isArray(result)
      ? result
      : typeof result === 'object' && result !== null && 'rows' in result
        ? (result as { rows: { current_setting?: string }[] }).rows
        : [];
    const [row] = rows as { current_setting?: string }[]
    if (typeof row?.current_setting === 'string') {
      return row.current_setting
    }
    return null
  }

  protected async withStoreContext<T>(
    storeId: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    await this.setStoreContext(storeId)
    return await queryFn();
  }
}
