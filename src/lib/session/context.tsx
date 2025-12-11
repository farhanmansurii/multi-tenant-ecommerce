"use client";

import React, { useEffect, ReactNode } from "react";
import { useSession } from "../auth/client";
import { useSessionStore } from "../state/auth/session-store";

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { data: session, isPending } = useSession();
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    setSession(session, isPending);
  }, [session, isPending, setSession]);

  return <>{children}</>;
}

export function useSessionContext() {
  return useSessionStore();
}

// Convenience hooks for common use cases
export function useAuth() {
  const { isAuthenticated, user, isPending } = useSessionStore();
  return { isAuthenticated, user, isPending };
}

export function useUser() {
  const { user, isPending } = useSessionStore();
  return { user, isPending };
}

export function useRequireAuth() {
  const { isAuthenticated, isPending, user } = useSessionStore();

  if (isPending) {
    return {
      isAuthenticated: false,
      user: null,
      isPending: true,
      isLoading: true,
    };
  }

  return {
    isAuthenticated,
    user,
    isPending: false,
    isLoading: false,
  };
}

