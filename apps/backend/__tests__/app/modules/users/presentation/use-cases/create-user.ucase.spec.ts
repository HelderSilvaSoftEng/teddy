import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from 'src/app/modules/users/presentation/use-case/create-user.ucase';
import { USER_REPOSITORY_TOKEN } from 'src/app/modules/users/domain/ports/user.repository.port';
import { ConflictException } from 'src/common/exceptions';
import { LogAuditUseCase } from 'src/common/modules/audit/presentation/use-cases';
import { CreateUserDto } from 'src/app/modules/users/adapters/dtos/create-user.dto';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
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

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createUserDto: CreateUserDto = {
      email: 'john@example.com',
      password: 'securePassword123',
    };

    it('should create a user successfully', async () => {
      const createdUser = {
        id: '123',
        ...createUserDto,
        password: 'hashedPassword',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await useCase.execute(createUserDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '123',
        email: createUserDto.email,
      });

      await expect(useCase.execute(createUserDto)).rejects.toThrow(ConflictException);
      await expect(useCase.execute(createUserDto)).rejects.toThrow('Email já cadastrado');
    });

    it('should throw ConflictException with correct details', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '123',
        email: createUserDto.email,
      });

      try {
        await useCase.execute(createUserDto);
        fail('Should have thrown ConflictException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.details).toEqual({
          field: 'email',
          value: createUserDto.email,
        });
      }
    });

    it('should throw ConflictException with 409 status code', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '123',
        email: createUserDto.email,
      });

      try {
        await useCase.execute(createUserDto);
        fail('Should have thrown ConflictException');
      } catch (error: any) {
        expect(error.statusCode).toBe(409);
      }
    });
  });
});
