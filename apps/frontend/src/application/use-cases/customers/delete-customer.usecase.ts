import { ICustomerRepository } from '../../../domain';

export class DeleteCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: string): Promise<void> {
    return this.customerRepository.delete(id);
  }
}
