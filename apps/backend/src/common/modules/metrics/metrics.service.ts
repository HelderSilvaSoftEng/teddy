import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

/**
 * MetricsService - Coleta e gerencia métricas Prometheus
 * 
 * Métricas coletadas:
 * - HTTP: requisições totais, latência por rota, status codes
 * - Banco de dados: duração de queries, conexões ativas
 * - Sistema: uptime, memória
 */
@Injectable()
export class MetricsService {
  /**
   * Métricas HTTP - Contador de requisições totais
   */
  private readonly httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total de requisições HTTP',
    labelNames: ['method', 'route', 'status_code'],
  });

  /**
   * Métricas HTTP - Histograma de latência
   * Agrupa em buckets: 1ms, 10ms, 100ms, 500ms, 1s, 2s, 5s
   */
  private readonly httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duração das requisições HTTP em segundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
  });

  /**
   * Métricas de Banco de Dados - Histograma de latência de queries
   */
  private readonly dbQueryDuration = new promClient.Histogram({
    name: 'db_query_duration_seconds',
    help: 'Duração de queries no banco de dados em segundos',
    labelNames: ['query_type', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
  });

  /**
   * Métricas de Banco de Dados - Conexões ativas
   */
  private readonly activeConnections = new promClient.Gauge({
    name: 'active_db_connections',
    help: 'Número de conexões ativas no banco de dados',
  });

  /**
   * Métricas do Sistema - Uptime da aplicação
   */
  private readonly uptime = new promClient.Gauge({
    name: 'process_uptime_seconds',
    help: 'Uptime da aplicação em segundos',
  });

  /**
   * Métricas HTTP - Erros totais
   */
  private readonly httpErrorsTotal = new promClient.Counter({
    name: 'http_errors_total',
    help: 'Total de erros HTTP (4xx e 5xx)',
    labelNames: ['method', 'route', 'status_code'],
  });

  constructor() {
    // Registrar métricas de sistema padrão do Prometheus
    promClient.collectDefaultMetrics();

    // Atualizar uptime a cada 10 segundos
    setInterval(() => {
      this.uptime.set(process.uptime());
    }, 10000);
  }

  /**
   * Registrar uma requisição HTTP
   * Chamado pelo middleware para cada requisição
   */
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

    // Contar requisição total
    this.httpRequestsTotal.inc(labels);

    // Registrar latência em histograma (converter para segundos)
    this.httpRequestDuration.observe(labels, duration / 1000);

    // Contar erros (4xx e 5xx)
    if (statusCode >= 400) {
      this.httpErrorsTotal.inc(labels);
    }
  }

  /**
   * Registrar uma query no banco de dados
   */
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
      duration / 1000, // converter para segundos
    );
  }

  /**
   * Atualizar número de conexões ativas
   */
  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }

  /**
   * Retornar todas as métricas no formato Prometheus
   * Usado por GET /metrics
   */
  async getMetrics(): Promise<string> {
    return promClient.register.metrics();
  }

  /**
   * Resetar todas as métricas (útil para testes)
   */
  reset(): void {
    promClient.register.resetMetrics();
  }
}
