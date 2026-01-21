import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenUseCase } from 'src/app/modules/authentication/presentation/use-case/refresh-token.ucase';
import { USER_REPOSITORY_TOKEN } from 'src/app/modules/users/domain/ports/user.repository.port';
import { LogAuditUseCase } from 'src/common/modules/audit/presentation/use-cases';
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from 'src/common/exceptions';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let mockUserRepository: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    mockJwtService = {
      verify: jest.fn(),
      sign: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key) => {
        if (key === 'JWT_EXPIRATION') return '3600';
        if (key === 'REFRESH_TOKEN_SECRET') return 'refresh-secret';
        if (key === 'JWT_SECRET') return 'jwt-secret';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
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
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const refreshToken = 'valid-refresh-token';

    const mockResponse: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };

    it('should be defined', () => {
      expect(useCase).toBeDefined();
    });

    it('should have execute method', () => {
      expect(useCase.execute).toBeDefined();
      expect(typeof useCase.execute).toBe('function');
    });

    it('should throw BadRequestException when refresh token is missing', async () => {
      await expect(useCase.execute('', mockResponse)).rejects.toThrow(BadRequestException);
    });
  });
});
