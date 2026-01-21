import type { DashboardStatistics, RecentUser } from '../../domain/dashboard/dashboard.types';

const API_BASE_URL = 'http://localhost:3000/api/dashboard';

export const dashboardService = {
  async getStats(): Promise<DashboardStatistics> {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`);
    }

    return await response.json();
  },

  async getRecentUsers(limit: number = 5): Promise<RecentUser[]> {
    const response = await fetch(`${API_BASE_URL}/recent-users?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar usuários recentes: ${response.statusText}`);
    }

    return await response.json();
  },
};
