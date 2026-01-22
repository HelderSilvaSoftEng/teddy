import { Test, TestingModule } from '@nestjs/testing';
import { LogAuditUseCase } from 'src/common/modules/audit/presentation/use-cases';
import { AUDIT_REPOSITORY_TOKEN } from 'src/common/modules/audit/domain/ports';
import { CreateAuditLogDto } from 'src/common/modules/audit/adapters/dtos';

describe('LogAuditUseCase', () => {
  let useCase: LogAuditUseCase;
  let mockAuditRepository: any;

  beforeEach(async () => {
    mockAuditRepository = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogAuditUseCase,
        { provide: AUDIT_REPOSITORY_TOKEN, useValue: mockAuditRepository },
      ],
    }).compile();

    useCase = module.get<LogAuditUseCase>(LogAuditUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const auditLogDto: CreateAuditLogDto = {
      userId: 'user-123',
      userEmail: 'user@example.com',
      action: 'CREATE',
      entityType: 'Customer',
      entityId: 'customer-123',
      oldValues: null,
      newValues: { email: 'customer@example.com', company: 'Acme' },
      changes: null,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      endpoint: '/api/customers',
      httpMethod: 'POST',
      status: '201',
      errorMessage: null,
    };

    it('should log audit successfully', async () => {
      const createdAuditLog = {
        id: 'audit-123',
        ...auditLogDto,
        createdAt: new Date(),
      };

      mockAuditRepository.create.mockResolvedValue(createdAuditLog);

      const result = await useCase.execute(auditLogDto);

      expect(result).toEqual(createdAuditLog);
      expect(mockAuditRepository.create).toHaveBeenCalledWith(expect.objectContaining(auditLogDto));
    });

    it('should handle null values correctly', async () => {
      const auditLogWithNulls = {
        ...auditLogDto,
        oldValues: null,
        changes: null,
        ipAddress: null,
      };

      const createdAuditLog = {
        id: 'audit-123',
        ...auditLogWithNulls,
        createdAt: new Date(),
      };

      mockAuditRepository.create.mockResolvedValue(createdAuditLog);

      const result = await useCase.execute(auditLogWithNulls);

      expect(result).toBeDefined();
      expect(mockAuditRepository.create).toHaveBeenCalled();
    });

    it('should create audit log with all required fields', async () => {
      const auditLog = {
        id: 'audit-123',
        ...auditLogDto,
        createdAt: new Date(),
      };

      mockAuditRepository.create.mockResolvedValue(auditLog);

      await useCase.execute(auditLogDto);

      expect(mockAuditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          userEmail: 'user@example.com',
          action: 'CREATE',
          entityType: 'Customer',
          entityId: 'customer-123',
          endpoint: '/api/customers',
          httpMethod: 'POST',
        }),
      );
    });
  });
});
