import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomerUseCase } from 'src/app/modules/customers/presentation/use-cases';
import { CUSTOMER_REPOSITORY_TOKEN } from 'src/app/modules/customers/domain/ports';
import { LogAuditUseCase } from 'src/common/modules/audit/presentation/use-cases';
import { CreateCustomerDto } from 'src/app/modules/customers/adapters/dtos';

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
  let mockCustomerRepository: any;
  let mockLogAuditUseCase: any;

  beforeEach(async () => {
    mockCustomerRepository = {
      create: jest.fn(),
    };

    mockLogAuditUseCase = {
      execute: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerUseCase,
        { provide: CUSTOMER_REPOSITORY_TOKEN, useValue: mockCustomerRepository },
        { provide: LogAuditUseCase, useValue: mockLogAuditUseCase },
      ],
    }).compile();

    useCase = module.get<CreateCustomerUseCase>(CreateCustomerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createCustomerDto: CreateCustomerDto = {
      name: 'João Silva',
      salary: 5000.50,
    };

    it('should create a customer successfully', async () => {
      const userId = 'user-123';
      const createdCustomer = {
        id: 'customer-123',
        userId,
        name: createCustomerDto.name,
        salary: createCustomerDto.salary,
        createdAt: new Date(),
      };

      mockCustomerRepository.create.mockResolvedValue(createdCustomer);

      const result = await useCase.execute(userId, createCustomerDto);

      expect(result).toEqual(createdCustomer);
      expect(mockCustomerRepository.create).toHaveBeenCalledWith({
        userId,
        ...createCustomerDto,
      });
      expect(mockLogAuditUseCase.execute).toHaveBeenCalled();
    });

    it('should log audit when customer is created', async () => {
      const userId = 'user-123';
      const createdCustomer = {
        id: 'customer-123',
        userId,
        name: createCustomerDto.name,
        salary: createCustomerDto.salary,
      };

      mockCustomerRepository.create.mockResolvedValue(createdCustomer);

      await useCase.execute(userId, createCustomerDto);

      expect(mockLogAuditUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          action: 'CREATE',
          entityType: 'Customer',
          entityId: createdCustomer.id,
        }),
      );
    });
  });
});
