export interface DashboardStatistics {
  totalUsers: number;
  totalCustomers: number;
  totalAuditLogs: number;
  retrievedAt: Date;
}

export interface RecentUser {
  id: string;
  name: string;
  company: string | null;
  createdAt: Date;
}

export interface CustomerTrendData {
  month?: string;
  day?: string;
  total: number;
}
