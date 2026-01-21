import { Injectable, Inject } from '@nestjs/common';
import type { IDashboardRepositoryPort } from '../../domain/ports/dashboard.repository.port';
import type { IUserQueryPort } from '../../../users/domain/ports/user-query.port';
import { USER_QUERY_PORT } from '../../../users/domain/ports/user-query.port';
import type { ICustomerQueryPort } from '../../../customers/domain/ports/customer-query.port';
import { CUSTOMER_QUERY_PORT } from '../../../customers/domain/ports/customer-query.port';
import type { IAuditQueryPort } from '../../../../../common/modules/audit/domain/ports/audit-query.port';
import { AUDIT_QUERY_PORT } from '../../../../../common/modules/audit/domain/ports/audit-query.port';
import type { ICustomerTrendQueryPort } from '../../../customers/domain/ports/customer-trend-query.port';
import { CUSTOMER_TREND_QUERY_PORT } from '../../../customers/domain/ports/customer-trend-query.port';

@Injectable()
export class DashboardRepository implements IDashboardRepositoryPort {
  constructor(
    @Inject(USER_QUERY_PORT)
    private readonly userQueryHandler: IUserQueryPort,
    @Inject(CUSTOMER_QUERY_PORT)
    private readonly customerQueryHandler: ICustomerQueryPort,
    @Inject(AUDIT_QUERY_PORT)
    private readonly auditQueryHandler: IAuditQueryPort,
    @Inject(CUSTOMER_TREND_QUERY_PORT)
    private readonly customerTrendQueryHandler: ICustomerTrendQueryPort,
  ) {}

  async getDashboardStats(): Promise<{ totalUsers: number; totalCustomers: number; totalAuditLogs: number }> {
    const [totalUsers, totalCustomers, totalAuditLogs] = await Promise.all([
      this.userQueryHandler.getTotalCount(),
      this.customerQueryHandler.getTotalCount(),
      this.auditQueryHandler.getTotalCount(),
    ]);

    return {
      totalUsers,
      totalCustomers,
      totalAuditLogs,
    };
  }

  async getRecentCustomers(limit: number): Promise<Array<{ id: string; name: string; email: string; createdAt: Date }>> {
    return await this.customerQueryHandler.getRecentCustomers(limit);
  }

  async getCustomerTrendByMonth(months: number): Promise<Array<{ month: string; total: number }>> {
    return await this.customerTrendQueryHandler.getTrendByMonth(months);
  }

  async getCustomerTrendByDay(days: number): Promise<Array<{ day: string; total: number }>> {
    return await this.customerTrendQueryHandler.getTrendByDay(days);
  }
}
