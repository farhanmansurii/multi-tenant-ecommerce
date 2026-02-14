import { and, eq } from "drizzle-orm";
import { carts, cartItems } from "@/lib/db/schema/ecommerce/cart";
import type { TransactionExecutor } from "@/lib/transactions/coordinator";

type CartRecord = typeof carts.$inferSelect;
type CartItemRecord = typeof cartItems.$inferSelect;

export interface CartValidationResult {
  cart: CartRecord;
  items: CartItemRecord[];
}

export class OrderValidator {
  async validate(
    executor: TransactionExecutor,
    storeId: string,
    cartId: string,
  ): Promise<CartValidationResult> {
    const [cart] = await executor
      .select()
      .from(carts)
      .where(and(eq(carts.id, cartId), eq(carts.storeId, storeId)))
      .limit(1);

    if (!cart) {
      throw new Error("Cart not found");
    }

    const items = await executor.select().from(cartItems).where(eq(cartItems.cartId, cartId));

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    return { cart, items };
  }
}
