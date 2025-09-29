import { z } from "zod";
import { badRequest } from "./responses";

export async function parseJson<T>(request: Request, schema: z.ZodSchema<T>) {
  const json = await request.json().catch(() => null);
  const result = schema.safeParse(json);
  if (!result.success) return badRequest("Invalid payload");
  return result.data;
}


