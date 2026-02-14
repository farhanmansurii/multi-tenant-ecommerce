## ADDED Requirements

### Requirement: Middleware pipeline composes cross-cutting concerns

The `composeMiddleware` utility SHALL accept an ordered list of middleware (auth, rate-limit, validate, errorCapture) and the route handler so that each middleware executes before the handler and can short-circuit the request.

#### Scenario: Auth failure stops the pipeline

- **WHEN** a request reaches a dashboard route without a valid session
- **THEN** the auth middleware terminates the pipeline with a 401 response and none of the downstream middleware or the handler run

#### Scenario: Successful middleware chain reaches handler

- **WHEN** a request passes auth, rate-limit, and validation checks
- **THEN** the pipeline invokes the route handler with the composed context objects and the handler returns the normal response
