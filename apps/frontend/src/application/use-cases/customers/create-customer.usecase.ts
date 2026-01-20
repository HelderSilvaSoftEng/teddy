import { Customer, ICustomerRepository } from '../../../domain';

export class CreateCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(customer: Partial<Customer>): Promise<Customer> {
    return this.customerRepository.create(customer);
  }
}
