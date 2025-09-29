'use client';

import { Category } from '@/lib/db/schema';
import { fetchCategories } from '@/lib/services/category';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';



export const categoriesQueryKey = (storeSlug: string | null | undefined) => [
	'categories',
	storeSlug ?? '',
];

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
		queryKey: categoriesQueryKey(storeSlug),
		queryFn: () => {
			if (!storeSlug) {
				throw new Error('Missing store slug for category query');
			}

			return fetchCategories(storeSlug);
		},
		enabled,
		...options,
	});
}
