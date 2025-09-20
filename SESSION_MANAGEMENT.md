# Session Management System

This document explains the comprehensive session management system that eliminates the need to repeatedly fetch session details throughout your application.

## Overview

The session management system provides:
- **Client-side**: React Context-based session management with custom hooks
- **Server-side**: Cached session helpers for API routes and server components
- **Route Protection**: Higher-order components for protecting routes
- **Performance**: Automatic caching and optimized re-renders

## Client-Side Usage

### 1. SessionProvider Setup

The `SessionProvider` is already set up in your root layout (`src/app/layout.tsx`). This provides session context to all components in your app.

### 2. Available Hooks

#### `useSessionContext()`
The main hook that provides all session data:

```tsx
import { useSessionContext } from '@/lib/session-context';

function MyComponent() {
  const { session, isPending, isAuthenticated, user } = useSessionContext();

  if (isPending) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
}
```

#### `useAuth()`
Simplified hook for authentication checks:

```tsx
import { useAuth } from '@/lib/session-context';

function MyComponent() {
  const { isAuthenticated, user, isPending } = useAuth();

  if (isPending) return <div>Loading...</div>;

  return isAuthenticated ? <p>Hello {user?.name}!</p> : <p>Not logged in</p>;
}
```

#### `useUser()`
Hook focused on user data:

```tsx
import { useUser } from '@/lib/session-context';

function UserProfile() {
  const { user, isPending } = useUser();

  if (isPending) return <div>Loading...</div>;

  return user ? (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  ) : (
    <p>No user data</p>
  );
}
```

#### `useRequireAuth()`
Hook for components that require authentication:

```tsx
import { useRequireAuth } from '@/lib/session-context';

function ProtectedComponent() {
  const { isAuthenticated, user, isPending, isLoading } = useRequireAuth();

  if (isLoading || isPending) return <div>Loading...</div>;

  if (!isAuthenticated) return <div>Access denied</div>;

  return <div>Protected content for {user?.name}</div>;
}
```

### 3. Higher-Order Components

#### `withAuth()`
Protects components that require authentication:

```tsx
import { withAuth } from '@/components/auth/with-auth';

const ProtectedComponent = withAuth(function MyComponent() {
  return <div>This is only visible to authenticated users</div>;
});

// With custom options
const CustomProtectedComponent = withAuth(
  function MyComponent() {
    return <div>Protected content</div>;
  },
  {
    redirectTo: '/login',
    fallback: <div>Checking authentication...</div>
  }
);
```

#### `withOptionalAuth()`
For components that work with or without authentication:

```tsx
import { withOptionalAuth } from '@/components/auth/with-auth';

const OptionalAuthComponent = withOptionalAuth(function MyComponent() {
  return <div>Works for both authenticated and non-authenticated users</div>;
});
```

## Server-Side Usage

### 1. Available Functions

#### `getSession()`
Get session without redirecting (useful for conditional rendering):

```tsx
import { getSession } from '@/lib/session-helpers';

export default async function MyServerComponent() {
  const session = await getSession();

  return (
    <div>
      {session ? (
        <p>Welcome, {session.user.name}!</p>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
}
```

#### `requireAuth()`
Require authentication and redirect if not authenticated:

```tsx
import { requireAuth } from '@/lib/session-helpers';

export default async function ProtectedServerComponent() {
  const session = await requireAuth(); // Will redirect if not authenticated

  return <div>Protected content for {session.user.name}</div>;
}
```

#### `requireAuthOrNull()`
For API routes - returns null if not authenticated:

```tsx
import { requireAuthOrNull } from '@/lib/session-helpers';

export async function POST(request: Request) {
  const session = await requireAuthOrNull();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Process authenticated request
  return Response.json({ success: true });
}
```

#### `isAuthenticated()`
Check authentication status:

```tsx
import { isAuthenticated } from '@/lib/session-helpers';

export default async function MyComponent() {
  const isAuth = await isAuthenticated();

  return <div>{isAuth ? 'Logged in' : 'Not logged in'}</div>;
}
```

#### `getUser()`
Get user data safely:

```tsx
import { getUser } from '@/lib/session-helpers';

export default async function UserComponent() {
  const user = await getUser();

  return user ? <div>Hello {user.name}!</div> : <div>No user</div>;
}
```

## Migration Guide

### Before (Old Pattern)
```tsx
// ❌ Old way - repeated useSession calls
import { useSession } from '@/lib/auth-client';

function Component1() {
  const { data: session, isPending } = useSession();
  // ...
}

function Component2() {
  const { data: session, isPending } = useSession();
  // ...
}
```

### After (New Pattern)
```tsx
// ✅ New way - use context hooks
import { useAuth } from '@/lib/session-context';

function Component1() {
  const { isAuthenticated, user, isPending } = useAuth();
  // ...
}

function Component2() {
  const { isAuthenticated, user, isPending } = useAuth();
  // ...
}
```

## Performance Benefits

1. **Single Session Fetch**: Session is fetched once and shared via context
2. **Automatic Caching**: Server-side sessions are cached per request
3. **Optimized Re-renders**: Only components using session data re-render when it changes
4. **Reduced API Calls**: No duplicate session requests

## Best Practices

1. **Use Specific Hooks**: Use `useAuth()`, `useUser()`, or `useRequireAuth()` instead of `useSessionContext()` when you only need specific data
2. **Server vs Client**: Use server-side helpers in API routes and server components, client-side hooks in client components
3. **Error Handling**: Always check loading states before accessing user data
4. **Route Protection**: Use `withAuth()` HOC for entire pages that need protection

## Examples

See `src/lib/session-examples.tsx` for comprehensive usage examples.

## Troubleshooting

### Common Issues

1. **"useSessionContext must be used within a SessionProvider"**
   - Make sure your component is wrapped by `SessionProvider` in the root layout

2. **Session not updating**
   - The session context automatically updates when authentication state changes

3. **Server-side session not working**
   - Make sure you're using the server-side helpers (`getSession`, `requireAuth`, etc.) in server components and API routes

### Debug Tips

- Use `useSessionContext()` to see all available session data
- Check the browser's Network tab to see if session requests are being made
- Use React DevTools to inspect the SessionContext value
