import { Injectable, Inject, Logger } from '@nestjs/common';
import { trace, context } from '@opentelemetry/api';
import type { IDashboardRepositoryPort } from '../../domain/ports/dashboard.repository.port';
import { DASHBOARD_REPOSITORY_TOKEN } from '../../domain/ports/dashboard.repository.port';
import type { ICurrentUser } from '../../../authentication/domain/types';

@Injectable()
export class GetCustomerTrendByMonthUseCase {
  private readonly logger = new Logger(GetCustomerTrendByMonthUseCase.name);
  private readonly tracer = trace.getTracer('dashboard-service');

  constructor(
    @Inject(DASHBOARD_REPOSITORY_TOKEN)
    private readonly dashboardRepository: IDashboardRepositoryPort,
  ) {}

  async execute(user: ICurrentUser, months = 12): Promise<Array<{ month: string; total: number }>> {
    const parsedMonths = Math.min(months, 24); // Máximo 24 meses

    return this.tracer.startActiveSpan('get_customer_trend_by_month', async (span) => {
      try {
        this.logger.log(
          `[GetCustomerTrendByMonthUseCase] Fetching customer trend for ${parsedMonths} months - usuário: ${user.id}`,
        );

        span.setAttributes({
          'user.id': user.id,
          'user.email': user.email,
          'months': parsedMonths,
          'span.kind': 'INTERNAL',
          'component': 'use-case',
        });

        const trend = await this.dashboardRepository.getCustomerTrendByMonth(parsedMonths);

        span.setAttributes({
          'result.records': trend.length,
        });

        this.logger.log(
          `[GetCustomerTrendByMonthUseCase] Successfully fetched ${trend.length} months of data`,
        );

        return trend;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `[GetCustomerTrendByMonthUseCase] Error fetching customer trend: ${errorMessage}`,
        );
        span.recordException(new Error(errorMessage));
        throw error;
      }
    });
  }
}
