export const DASHBOARD_REPOSITORY_TOKEN = 'IDashboardRepositoryPort';

export interface IDashboardRepositoryPort {
  getTotalUsers(): Promise<number>;
  getTotalCustomers(): Promise<number>;
  getTotalAuditLogs(): Promise<number>;
  getRecentUsers(limit: number): Promise<Array<{ id: string; email: string; name: string; createdAt: Date }>>;
}
