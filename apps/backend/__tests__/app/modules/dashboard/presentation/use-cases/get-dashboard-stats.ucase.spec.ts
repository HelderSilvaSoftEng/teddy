import { Test, TestingModule } from '@nestjs/testing';
import { GetDashboardStatsUseCase } from 'src/app/modules/dashboard/presentation/use-cases/get-dashboard-stats.ucase';
import { DASHBOARD_REPOSITORY_TOKEN } from 'src/app/modules/dashboard/domain/ports/dashboard.repository.port';
import type { ICurrentUser } from 'src/app/modules/authentication/domain/types';

describe('GetDashboardStatsUseCase', () => {
  let useCase: GetDashboardStatsUseCase;
  let mockDashboardRepository: any;

  beforeEach(async () => {
    mockDashboardRepository = {
      getDashboardStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDashboardStatsUseCase,
        { provide: DASHBOARD_REPOSITORY_TOKEN, useValue: mockDashboardRepository },
      ],
    }).compile();

    useCase = module.get<GetDashboardStatsUseCase>(GetDashboardStatsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const currentUser: ICurrentUser = {
      id: 'user-123',
      email: 'user@example.com',
    };

    it('should get dashboard stats successfully', async () => {
      const stats = {
        totalUsers: 10,
        totalCustomers: 25,
        totalAuditLogs: 150,
      };

      mockDashboardRepository.getDashboardStats.mockResolvedValue(stats);

      const result = await useCase.execute(currentUser);

      expect(result).toBeDefined();
      expect(result.totalUsers).toEqual(10);
      expect(result.totalCustomers).toEqual(25);
      expect(result.totalAuditLogs).toEqual(150);
      expect(mockDashboardRepository.getDashboardStats).toHaveBeenCalled();
    });

    it('should return stats with zero counts when repository returns zeros', async () => {
      const stats = {
        totalUsers: 0,
        totalCustomers: 0,
        totalAuditLogs: 0,
      };

      mockDashboardRepository.getDashboardStats.mockResolvedValue(stats);

      const result = await useCase.execute(currentUser);

      expect(result.totalUsers).toEqual(0);
      expect(result.totalCustomers).toEqual(0);
      expect(result.totalAuditLogs).toEqual(0);
    });

    it('should include retrievedAt timestamp', async () => {
      const stats = {
        totalUsers: 5,
        totalCustomers: 10,
        totalAuditLogs: 50,
      };

      mockDashboardRepository.getDashboardStats.mockResolvedValue(stats);

      const result = await useCase.execute(currentUser);

      expect(result.retrievedAt).toBeDefined();
      expect(result.retrievedAt).toBeInstanceOf(Date);
    });
  });
});
