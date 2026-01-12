import type { QueryClient } from "@tanstack/react-query";

export interface OptimisticUpdateContext<TData = unknown> {
  previousData?: TData;
  queryKey: readonly unknown[];
}

export interface OptimisticUpdateOptions<TData = unknown, TVariables = unknown> {
  queryClient: QueryClient;
  queryKey: readonly unknown[];
  updateFn: (variables: TVariables, previousData?: TData) => TData;
  onError?: (error: Error, context: OptimisticUpdateContext<TData>) => void;
}

export function createOptimisticUpdate<TData = unknown, TVariables = unknown>(
  options: OptimisticUpdateOptions<TData, TVariables>
) {
  const { queryClient, queryKey, updateFn, onError } = options;

  return {
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<TData>(queryKey);

      queryClient.setQueryData<TData>(queryKey, (old) =>
        updateFn(variables, old)
      );

      return { previousData, queryKey };
    },
    onError: (error: Error, variables: TVariables, context: OptimisticUpdateContext<TData> | undefined) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      onError?.(error, context || { queryKey });
    },
  };
}
