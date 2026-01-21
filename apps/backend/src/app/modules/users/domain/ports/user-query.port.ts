export const USER_QUERY_PORT = 'IUserQueryPort';

export interface IUserQueryPort {
  getTotalCount(): Promise<number>;
  getRecentUsers(limit: number): Promise<Array<{ id: string; email: string; createdAt: Date }>>;
}
