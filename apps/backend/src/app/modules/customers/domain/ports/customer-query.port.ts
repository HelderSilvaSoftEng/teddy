export const CUSTOMER_QUERY_PORT = 'ICustomerQueryPort';

export interface ICustomerQueryPort {
  getTotalCount(): Promise<number>;
  getRecentCustomers(limit: number): Promise<Array<{ id: string; name: string; company: string | null; createdAt: Date }>>;
}
