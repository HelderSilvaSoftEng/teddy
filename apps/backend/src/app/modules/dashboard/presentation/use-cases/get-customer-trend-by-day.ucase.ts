import { Injectable, Inject, Logger } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import type { IDashboardRepositoryPort } from '../../domain/ports/dashboard.repository.port';
import { DASHBOARD_REPOSITORY_TOKEN } from '../../domain/ports/dashboard.repository.port';
import type { ICurrentUser } from '../../../authentication/domain/types';

@Injectable()
export class GetCustomerTrendByDayUseCase {
  private readonly logger = new Logger(GetCustomerTrendByDayUseCase.name);
  private readonly tracer = trace.getTracer('dashboard-service');

  constructor(
    @Inject(DASHBOARD_REPOSITORY_TOKEN)
    private readonly dashboardRepository: IDashboardRepositoryPort,
  ) {}

  async execute(user: ICurrentUser, days = 30): Promise<Array<{ day: string; total: number }>> {
    const parsedDays = Math.min(days, 365); // Máximo 365 dias

    return this.tracer.startActiveSpan('get_customer_trend_by_day', async (span) => {
      try {
        this.logger.log(
          `[GetCustomerTrendByDayUseCase] Fetching customer trend for ${parsedDays} days - usuário: ${user.id}`,
        );

        span.setAttributes({
          'user.id': user.id,
          'user.email': user.email,
          'days': parsedDays,
          'span.kind': 'INTERNAL',
          'component': 'use-case',
        });

        const trend = await this.dashboardRepository.getCustomerTrendByDay(parsedDays);

        span.setAttributes({
          'result.records': trend.length,
        });

        this.logger.log(
          `[GetCustomerTrendByDayUseCase] Successfully fetched ${trend.length} days of data`,
        );

        return trend;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `[GetCustomerTrendByDayUseCase] Error fetching customer trend: ${errorMessage}`,
        );
        span.recordException(new Error(errorMessage));
        throw error;
      }
    });
  }
}
