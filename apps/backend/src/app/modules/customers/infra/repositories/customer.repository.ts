import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../domain/entities';
import { ICustomerRepositoryPort } from '../../domain/ports';

@Injectable()
export class CustomerRepository implements ICustomerRepositoryPort {
  constructor(
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}

  async create(data: Partial<Customer>): Promise<Customer> {
    const customer = this.repository.create(data);
    return this.repository.save(customer);
  }

  async findById(id: string): Promise<Customer | null> {
    return this.repository.findOne({
      where: { id },
      withDeleted: false,
    });
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    return this.repository.findOne({
      where: { userId },
      withDeleted: false,
    });
  }

  async findAll(skip = 0, take = 10): Promise<{ data: Customer[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: {},
      withDeleted: false,
      skip,
      take,
    });
    return { data, total };
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
