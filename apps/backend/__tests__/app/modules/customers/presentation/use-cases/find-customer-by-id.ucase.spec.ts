import { Test, TestingModule } from '@nestjs/testing';
import { FindCustomerByIdUseCase } from 'src/app/modules/customers/presentation/use-cases';
import { CUSTOMER_REPOSITORY_TOKEN } from 'src/app/modules/customers/domain/ports';
import { NotFoundException } from 'src/common/exceptions';

describe('FindCustomerByIdUseCase', () => {
  let useCase: FindCustomerByIdUseCase;
  let mockCustomerRepository: any;

  beforeEach(async () => {
    mockCustomerRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindCustomerByIdUseCase,
        { provide: CUSTOMER_REPOSITORY_TOKEN, useValue: mockCustomerRepository },
      ],
    }).compile();

    useCase = module.get<FindCustomerByIdUseCase>(FindCustomerByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should find a customer by id successfully', async () => {
      const customerId = 'customer-123';
      const customer = {
        id: customerId,
        userId: 'user-123',
        name: 'João Silva',
        salary: 5000,
      };

      mockCustomerRepository.findById.mockResolvedValue(customer);

      const result = await useCase.execute(customerId);

      expect(result).toEqual(customer);
      expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
    });
  });
});
