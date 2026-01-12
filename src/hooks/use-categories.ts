'use client';

import { Category } from '@/lib/db/schema';
import { fetchCategories } from '@/lib/domains/products/category-service';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { defaultQueryOptions } from '@/lib/query/defaults';

type UseCategoriesOptions = Omit<
	UseQueryOptions<Category[], Error>,
	'queryKey' | 'queryFn' | 'enabled'
>;

export function useCategories(
	storeSlug: string | null | undefined,
	options?: UseCategoriesOptions
) {
	const enabled = Boolean(storeSlug);

	return useQuery({
		queryKey: queryKeys.categories.all(storeSlug || ''),
		queryFn: () => {
			if (!storeSlug) {
				throw new Error('Store slug is required');
			}
			return fetchCategories(storeSlug);
		},
		enabled,
		...defaultQueryOptions,
		...options,
	});
}

export const categoriesQueryKey = (storeSlug: string | null | undefined) =>
	queryKeys.categories.all(storeSlug || '');
