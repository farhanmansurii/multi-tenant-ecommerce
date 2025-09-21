import { useEffect, useState } from 'react';

type DashboardParams = {
  slug: string;
};

export function useDashboardParams(params: Promise<DashboardParams>) {
  const [resolvedParams, setResolvedParams] = useState<DashboardParams | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const resolveParams = async () => {
      try {
        const resolved = await params;
        if (!isCancelled) {
          setResolvedParams(resolved);
          setIsLoading(false);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error resolving params:', error);
          setIsLoading(false);
        }
      }
    };

    resolveParams();

    return () => {
      isCancelled = true;
    };
  }, [params]);

  return {
    params: resolvedParams,
    isLoading,
    slug: resolvedParams?.slug || '',
  };
}
