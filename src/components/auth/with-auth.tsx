"use client";

import { useRequireAuth } from '@/lib/session-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface WithAuthOptions {
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { redirectTo = '/', fallback = <div>Loading...</div> } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isPending, isLoading } = useRequireAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isPending && !isAuthenticated) {
        router.push(redirectTo);
      }
    }, [isAuthenticated, isPending, isLoading, router]);

    if (isLoading || isPending) {
      return <>{fallback}</>;
    }

    if (!isAuthenticated) {
      return null; // Will redirect
    }

    return <Component {...props} />;
  };
}

// Higher-order component for optional authentication
export function withOptionalAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function OptionalAuthComponent(props: P) {
    const { isPending } = useRequireAuth();

    if (isPending) {
      return <div>Loading...</div>;
    }

    return <Component {...props} />;
  };
}
