import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const route = req.route?.path || req.path || 'unknown';
    const method = req.method;

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.metricsService.recordHttpRequest(
        method,
        route,
        res.statusCode,
        duration,
      );
    });

    next();
  }
}
