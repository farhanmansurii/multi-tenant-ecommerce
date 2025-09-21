
"use client";

import { type ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "@/lib/session-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SidebarProvider defaultOpen={true}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </SidebarProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
