import { Customer } from '../entities';

export interface ICustomerRepositoryPort {
  create(data: Partial<Customer>): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findByUserId(userId: string): Promise<Customer | null>;
  findAll(skip?: number, take?: number): Promise<{ data: Customer[]; total: number }>;
  update(id: string, data: Partial<Customer>): Promise<Customer>;
  delete(id: string): Promise<void>;
}

export const CUSTOMER_REPOSITORY_TOKEN = Symbol('ICustomerRepositoryPort');
