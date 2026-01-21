import { Injectable, Inject } from '@nestjs/common';
import type { ICustomerRepositoryPort } from '../../domain/ports';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../domain/ports';
import { Customer } from '../../domain/entities';

@Injectable()
export class FindAllCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepositoryPort,
  ) {}

  async execute(skip?: number, take?: number, search?: string, searchField = 'status'): Promise<{ data: Customer[]; total: number }> {
    return this.customerRepository.findAll(skip, take, search, searchField);
  }
}
