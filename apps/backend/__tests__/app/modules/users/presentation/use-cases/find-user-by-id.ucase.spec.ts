import { Test, TestingModule } from '@nestjs/testing';
import { FindUserByIdUseCase } from 'src/app/modules/users/presentation/use-case/find-user-by-id.ucase';
import { USER_REPOSITORY_TOKEN } from 'src/app/modules/users/domain/ports/user.repository.port';
import { NotFoundException } from 'src/common/exceptions';
import { LogAuditUseCase } from 'src/common/modules/audit/presentation/use-cases';

describe('FindUserByIdUseCase', () => {
  let useCase: FindUserByIdUseCase;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserByIdUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
        {
          provide: LogAuditUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<FindUserByIdUseCase>(FindUserByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const userId = '123';
    const mockUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    };

    it('should find user by id successfully', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute(userId)).rejects.toThrow('Usuário não encontrado');
    });

    it('should throw NotFoundException with correct details', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      try {
        await useCase.execute(userId);
        fail('Should have thrown NotFoundException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.details).toEqual({
          entityType: 'User',
          id: userId,
        });
      }
    });

    it('should throw NotFoundException with 404 status code', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      try {
        await useCase.execute(userId);
        fail('Should have thrown NotFoundException');
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
      }
    });
  });
});
