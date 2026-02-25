import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { invalidateOrderQueries } from "@/lib/query/utils";
import type { Order, OrderStatus } from "@/lib/domains/orders/types";
import { withBaseUrl } from "@/lib/utils/url";
import { parseApiResponse } from "@/lib/query/api-response";

export function useUpdateOrderStatus(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/orders/${orderId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await parseApiResponse<{ order: Order }>(response, "Failed to update order status");
      return data.order;
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
      void queryClient.refetchQueries({ queryKey: queryKeys.orders.all(storeSlug) });
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
