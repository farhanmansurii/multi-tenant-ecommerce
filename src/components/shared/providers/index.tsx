"use client";

import { type ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/lib/session/context";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

// Configure QueryClient with proper caching to reduce unnecessary re-fetches
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 30 minutes
        gcTime: 30 * 60 * 1000,
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
        // Retry failed requests once
        retry: 1,
        // Don't refetch on reconnect automatically
        refetchOnReconnect: false,
      },
    },
  });
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}


          <ProgressBar
            height="3px"
            color="#6366f1" // Indigo-500 (Matches your branding)
            options={{ showSpinner: false }} // Spinners look dated, bars look pro
            shallowRouting
          />

        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
