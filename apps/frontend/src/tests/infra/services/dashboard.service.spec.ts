import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dashboardService } from '../../../infra/services/dashboard.service';
import { localStorage } from '../../setup';
import type { DashboardStatistics, RecentUser, CustomerTrendData } from '../../../domain/dashboard/dashboard.types';

describe('DashboardService', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getStats', () => {
    it('should fetch dashboard statistics successfully', async () => {
      const mockStats: DashboardStatistics = {
        totalUsers: 42,
        totalCustomers: 128,
        totalAuditLogs: 512,
        retrievedAt: new Date(),
      };

      localStorage.setItem('accessToken', 'mock-token');

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockStats,
      } as any);

      const result = await dashboardService.getStats();

      expect(result).toEqual(mockStats);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dashboard/stats',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });

    it('should throw error when no token is available', async () => {
      localStorage.clear();

      await expect(dashboardService.getStats()).rejects.toThrow(
        'Token de autenticação não encontrado'
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error when API returns error status', async () => {
      localStorage.setItem('accessToken', 'mock-token');

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      } as any);

      await expect(dashboardService.getStats()).rejects.toThrow(
        'Erro ao buscar estatísticas'
      );
    });

    it('should handle network errors', async () => {
      localStorage.setItem('accessToken', 'mock-token');

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(dashboardService.getStats()).rejects.toThrow('Network error');
    });
  });

  describe('getRecentCustomers', () => {
    it('should fetch recent customers successfully', async () => {
      const mockCustomers: RecentUser[] = [
        {
          id: '123',
          name: 'Customer 1',
          company: 'Company 1',
          createdAt: new Date(),
        },
      ];

      localStorage.setItem('accessToken', 'mock-token');

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockCustomers,
      } as any);

      const result = await dashboardService.getRecentCustomers(5);

      expect(result).toEqual(mockCustomers);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dashboard/recent-customers?limit=5',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should use default limit of 5', async () => {
      localStorage.setItem('accessToken', 'mock-token');

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      } as any);

      await dashboardService.getRecentCustomers();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('?limit=5'),
        expect.any(Object)
      );
    });
  });

  describe('getCustomerTrendByDay', () => {
    it('should fetch customer trend by day successfully', async () => {
      const mockTrend: CustomerTrendData[] = [
        { day: '2026-01-21', total: 5 },
        { day: '2026-01-20', total: 3 },
      ];

      localStorage.setItem('accessToken', 'mock-token');

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTrend,
      } as any);

      const result = await dashboardService.getCustomerTrendByDay(30);

      expect(result).toEqual(mockTrend);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customer-trend/day?days=30'),
        expect.any(Object)
      );
    });
  });

  describe('getCustomerTrendByMonth', () => {
    it('should fetch customer trend by month successfully', async () => {
      const mockTrend: CustomerTrendData[] = [
        { month: '2026-01', total: 15 },
        { month: '2025-12', total: 12 },
      ];

      localStorage.setItem('accessToken', 'mock-token');

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTrend,
      } as any);

      const result = await dashboardService.getCustomerTrendByMonth(12);

      expect(result).toEqual(mockTrend);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customer-trend/month?months=12'),
        expect.any(Object)
      );
    });
  });
});
