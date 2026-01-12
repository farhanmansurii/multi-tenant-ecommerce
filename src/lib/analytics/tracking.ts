"use client";

import { useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

interface TrackingEvent {
  eventType: string;
  productId?: string;
  variantId?: string;
  orderId?: string;
  quantity?: number;
  value?: number;
  currency?: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  url?: string;
}

// Generate a session ID for the current browser session
function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

// Get or create a user ID (stored in localStorage for persistence)
function getUserId(): string | undefined {
  if (typeof window === "undefined") return undefined;

  let userId = localStorage.getItem("analytics_user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("analytics_user_id", userId);
  }
  return userId;
}

export function useAnalyticsTracking() {
  const params = useParams();
  const storeSlug = params?.slug as string;
  const isInitialized = useRef(false);

  // Initialize session tracking
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized.current && storeSlug) {
      isInitialized.current = true;

      // Track page view on initial load
      trackEvent({
        eventType: "page_view",
        url: window.location.href,
        referrer: document.referrer,
      });
    }
  }, [storeSlug]);

  const trackEvent = useCallback(
    async (event: TrackingEvent) => {
      if (!storeSlug) {
        console.warn("Analytics: No store slug available for tracking");
        return;
      }

      try {
        const trackingData = {
          eventType: event.eventType,
          userId: getUserId(),
          sessionId: getSessionId(),
          productId: event.productId,
          variantId: event.variantId,
          orderId: event.orderId,
          quantity: event.quantity,
          value: event.value,
          currency: event.currency || "INR",
          metadata: event.metadata,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          referrer: event.referrer,
          url: event.url,
        };

        // Send tracking data to API
        const response = await fetch(`/api/stores/${storeSlug}/analytics`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(trackingData),
        });

        if (!response.ok) {
          console.warn("Analytics tracking failed:", await response.text());
        }
      } catch (error) {
        // Silently fail analytics tracking to avoid breaking user experience
        console.warn("Analytics tracking error:", error);
      }
    },
    [storeSlug]
  );

  return { trackEvent };
}

// Utility function for tracking events from server components
export async function trackAnalyticsEvent(
  storeSlug: string,
  event: Omit<TrackingEvent, "userAgent" | "referrer" | "url">
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/stores/${storeSlug}/analytics`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...event,
          userId: undefined, // Server-side doesn't have user context
          sessionId: `server_${Date.now()}`,
          currency: event.currency || "INR",
        }),
      }
    );

    if (!response.ok) {
      console.warn("Server analytics tracking failed:", await response.text());
    }
  } catch (error) {
    console.warn("Server analytics tracking error:", error);
  }
}
