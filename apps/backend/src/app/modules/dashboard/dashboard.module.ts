import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { CustomersModule } from '../customers/customers.module';
import { AuditModule } from '../../../common/modules/audit/audit.module';
import { DashboardController } from './adapters/controllers/dashboard.controller';
import { DashboardRepository } from './infra/repositories/dashboard.repository';
import { DASHBOARD_REPOSITORY_TOKEN } from './domain/ports/dashboard.repository.port';
import { GetDashboardStatsUseCase } from './presentation/use-cases/get-dashboard-stats.ucase';
import { GetRecentCustomersUseCase } from './presentation/use-cases/get-recent-users.ucase';
import { GetCustomerTrendByMonthUseCase } from './presentation/use-cases/get-customer-trend-by-month.ucase';
import { GetCustomerTrendByDayUseCase } from './presentation/use-cases/get-customer-trend-by-day.ucase';

@Module({
  imports: [UsersModule, CustomersModule, AuditModule],
  controllers: [DashboardController],
  providers: [
    GetDashboardStatsUseCase,
    GetRecentCustomersUseCase,
    GetCustomerTrendByMonthUseCase,
    GetCustomerTrendByDayUseCase,
    {
      provide: DASHBOARD_REPOSITORY_TOKEN,
      useClass: DashboardRepository,
    },
  ],
  exports: [
    GetDashboardStatsUseCase,
    GetRecentCustomersUseCase,
    GetCustomerTrendByMonthUseCase,
    GetCustomerTrendByDayUseCase,
  ],
})
export class DashboardModule {}
