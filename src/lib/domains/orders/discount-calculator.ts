import { and, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import { discounts } from "@/lib/db/schema/ecommerce/discounts";
import type { TransactionExecutor } from "@/lib/transactions/coordinator";

export interface DiscountCalculationOptions {
  storeId: string;
  discountCode?: string | null;
  subtotal: number;
}

export class DiscountCalculator {
  async calculate(
    executor: TransactionExecutor,
    options: DiscountCalculationOptions,
  ): Promise<number> {
    const code = options.discountCode?.trim().toUpperCase();
    if (!code) {
      return 0;
    }

    const now = new Date();
    const [discount] = await executor
      .select()
      .from(discounts)
      .where(
        and(
          eq(discounts.storeId, options.storeId),
          eq(discounts.code, code),
          eq(discounts.isActive, true),
          or(isNull(discounts.startsAt), lte(discounts.startsAt, now)),
          or(isNull(discounts.expiresAt), gte(discounts.expiresAt, now)),
        ),
      )
      .limit(1);

    if (!discount) {
      return 0;
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return 0;
    }

    if (discount.minOrderAmount && options.subtotal < discount.minOrderAmount) {
      return 0;
    }

    if (discount.type === "fixed") {
      return Math.min(discount.value, options.subtotal);
    }

    const percentage = Math.min(discount.value, 100);
    let calculated = Math.round((options.subtotal * percentage) / 100);
    if (discount.maxDiscountAmount) {
      calculated = Math.min(calculated, discount.maxDiscountAmount);
    }

    return calculated;
  }
}
