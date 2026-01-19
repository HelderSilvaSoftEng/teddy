import { Injectable, Inject } from '@nestjs/common';
import type { ICustomerRepositoryPort } from '../../domain/ports';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../domain/ports';
import { Customer } from '../../domain/entities';
import { CreateCustomerDto } from '../../adapters/dtos';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepositoryPort,
  ) {}

  async execute(userId: string, data: CreateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.create({
      userId,
      ...data,
    });
    return customer;
  }
}
