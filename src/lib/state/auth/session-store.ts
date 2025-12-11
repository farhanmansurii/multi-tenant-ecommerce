import { create } from 'zustand';

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

interface SessionState {
  session: Session | null;
  user: User | null;
  isPending: boolean;
  isAuthenticated: boolean;

  // Actions
  setSession: (session: Session | null, isPending: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  user: null,
  isPending: true,
  isAuthenticated: false,

  setSession: (session, isPending) => {
    set({
      session,
      user: session?.user || null,
      isPending,
      isAuthenticated: !!session?.user,
    });
  },
}));
