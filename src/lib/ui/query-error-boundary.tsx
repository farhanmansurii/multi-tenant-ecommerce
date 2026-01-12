"use client";

import { Component, type ReactNode } from "react";
import { ErrorState } from "@/components/features/dashboard/components/error-state";
import { getErrorMessage, getErrorStatus } from "@/lib/query/errors";

interface QueryErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface QueryErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class QueryErrorBoundary extends Component<
  QueryErrorBoundaryProps,
  QueryErrorBoundaryState
> {
  constructor(props: QueryErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): QueryErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("QueryErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      const status = getErrorStatus(this.state.error);
      const message = getErrorMessage(this.state.error);

      if (status === 404) {
        return (
          <ErrorState
            title="Not Found"
            message={message || "The requested resource could not be found."}
          />
        );
      }

      if (status === 401 || status === 403) {
        return (
          <ErrorState
            title="Access Denied"
            message={message || "You don't have permission to access this resource."}
            showPermissionAlert={true}
          />
        );
      }

      return (
        <ErrorState
          title="Something went wrong"
          message={message || "An unexpected error occurred. Please try again."}
        />
      );
    }

    return this.props.children;
  }
}
