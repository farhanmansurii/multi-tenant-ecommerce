"use client";

import { type ReactNode, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/lib/session/context";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { createQueryClient } from "@/lib/query/config";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

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
