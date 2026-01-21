import { Customer } from '../entities';
import { IPaginatedResponse, IPaginationParams } from '../types';

export interface ICustomerRepository {
  create(customer: Partial<Customer>): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findAll(params: IPaginationParams): Promise<IPaginatedResponse<Customer>>;
  update(id: string, customer: Partial<Customer>): Promise<Customer | null>;
  delete(id: string): Promise<void>;
}
