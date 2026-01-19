import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MetricsService } from './metrics.service';
import { Public } from '../../decorators/public.decorator';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('📊 Métricas')
@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Public()
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Métricas em formato Prometheus Text Format',
    content: {
      'text/plain': {
        example: `# HELP http_requests_total Total de requisições HTTP
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/clients",status_code="200"} 42

# HELP http_request_duration_seconds Duração das requisições HTTP
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/api/clients",le="0.1"} 35
http_request_duration_seconds_sum{method="GET",route="/api/clients"} 8.5
http_request_duration_seconds_count{method="GET",route="/api/clients"} 42`,
      },
    },
  })
  async metrics(@Res() res: Response): Promise<void> {
    const metrics = await this.metricsService.getMetrics();
    
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
  }
}
