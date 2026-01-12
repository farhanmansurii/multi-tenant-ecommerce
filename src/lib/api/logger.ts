type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage("info", message, context);
    console.log(formatted);
    // In production, you might want to send to a logging service
    // e.g., Sentry, LogRocket, DataDog, etc.
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage("warn", message, context);
    console.warn(formatted);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : error,
    };
    const formatted = this.formatMessage("error", message, errorContext);
    console.error(formatted);

    // In production, send to error tracking service
    // if (process.env.NODE_ENV === "production") {
    //   Sentry.captureException(error, { extra: context });
    // }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage("debug", message, context);
      console.debug(formatted);
    }
  }
}

export const logger = new Logger();
