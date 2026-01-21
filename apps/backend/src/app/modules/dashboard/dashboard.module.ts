import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/domain/entities/user.entity';
import { Customer } from '../customers/domain/entities/customer.entity';
import { AuditLog } from '../../../common/modules/audit/domain/entities/audit-log.entity';
import { DashboardController } from './adapters/controllers/dashboard.controller';
import { DashboardRepository } from './infra/repositories/dashboard.repository';
import { DASHBOARD_REPOSITORY_TOKEN } from './domain/ports/dashboard.repository.port';
import { GetDashboardStatsUseCase } from './presentation/use-cases/get-dashboard-stats.ucase';
import { GetRecentUsersUseCase } from './presentation/use-cases/get-recent-users.ucase';

@Module({
  imports: [TypeOrmModule.forFeature([User, Customer, AuditLog])],
  controllers: [DashboardController],
  providers: [
    GetDashboardStatsUseCase,
    GetRecentUsersUseCase,
    {
      provide: DASHBOARD_REPOSITORY_TOKEN,
      useClass: DashboardRepository,
    },
  ],
  exports: [GetDashboardStatsUseCase, GetRecentUsersUseCase],
})
export class DashboardModule {}
