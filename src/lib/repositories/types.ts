import { db } from "@/lib/db";

export type DbExecutor = typeof db;

export interface RepositoryOptions {
  executor?: DbExecutor;
}
