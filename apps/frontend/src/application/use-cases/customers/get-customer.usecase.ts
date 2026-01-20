import { Customer, ICustomerRepository } from '../../../domain';

export class GetCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: string): Promise<Customer | null> {
    return this.customerRepository.findById(id);
  }
}
