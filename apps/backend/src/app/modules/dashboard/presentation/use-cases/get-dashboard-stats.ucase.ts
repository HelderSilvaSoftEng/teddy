import { Injectable, Logger, Inject } from '@nestjs/common';
import { getTracer } from '../../../../../app/telemetry';
import type { IDashboardRepositoryPort } from '../../domain/ports/dashboard.repository.port';
import { DASHBOARD_REPOSITORY_TOKEN } from '../../domain/ports/dashboard.repository.port';
import { DashboardStatsResponseDto } from '../../adapters/dtos/dashboard-stats.response.dto';
import type { ICurrentUser } from '../../../authentication/domain/types';

@Injectable()
export class GetDashboardStatsUseCase {
  private readonly logger = new Logger(GetDashboardStatsUseCase.name);
  private readonly tracer = getTracer();

  constructor(
    @Inject(DASHBOARD_REPOSITORY_TOKEN)
    private readonly dashboardRepository: IDashboardRepositoryPort,
  ) {}

  async execute(user: ICurrentUser): Promise<DashboardStatsResponseDto> {
    const span = this.tracer.startSpan('get_dashboard_stats_process', {
      attributes: {
        'user.id': user.id,
        'operation': 'GET_STATS',
      },
    });

    try {
      this.logger.log(`[GetDashboardStatsUseCase] Iniciando obtenção de estatísticas para usuário: ${user.id}`);

      const statsSpan = this.tracer.startSpan('query_dashboard_stats', { parent: span });
      const stats = await this.dashboardRepository.getDashboardStats();
      statsSpan.end();

      const result = new DashboardStatsResponseDto({
        totalUsers: stats.totalUsers,
        totalCustomers: stats.totalCustomers,
        totalAuditLogs: stats.totalAuditLogs,
        retrievedAt: new Date(),
      });

      span.setAttributes({
        'status': 200,
        'total.users': stats.totalUsers,
        'total.customers': stats.totalCustomers,
        'total.audits': stats.totalAuditLogs,
      });

      this.logger.log(
        `[GetDashboardStatsUseCase] Estatísticas obtidas com sucesso - Usuários: ${stats.totalUsers}, ` +
        `Clientes: ${stats.totalCustomers}, Auditorias: ${stats.totalAuditLogs}`,
      );

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[GetDashboardStatsUseCase] Erro ao obter estatísticas: ${errorMessage}`);
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  }
}
