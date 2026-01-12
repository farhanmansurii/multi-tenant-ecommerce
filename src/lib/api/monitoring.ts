/**
 * Production monitoring utilities
 *
 * In production, integrate with services like:
 * - Sentry for error tracking
 * - DataDog/New Relic for APM
 * - LogRocket for session replay
 * - Vercel Analytics for web vitals
 */

export interface PerformanceMetrics {
  route: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: number;
}

class Monitoring {
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 1000;

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only recent metrics in memory
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === "production") {
      // Example: Send to monitoring service
      // monitoringService.record(metric);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageResponseTime(route?: string): number {
    const filtered = route
      ? this.metrics.filter((m) => m.route === route)
      : this.metrics;

    if (filtered.length === 0) return 0;

    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }
}

export const monitoring = new Monitoring();
