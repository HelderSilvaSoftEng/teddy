export const AUDIT_QUERY_PORT = Symbol('AUDIT_QUERY_PORT');

export interface IAuditQueryPort {
  getTotalCount(): Promise<number>;
  getRecentAuditLogs(limit: number): Promise<Array<{
    id: string;
    userEmail: string;
    action: string;
    createdAt: Date;
  }>>;
}
