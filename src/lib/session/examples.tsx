// Example usage of the session management system

import React from 'react';
import { useSessionContext, useAuth, useUser, useRequireAuth } from './context';
import { withAuth, withOptionalAuth } from '@/components/features/auth/with-auth';
import { requireAuthOrNull, getUser } from './helpers';

// Example 1: Using the basic session context
function BasicSessionExample() {
  const { isPending, isAuthenticated, user } = useSessionContext();

  if (isPending) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name || user?.email}!</p>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
}

// Example 2: Using the auth hook for authentication checks
function AuthExample() {
  const { isAuthenticated, user, isPending } = useAuth();

  if (isPending) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <p>User ID: {user?.id}</p>
      ) : (
        <p>Not authenticated</p>
      )}
    </div>
  );
}

// Example 3: Using the user hook for user-specific data
function UserExample() {
  const { user, isPending } = useUser();

  if (isPending) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <p>No user data</p>
      )}
    </div>
  );
}

// Example 4: Using requireAuth for protected content
function ProtectedContent() {
  const { isAuthenticated, user, isPending, isLoading } = useRequireAuth();

  if (isLoading || isPending) return <div>Loading...</div>;

  if (!isAuthenticated) return <div>Access denied</div>;

  return <div>Protected content for {user?.name}</div>;
}

// Example 5: Using HOC for route protection
const ProtectedComponent = withAuth(function MyProtectedComponent() {
  return <div>This component is only visible to authenticated users</div>;
});

// Example 6: Using HOC for optional authentication
const OptionalAuthComponent = withOptionalAuth(function MyOptionalAuthComponent() {
  return <div>This component works with or without authentication</div>;
});

// Example 7: Server-side usage (in API routes or server components)
async function ServerExample() {
  // In API routes
  const session = await requireAuthOrNull();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // In server components
  const user = await getUser();

  return <div>Server-side user: {user?.name}</div>;
}

export {
  BasicSessionExample,
  AuthExample,
  UserExample,
  ProtectedContent,
  ProtectedComponent,
  OptionalAuthComponent,
  ServerExample
};
