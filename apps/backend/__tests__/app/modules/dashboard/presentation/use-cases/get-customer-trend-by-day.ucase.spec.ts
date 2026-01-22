import { Test, TestingModule } from '@nestjs/testing';
import { GetCustomerTrendByDayUseCase } from 'src/app/modules/dashboard/presentation/use-cases/get-customer-trend-by-day.ucase';
import { DASHBOARD_REPOSITORY_TOKEN } from 'src/app/modules/dashboard/domain/ports/dashboard.repository.port';
import type { ICurrentUser } from 'src/app/modules/authentication/domain/types';

describe('GetCustomerTrendByDayUseCase', () => {
  let useCase: GetCustomerTrendByDayUseCase;
  let mockDashboardRepository: any;

  beforeEach(async () => {
    mockDashboardRepository = {
      getCustomerTrendByDay: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomerTrendByDayUseCase,
        { provide: DASHBOARD_REPOSITORY_TOKEN, useValue: mockDashboardRepository },
      ],
    }).compile();

    useCase = module.get<GetCustomerTrendByDayUseCase>(GetCustomerTrendByDayUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const currentUser: ICurrentUser = {
      id: 'user-123',
      email: 'user@example.com',
    };

    it('should get customer trend by day successfully', async () => {
      const trendData = [
        { date: '2026-01-20', count: 5 },
        { date: '2026-01-21', count: 8 },
      ];

      mockDashboardRepository.getCustomerTrendByDay.mockResolvedValue(trendData);

      const result = await useCase.execute(currentUser);

      expect(result).toBeDefined();
      expect(result).toEqual(trendData);
      expect(mockDashboardRepository.getCustomerTrendByDay).toHaveBeenCalled();
    });

    it('should return empty array when no trend data', async () => {
      mockDashboardRepository.getCustomerTrendByDay.mockResolvedValue([]);

      const result = await useCase.execute(currentUser);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
