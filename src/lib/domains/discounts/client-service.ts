import { withBaseUrl } from "@/lib/utils/url";
import type { Discount } from "@/lib/db/schema/ecommerce/discounts";

export async function fetchDiscounts(storeSlug: string): Promise<Discount[]> {
  const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/discounts`));

  if (!response.ok) {
    throw new Error(
      response.status === 404 ? "Discounts not found" : "Failed to load discounts"
    );
  }

  const data = await response.json();
  return data.discounts || [];
}
