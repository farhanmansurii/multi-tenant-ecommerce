"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession as useBetterAuthSession } from '@/lib/auth-client';

interface User {
  id: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

interface Session {
  user: User;
  [key: string]: unknown;
}

interface SessionContextType {
  session: Session | null;
  isPending: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { data: session, isPending } = useBetterAuthSession();

  const value: SessionContextType = {
    session,
    isPending,
    isAuthenticated: !!session?.user,
    user: session?.user || null,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
}

// Convenience hooks for common use cases
export function useAuth() {
  const { isAuthenticated, user, isPending } = useSessionContext();
  return { isAuthenticated, user, isPending };
}

export function useUser() {
  const { user, isPending } = useSessionContext();
  return { user, isPending };
}

export function useRequireAuth() {
  const { isAuthenticated, isPending, user } = useSessionContext();

  if (isPending) {
    return { isAuthenticated: false, user: null, isPending: true, isLoading: true };
  }

  return {
    isAuthenticated,
    user,
    isPending: false,
    isLoading: false
  };
}
