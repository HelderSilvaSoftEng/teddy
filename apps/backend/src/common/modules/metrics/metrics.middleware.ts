import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

/**
 * MetricsMiddleware - Intercepta todas as requisições HTTP
 * Calcula tempo de resposta e registra no MetricsService
 */
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    
    // Extrair rota e método
    const route = req.route?.path || req.path || 'unknown';
    const method = req.method;

    // Interceptar evento de fim de resposta
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Registrar métrica HTTP
      this.metricsService.recordHttpRequest(
        method,
        route,
        res.statusCode,
        duration,
      );
    });

    // Continuar fluxo normal
    next();
  }
}
