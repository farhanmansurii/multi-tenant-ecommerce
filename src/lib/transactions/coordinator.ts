import { db, Database } from "@/lib/db";
import { logger } from "@/lib/api/logger";

export type TransactionExecutor = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type TransactionCallback<T> = (executor: TransactionExecutor) => Promise<T>;

export const transactionCoordinator = {
  async run<T>(callback: TransactionCallback<T>): Promise<T> {
    return db.transaction(async (executor) => {
      try {
        return await callback(executor);
      } catch (error) {
        logger.error("Transaction failed", error as Error);
        throw error;
      }
    });
  },
};

export async function withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
  return transactionCoordinator.run(callback);
}
