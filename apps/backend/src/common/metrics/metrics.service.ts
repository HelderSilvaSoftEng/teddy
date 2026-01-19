import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, register, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestTotal: Counter;
  private readonly apiErrorsTotal: Counter;
  private readonly databaseConnectionsActive: Gauge;

  constructor() {
    // Coleta métricas padrão do Node.js
    collectDefaultMetrics();

    // Duração das requisições HTTP
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    // Total de requisições HTTP
    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // Total de erros de API
    this.apiErrorsTotal = new Counter({
      name: 'api_errors_total',
      help: 'Total number of API errors',
      labelNames: ['error_type', 'route'],
    });

    // Conexões ativas com banco de dados
    this.databaseConnectionsActive = new Gauge({
      name: 'database_connections_active',
      help: 'Number of active database connections',
      labelNames: ['database'],
    });
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationSeconds: number,
  ): void {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(durationSeconds);

    this.httpRequestTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  recordApiError(errorType: string, route: string): void {
    this.apiErrorsTotal.labels(errorType, route).inc();
  }

  setDatabaseConnections(database: string, count: number): void {
    this.databaseConnectionsActive.labels(database).set(count);
  }

  async getMetrics(): Promise<string> {
    return await register.metrics();
  }
}
