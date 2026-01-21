export interface ICustomerTrendQueryPort {
  getTrendByMonth(months: number): Promise<Array<{ month: string; total: number }>>;
  getTrendByDay(days: number): Promise<Array<{ day: string; total: number }>>;
}

export const CUSTOMER_TREND_QUERY_PORT = Symbol('ICustomerTrendQueryPort');
