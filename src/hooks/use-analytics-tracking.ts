import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAnalyticsTracking } from "@/lib/analytics/tracking";

interface TrackingEvent {
  eventType: string;
  productId?: string;
  variantId?: string;
  orderId?: string;
  quantity?: number;
  value?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export function useAnalytics() {
  const { trackEvent } = useAnalyticsTracking();
  const pathname = usePathname();

  const track = useCallback(
    (event: TrackingEvent) => {
      trackEvent({
        ...event,
        url: pathname,
        referrer: document.referrer,
      });
    },
    [trackEvent, pathname]
  );

  const trackProductView = useCallback(
    (productId: string, variantId?: string) => {
      track({
        eventType: "view_product",
        productId,
        variantId,
      });
    },
    [track]
  );

  const trackAddToCart = useCallback(
    (productId: string, variantId?: string, quantity: number = 1, value?: number) => {
      track({
        eventType: "add_to_cart",
        productId,
        variantId,
        quantity,
        value,
      });
    },
    [track]
  );

  const trackRemoveFromCart = useCallback(
    (productId: string, variantId?: string, quantity: number = 1) => {
      track({
        eventType: "remove_from_cart",
        productId,
        variantId,
        quantity,
      });
    },
    [track]
  );

  const trackCheckoutStart = useCallback(
    (orderId?: string, value?: number, currency: string = "INR") => {
      track({
        eventType: "checkout_start",
        orderId,
        value,
        currency,
      });
    },
    [track]
  );

  const trackPurchase = useCallback(
    (orderId: string, value: number, currency: string = "INR", metadata?: Record<string, any>) => {
      track({
        eventType: "purchase",
        orderId,
        value,
        currency,
        metadata,
      });
    },
    [track]
  );

  const trackSearch = useCallback(
    (query: string, resultsCount?: number) => {
      track({
        eventType: "search",
        metadata: {
          query,
          resultsCount,
        },
      });
    },
    [track]
  );

  return {
    track,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckoutStart,
    trackPurchase,
    trackSearch,
  };
}
