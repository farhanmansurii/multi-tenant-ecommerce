import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

export const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 2,
} satisfies Partial<UseQueryOptions<unknown, Error>>;

export const defaultMutationOptions = {
  retry: 1,
  retryDelay: 1000,
} satisfies Partial<UseMutationOptions<unknown, Error, unknown>>;

export const longStaleTime = 10 * 60 * 1000;

export const shortStaleTime = 1 * 60 * 1000;
