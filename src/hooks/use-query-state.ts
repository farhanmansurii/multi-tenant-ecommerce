import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export interface QueryState<TData = unknown, TError = Error> {
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: TError | null;
  isSuccess: boolean;
  isEmpty: boolean;
}

export function useQueryState<TData = unknown, TError = Error>(
  query: UseQueryResult<TData, TError>
): QueryState<TData, TError> {
  const isEmpty =
    query.isSuccess &&
    (query.data === null ||
      query.data === undefined ||
      (Array.isArray(query.data) && query.data.length === 0) ||
      (typeof query.data === "object" &&
        Object.keys(query.data).length === 0));

  return {
    data: query.data,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error || null,
    isSuccess: query.isSuccess,
    isEmpty,
  };
}
