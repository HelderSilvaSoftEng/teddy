import { Injectable, Logger, Inject } from '@nestjs/common';
import { getTracer } from '../../../../../app/telemetry';
import type { IDashboardRepositoryPort } from '../../domain/ports/dashboard.repository.port';
import { DASHBOARD_REPOSITORY_TOKEN } from '../../domain/ports/dashboard.repository.port';
import { RecentCustomerResponseDto } from '../../adapters/dtos/recent-user.response.dto';
import type { ICurrentUser } from '../../../authentication/domain/types';

@Injectable()
export class GetRecentCustomersUseCase {
  private readonly logger = new Logger(GetRecentCustomersUseCase.name);
  private readonly tracer = getTracer();

  constructor(
    @Inject(DASHBOARD_REPOSITORY_TOKEN)
    private readonly dashboardRepository: IDashboardRepositoryPort,
  ) {}

  async execute(user: ICurrentUser, limit = 5): Promise<RecentCustomerResponseDto[]> {
    const span = this.tracer.startSpan('get_recent_customers_process', {
      attributes: {
        'user.id': user.id,
        'operation': 'GET_RECENT_CUSTOMERS',
        'limit': limit,
      },
    });

    try {
      this.logger.log(`[GetRecentCustomersUseCase] Obtendo ${limit} clientes recentes para usuário: ${user.id}`);

      const dbQuerySpan = this.tracer.startSpan('query_recent_customers', { parent: span });
      const recentCustomers = await this.dashboardRepository.getRecentCustomers(limit);
      dbQuerySpan.end();

      const result = recentCustomers.map(
        customer => new RecentCustomerResponseDto({
          id: customer.id,
          name: customer.name,
          company: customer.company,
          createdAt: customer.createdAt,
        }),
      );

      span.setAttributes({
        'status': 200,
        'customers.count': result.length,
      });

      this.logger.log(
        `[GetRecentCustomersUseCase] ${result.length} clientes recentes obtidos com sucesso`,
      );

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[GetRecentCustomersUseCase] Erro ao obter clientes recentes: ${errorMessage}`);
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  }
}
