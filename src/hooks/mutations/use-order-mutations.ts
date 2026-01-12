import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { invalidateOrderQueries } from "@/lib/query/utils";
import type { Order, OrderStatus } from "@/lib/domains/orders/types";
import { withBaseUrl } from "@/lib/utils/url";

export function useUpdateOrderStatus(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/orders/${orderId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to update order status");
      }

      const data = await response.json();
      return data.order as Order;
    },
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.detail(storeSlug, orderId) });

      const previousOrder = queryClient.getQueryData<Order>(
        queryKeys.orders.detail(storeSlug, orderId)
      );

      if (previousOrder) {
        queryClient.setQueryData<Order>(queryKeys.orders.detail(storeSlug, orderId), {
          ...previousOrder,
          status,
        });
      }

      return { previousOrder };
    },
    onSuccess: (order, { orderId }) => {
      queryClient.setQueryData(queryKeys.orders.detail(storeSlug, orderId), order);
      invalidateOrderQueries(queryClient, storeSlug, orderId);
      queryClient.refetchQueries({ queryKey: queryKeys.orders.all(storeSlug) });
      toast.success("Order status updated");
    },
    onError: (error: Error, _, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(
          queryKeys.orders.detail(storeSlug, context.previousOrder.id),
          context.previousOrder
        );
      }
      toast.error(error.message || "Failed to update order status");
    },
  });
}
