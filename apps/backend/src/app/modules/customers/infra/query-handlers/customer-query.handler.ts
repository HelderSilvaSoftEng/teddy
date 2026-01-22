import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Customer } from '../../domain/entities/customer.entity';
import type { ICustomerQueryPort } from '../../domain/ports/customer-query.port';

@Injectable()
export class CustomerQueryHandler implements ICustomerQueryPort {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getTotalCount(): Promise<number> {
    return await this.customerRepository.count({
      where: { deletedAt: IsNull() },
    });
  }

  async getRecentCustomers(limit: number): Promise<Array<{ id: string; name: string; company: string | null; createdAt: Date }>> {
    const customers = await this.customerRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'name', 'company', 'createdAt'],
    });

    return customers.map(customer => ({
      id: customer.id,
      name: customer.name || 'N/A',
      company: customer.company,
      createdAt: customer.createdAt,
    }));
  }
}
