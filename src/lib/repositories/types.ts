import { db } from "@/lib/db";
import type { TransactionExecutor } from "@/lib/transactions/coordinator";

export type DbExecutor = typeof db | TransactionExecutor;

export interface RepositoryOptions {
  executor?: DbExecutor;
}
