export interface DashboardStatistics {
  totalUsers: number;
  totalCustomers: number;
  totalAuditLogs: number;
  retrievedAt: Date;
}

export interface RecentUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
