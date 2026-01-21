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

      // 1️⃣ Query de total de usuários
      const dbQueryUsersSpan = this.tracer.startSpan('db_query_users', { parent: span });
      const totalUsers = await this.dashboardRepository.getTotalUsers();
      dbQueryUsersSpan.end();

      // 2️⃣ Query de total de clientes
      const dbQueryCustomersSpan = this.tracer.startSpan('db_query_customers', { parent: span });
      const totalCustomers = await this.dashboardRepository.getTotalCustomers();
      dbQueryCustomersSpan.end();

      // 3️⃣ Query de total de auditoria
      const dbQueryAuditsSpan = this.tracer.startSpan('db_query_audits', { parent: span });
      const totalAuditLogs = await this.dashboardRepository.getTotalAuditLogs();
      dbQueryAuditsSpan.end();

      const result = new DashboardStatsResponseDto({
        totalUsers,
        totalCustomers,
        totalAuditLogs,
        retrievedAt: new Date(),
      });

      span.setAttributes({
        'status': 200,
        'total.users': totalUsers,
        'total.customers': totalCustomers,
        'total.audits': totalAuditLogs,
      });

      this.logger.log(
        `[GetDashboardStatsUseCase] Estatísticas obtidas com sucesso - Usuários: ${totalUsers}, ` +
        `Clientes: ${totalCustomers}, Auditorias: ${totalAuditLogs}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`[GetDashboardStatsUseCase] Erro ao obter estatísticas: ${error.message}`);
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }
}
