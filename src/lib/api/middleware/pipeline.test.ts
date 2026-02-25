import { describe, expect, it, vi } from "vitest";
import type { ApiMiddleware, MiddlewareContext } from "./pipeline";

vi.mock("@/lib/api/context", () => ({
  getApiContextOrNull: vi.fn(),
}));

vi.mock("@/lib/api/rate-limit", () => ({
  rateLimit: () => () => null,
}));

vi.mock("./authorization", () => ({
  isStoreMember: vi.fn(),
}));

function createContext(): MiddlewareContext {
  return {
    request: new Request("http://localhost/api/test") as unknown as MiddlewareContext["request"],
    slug: "demo-store",
    params: {},
    data: {},
  };
}

describe("composeMiddleware", () => {
  it("short-circuits when a middleware returns a response", async () => {
    const { composeMiddleware } = await import("./pipeline");
    const calls: string[] = [];

    const first: ApiMiddleware = async (context) => {
      calls.push("first");
      return { ...context, data: { ...context.data, first: true } };
    };

    const second: ApiMiddleware = async () => {
      calls.push("second");
      return new Response("blocked", { status: 401 });
    };

    const third: ApiMiddleware = async (context) => {
      calls.push("third");
      return context;
    };

    const pipeline = composeMiddleware([first, second, third]);
    const result = await pipeline(createContext());

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
    expect(calls).toEqual(["first", "second"]);
  });

  it("passes context to downstream middleware on success", async () => {
    const { composeMiddleware } = await import("./pipeline");
    const pipeline = composeMiddleware([
      async (context) => ({ ...context, data: { ...context.data, one: 1 } }),
      async (context) => ({ ...context, data: { ...context.data, two: 2 } }),
    ]);

    const result = await pipeline(createContext());
    expect(result).not.toBeInstanceOf(Response);
    expect((result as MiddlewareContext).data).toEqual({ one: 1, two: 2 });
  });
});
