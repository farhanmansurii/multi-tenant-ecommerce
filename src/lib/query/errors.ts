export class QueryError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "QueryError";
  }
}

export class NotFoundError extends QueryError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends QueryError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends QueryError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export function isQueryError(error: unknown): error is QueryError {
  return error instanceof QueryError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof QueryError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof QueryError) {
    return error.status;
  }
  return undefined;
}
