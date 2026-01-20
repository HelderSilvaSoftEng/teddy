import { Customer, ICustomerRepository } from '../../../domain';

export class UpdateCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: string, customer: Partial<Customer>): Promise<Customer | null> {
    return this.customerRepository.update(id, customer);
  }
}
