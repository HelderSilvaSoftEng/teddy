import { Customer, ICustomerRepository, IPaginatedResponse, IPaginationParams } from '../../../domain';

export class ListCustomersUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(params: IPaginationParams): Promise<IPaginatedResponse<Customer>> {
    return this.customerRepository.findAll(params);
  }
}
