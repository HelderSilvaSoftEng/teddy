export const DASHBOARD_REPOSITORY_TOKEN = 'IDashboardRepositoryPort';

export interface IDashboardRepositoryPort {
  getDashboardStats(): Promise<{ totalUsers: number; totalCustomers: number; totalAuditLogs: number }>;
  getRecentCustomers(limit: number): Promise<Array<{ id: string; name: string; company: string | null; createdAt: Date }>>;
  getCustomerTrendByMonth(months: number): Promise<Array<{ month: string; total: number }>>;
  getCustomerTrendByDay(days: number): Promise<Array<{ day: string; total: number }>>;
}
