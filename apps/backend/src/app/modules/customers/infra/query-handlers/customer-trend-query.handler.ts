import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../domain/entities/customer.entity';
import type { ICustomerTrendQueryPort } from '../../domain/ports/customer-trend-query.port';

@Injectable()
export class CustomerTrendQueryHandler implements ICustomerTrendQueryPort {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getTrendByMonth(months: number): Promise<Array<{ month: string; total: number }>> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

    const result = await this.customerRepository
      .createQueryBuilder('customer')
      .select('DATE_TRUNC(\'month\', customer.createdAt) as month')
      .addSelect('COUNT(customer.id)::int as total')
      .where('customer.createdAt >= :startDate', { startDate })
      .where('customer.deletedAt IS NULL')
      .groupBy('DATE_TRUNC(\'month\', customer.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map((r: any) => ({
      month: new Date(r.month).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' }),
      total: r.total || 0,
    }));
  }

  async getTrendByDay(days: number): Promise<Array<{ day: string; total: number }>> {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const result = await this.customerRepository
      .createQueryBuilder('customer')
      .select('DATE_TRUNC(\'day\', customer.createdAt) as day')
      .addSelect('COUNT(customer.id)::int as total')
      .where('customer.createdAt >= :startDate', { startDate })
      .where('customer.deletedAt IS NULL')
      .groupBy('DATE_TRUNC(\'day\', customer.createdAt)')
      .orderBy('day', 'ASC')
      .getRawMany();

    return result.map((r: any) => ({
      day: new Date(r.day).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      total: r.total || 0,
    }));
  }
}
