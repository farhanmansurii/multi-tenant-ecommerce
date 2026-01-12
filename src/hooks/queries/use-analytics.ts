import { useQuery } from "@tanstack/react-query";

interface AnalyticsQueryParams {
  startDate?: Date;
  endDate?: Date;
  period?: "day" | "week" | "month";
}

export function useAnalytics(
  storeSlug: string | null,
  params: AnalyticsQueryParams = {}
) {
  return useQuery({
    queryKey: ["analytics", storeSlug, params],
    queryFn: async () => {
      if (!storeSlug) {
        throw new Error("Store slug is required");
      }

      const searchParams = new URLSearchParams();

      if (params.startDate) {
        searchParams.set("startDate", params.startDate.toISOString());
      }

      if (params.endDate) {
        searchParams.set("endDate", params.endDate.toISOString());
      }

      if (params.period) {
        searchParams.set("period", params.period);
      }

      const response = await fetch(`/api/stores/${storeSlug}/analytics?${searchParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      return response.json();
    },
    enabled: !!storeSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRecentActivity(storeSlug: string | null, limit = 10) {
  return useQuery({
    queryKey: ["recent-activity", storeSlug, limit],
    queryFn: async () => {
      if (!storeSlug) {
        throw new Error("Store slug is required");
      }

      const response = await fetch(`/api/stores/${storeSlug}/analytics/recent-activity?limit=${limit}`);

      if (!response.ok) {
        throw new Error("Failed to fetch recent activity");
      }

      return response.json();
    },
    enabled: !!storeSlug,
    staleTime: 60 * 1000, // 1 minute - more frequent updates for activity
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
