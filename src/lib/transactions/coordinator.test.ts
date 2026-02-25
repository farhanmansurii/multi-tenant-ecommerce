import { beforeEach, describe, expect, it, vi } from "vitest";

const mockTransaction = vi.fn();
const mockLoggerError = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    transaction: mockTransaction,
  },
}));

vi.mock("@/lib/api/logger", () => ({
  logger: {
    error: mockLoggerError,
  },
}));

describe("transactionCoordinator", () => {
  beforeEach(() => {
    mockTransaction.mockReset();
    mockLoggerError.mockReset();
  });

  it("commits when callback succeeds", async () => {
    mockTransaction.mockImplementation(async (callback: (executor: unknown) => Promise<unknown>) => {
      return callback({ tx: "executor" });
    });

    const { transactionCoordinator } = await import("./coordinator");
    const result = await transactionCoordinator.run(async () => "ok");

    expect(result).toBe("ok");
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it("logs and rethrows when callback fails", async () => {
    const error = new Error("boom");
    mockTransaction.mockImplementation(async (callback: (executor: unknown) => Promise<unknown>) => {
      return callback({ tx: "executor" });
    });

    const { transactionCoordinator } = await import("./coordinator");
    await expect(transactionCoordinator.run(async () => Promise.reject(error))).rejects.toThrow("boom");

    expect(mockLoggerError).toHaveBeenCalledTimes(1);
  });
});
