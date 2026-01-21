import { IPaginatedResponse, IPaginationParams } from '../../domain/types/index';
import { httpClient, API_CONFIG } from '../http/http-client';

export class CustomerRepository implements ICustomerRepository {
  async create(customer: Partial<Customer>): Promise<Customer> {
    return httpClient.post<Customer>(
      API_CONFIG.ENDPOINTS.CUSTOMERS.CREATE,
      customer
    );
  }

  async findById(id: string): Promise<Customer | null> {
    try {
      return await httpClient.get<Customer>(
        API_CONFIG.ENDPOINTS.CUSTOMERS.GET_BY_ID(id)
      );
    } catch {
      return null;
    }
  }

  async findAll(params: IPaginationParams): Promise<IPaginatedResponse<Customer>> {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.set('skip', String(params.skip));
    if (params.take !== undefined) searchParams.set('take', String(params.take));
    if (params.search !== undefined) searchParams.set('search', params.search);
    if (params.searchField !== undefined) searchParams.set('searchField', params.searchField);

    const query = searchParams.toString();
    const endpoint = query
      ? `${API_CONFIG.ENDPOINTS.CUSTOMERS.LIST}?${query}`
      : API_CONFIG.ENDPOINTS.CUSTOMERS.LIST;

    return httpClient.get<IPaginatedResponse<Customer>>(endpoint);
  }

  async update(id: string, customer: Partial<Customer>): Promise<Customer | null> {
    try {
      return await httpClient.put<Customer>(
        API_CONFIG.ENDPOINTS.CUSTOMERS.UPDATE(id),
        customer
      );
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(API_CONFIG.ENDPOINTS.CUSTOMERS.DELETE(id));
  }
}

export const customerRepository = new CustomerRepository();
