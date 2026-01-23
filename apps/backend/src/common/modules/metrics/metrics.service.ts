import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total de requisições HTTP',
    labelNames: ['method', 'route', 'status_code'],
  });

  private readonly httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duração das requisições HTTP em segundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
  });

  private readonly dbQueryDuration = new promClient.Histogram({
    name: 'db_query_duration_seconds',
    help: 'Duração de queries no banco de dados em segundos',
    labelNames: ['query_type', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
  });

  private readonly activeConnections = new promClient.Gauge({
    name: 'active_db_connections',
    help: 'Número de conexões ativas no banco de dados',
  });

  private readonly uptime = new promClient.Gauge({
    name: 'process_uptime_seconds',
    help: 'Uptime da aplicação em segundos',
  });

  private readonly httpErrorsTotal = new promClient.Counter({
    name: 'http_errors_total',
    help: 'Total de erros HTTP (4xx e 5xx)',
    labelNames: ['method', 'route', 'status_code'],
  });

  constructor() {
    promClient.collectDefaultMetrics();

    setInterval(() => {
      this.uptime.set(process.uptime());
    }, 10000);
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    const labels = {
      method,
      route: route || 'unknown',
      status_code: statusCode,
    };

    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(labels, duration / 1000);

    if (statusCode >= 400) {
      this.httpErrorsTotal.inc(labels);
    }
  }

  recordDbQuery(
    queryType: string,
    duration: number,
    status: 'success' | 'error',
  ): void {
    this.dbQueryDuration.observe(
      {
        query_type: queryType,
        status,
      },
      duration / 1000,
    );
  }

  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }

  async getMetrics(): Promise<string> {
    return promClient.register.metrics();
  }

  reset(): void {
    promClient.register.resetMetrics();
  }
}
