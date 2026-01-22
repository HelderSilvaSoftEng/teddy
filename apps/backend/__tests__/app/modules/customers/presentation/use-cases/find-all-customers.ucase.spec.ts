import { Test, TestingModule } from '@nestjs/testing';
import { FindAllCustomersUseCase } from 'src/app/modules/customers/presentation/use-cases';
import { CUSTOMER_REPOSITORY_TOKEN } from 'src/app/modules/customers/domain/ports';

describe('FindAllCustomersUseCase', () => {
  let useCase: FindAllCustomersUseCase;
  let mockCustomerRepository: any;

  beforeEach(async () => {
    mockCustomerRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllCustomersUseCase,
        { provide: CUSTOMER_REPOSITORY_TOKEN, useValue: mockCustomerRepository },
      ],
    }).compile();

    useCase = module.get<FindAllCustomersUseCase>(FindAllCustomersUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should find all customers successfully', async () => {
      const customers = [
        {
          id: 'customer-1',
          userId: 'user-123',
          name: 'João Silva',
          salary: 5000,
        },
        {
          id: 'customer-2',
          userId: 'user-123',
          name: 'Maria Santos',
          salary: 6000,
        },
      ];

      mockCustomerRepository.findAll.mockResolvedValue(customers);

      const result = await useCase.execute();

      expect(result).toEqual(customers);
      expect(result).toHaveLength(2);
      expect(mockCustomerRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no customers found', async () => {
      mockCustomerRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
