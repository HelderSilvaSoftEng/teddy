import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from '../../decorators/public.decorator';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: {
    status: 'up' | 'down';
    responseTime?: number;
    error?: string;
  };
}

@ApiTags('🏥 Health')
@Controller('health')
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Aplicação está saudável',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-01-18T10:30:00Z',
        uptime: 3600,
        database: {
          status: 'up',
          responseTime: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Banco de dados indisponível',
  })
  async check(): Promise<HealthCheckResponse> {
    const dbStart = Date.now();
    let dbStatus: 'up' | 'down' = 'down';
    let dbError: string | undefined;
    let dbResponseTime = 0;

    try {
      await this.dataSource.query('SELECT 1');
      dbStatus = 'up';
      dbResponseTime = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'down';
      dbError = error instanceof Error ? error.message : 'Unknown error';
    }

    const isHealthy = dbStatus === 'up';
    const statusCode = isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    if (!isHealthy) {
      this.constructor.prototype.getResponse = () => statusCode;
    }

    return {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
        ...(dbError && { error: dbError }),
      },
    };
  }

  @Public()
  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Aplicação está viva',
  })
  async liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Aplicação está pronta',
  })
  @ApiResponse({
    status: 503,
    description: 'Aplicação ainda não está pronta',
  })
  async readiness() {
    const dbStart = Date.now();

    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ready',
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      throw {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database not ready',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
