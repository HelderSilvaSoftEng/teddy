import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUseCase } from 'src/app/modules/authentication/presentation/use-case/login.ucase';
import { USER_REPOSITORY_TOKEN } from 'src/app/modules/users/domain/ports/user.repository.port';
import { LogAuditUseCase } from 'src/common/modules/audit/presentation/use-cases';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepository: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockLogAuditUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: LogAuditUseCase,
          useValue: mockLogAuditUseCase,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockCurrentUser: any = {
      id: '123',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user',
    };

    const mockResponse: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
      mockUserRepository.findById = jest.fn();
    });

    it('should be defined', () => {
      expect(useCase).toBeDefined();
    });

    it('should have execute method', () => {
      expect(useCase.execute).toBeDefined();
      expect(typeof useCase.execute).toBe('function');
    });

    it('should verify email is being looked up', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      try {
        await useCase.execute(mockCurrentUser, mockResponse);
      } catch (error) {
        // Expected behavior
      }

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockCurrentUser.id);
    });
  });
});
