import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListCustomersUseCase } from '../../../../application/use-cases/customers/list-customers.usecase';
import type { ICustomerRepository, Customer, IPaginationParams, IPaginatedResponse } from '../../../../domain';

describe('ListCustomersUseCase', () => {
  let listCustomersUseCase: ListCustomersUseCase;
  let mockCustomerRepository: ICustomerRepository;

  beforeEach(() => {
    mockCustomerRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    listCustomersUseCase = new ListCustomersUseCase(mockCustomerRepository);
  });

  it('should list customers with default pagination', async () => {
    const mockCustomers: Customer[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '923e4567-e89b-12d3-a456-426614174000',
        name: 'Customer 1',
        salary: 50000,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174000',
        userId: '923e4567-e89b-12d3-a456-426614174000',
        name: 'Customer 2',
        salary: 75000,
        status: 'Active',
        createdAt: new Date(),
      },
    ];

    const mockResponse: IPaginatedResponse<Customer> = {
      data: mockCustomers,
      total: 2,
    };

    const params: IPaginationParams = { skip: 0, take: 10 };

    vi.mocked(mockCustomerRepository.findAll).mockResolvedValueOnce(mockResponse);

    const result = await listCustomersUseCase.execute(params);

    expect(result).toEqual(mockResponse);
    expect(result.data).toHaveLength(2);
    expect(mockCustomerRepository.findAll).toHaveBeenCalledWith(params);
  });

  it('should list customers with custom pagination', async () => {
    const mockResponse: IPaginatedResponse<Customer> = {
      data: [],
      total: 0,
    };

    const params: IPaginationParams = { skip: 20, take: 5 };

    vi.mocked(mockCustomerRepository.findAll).mockResolvedValueOnce(mockResponse);

    const result = await listCustomersUseCase.execute(params);

    expect(result.data).toHaveLength(0);
    expect(mockCustomerRepository.findAll).toHaveBeenCalledWith(params);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    const params: IPaginationParams = { skip: 0, take: 10 };

    vi.mocked(mockCustomerRepository.findAll).mockRejectedValueOnce(error);

    await expect(listCustomersUseCase.execute(params)).rejects.toThrow('Database error');
  });

  it('should return empty list when no customers exist', async () => {
    const mockResponse: IPaginatedResponse<Customer> = {
      data: [],
      total: 0,
    };

    const params: IPaginationParams = { skip: 0, take: 10 };

    vi.mocked(mockCustomerRepository.findAll).mockResolvedValueOnce(mockResponse);

    const result = await listCustomersUseCase.execute(params);

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
