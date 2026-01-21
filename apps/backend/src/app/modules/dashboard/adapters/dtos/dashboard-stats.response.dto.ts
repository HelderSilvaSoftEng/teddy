export class DashboardStatsResponseDto {
  totalUsers: number;
  totalCustomers: number;
  totalAuditLogs: number;
  retrievedAt: Date;

  constructor(data: { totalUsers: number; totalCustomers: number; totalAuditLogs: number; retrievedAt: Date }) {
    this.totalUsers = data.totalUsers;
    this.totalCustomers = data.totalCustomers;
    this.totalAuditLogs = data.totalAuditLogs;
    this.retrievedAt = data.retrievedAt;
  }
}
