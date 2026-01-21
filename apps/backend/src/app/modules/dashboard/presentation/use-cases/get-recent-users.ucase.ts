import { Injectable, Logger, Inject } from '@nestjs/common';
import { getTracer } from '../../../../../app/telemetry';
import type { IDashboardRepositoryPort } from '../../domain/ports/dashboard.repository.port';
import { DASHBOARD_REPOSITORY_TOKEN } from '../../domain/ports/dashboard.repository.port';
import { RecentUserResponseDto } from '../../adapters/dtos/recent-user.response.dto';
import type { ICurrentUser } from '../../../authentication/domain/types';

@Injectable()
export class GetRecentUsersUseCase {
  private readonly logger = new Logger(GetRecentUsersUseCase.name);
  private readonly tracer = getTracer();

  constructor(
    @Inject(DASHBOARD_REPOSITORY_TOKEN)
    private readonly dashboardRepository: IDashboardRepositoryPort,
  ) {}

  async execute(user: ICurrentUser, limit = 5): Promise<RecentUserResponseDto[]> {
    const span = this.tracer.startSpan('get_recent_users_process', {
      attributes: {
        'user.id': user.id,
        'operation': 'GET_RECENT_USERS',
        'limit': limit,
      },
    });

    try {
      this.logger.log(`[GetRecentUsersUseCase] Obtendo ${limit} usuários recentes para usuário: ${user.id}`);

      // 1️⃣ Query de usuários recentes
      const dbQuerySpan = this.tracer.startSpan('db_query_recent_users', { parent: span });
      const recentUsers = await this.dashboardRepository.getRecentUsers(limit);
      dbQuerySpan.end();

      const result = recentUsers.map(
        user => new RecentUserResponseDto({
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        }),
      );

      span.setAttributes({
        'status': 200,
        'users.count': result.length,
      });

      this.logger.log(
        `[GetRecentUsersUseCase] ${result.length} usuários recentes obtidos com sucesso`,
      );

      return result;
    } catch (error) {
      this.logger.error(`[GetRecentUsersUseCase] Erro ao obter usuários recentes: ${error.message}`);
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }
}
