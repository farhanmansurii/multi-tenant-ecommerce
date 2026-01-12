import { logger } from "./api/logger";
import { db } from "./db";

export async function validateStartup(): Promise<void> {
  logger.info("Starting application validation...");

  // Test database connection
  try {
    await db.execute("SELECT 1");
    logger.info("✓ Database connection successful");
  } catch (error) {
    logger.error("✗ Database connection failed", error);
    throw new Error("Database connection validation failed");
  }

  logger.info("Application validation complete");
}

// Run validation on module load in production
if (process.env.NODE_ENV === "production") {
  validateStartup().catch((error) => {
    logger.error("Startup validation failed", error);
    process.exit(1);
  });
}
