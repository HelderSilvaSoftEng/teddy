import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ICustomerRepositoryPort } from '../../domain/ports';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../domain/ports';
import { Customer } from '../../domain/entities';
import { UpdateCustomerDto } from '../../adapters/dtos';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepositoryPort,
  ) {}

  async execute(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return this.customerRepository.update(id, data);
  }
}
