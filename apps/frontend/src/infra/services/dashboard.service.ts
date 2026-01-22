import type { DashboardStatistics, RecentUser, CustomerTrendData } from '../../domain/dashboard/dashboard.types';

const API_BASE_URL = 'http://localhost:3000/api/dashboard';

function getAuthToken(): string {
  // Tenta várias chaves possíveis de token
  const token = 
    localStorage.getItem('access_token') ||  // Chave usada por tokenStorage
    localStorage.getItem('accessToken') ||   // Chave alternativa
    localStorage.getItem('token');           // Fallback
  
  console.log('🔐 Auth Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'EMPTY');
  return token || '';
}

export const dashboardService = {
  async getStats(): Promise<DashboardStatistics> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }
    
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`);
    }

    return await response.json();
  },

  async getRecentCustomers(limit = 5): Promise<RecentUser[]> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }
    
    const response = await fetch(`${API_BASE_URL}/recent-customers?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar clientes recentes: ${response.statusText}`);
    }

    return await response.json();
  },

  async getCustomerTrendByMonth(months = 12): Promise<CustomerTrendData[]> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }
    
    const response = await fetch(`${API_BASE_URL}/customer-trend/month?months=${months}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar tendência mensal: ${response.statusText}`);
    }

    return await response.json();
  },

  async getCustomerTrendByDay(days = 30): Promise<CustomerTrendData[]> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }
    
    const response = await fetch(`${API_BASE_URL}/customer-trend/day?days=${days}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar tendência diária: ${response.statusText}`);
    }

    return await response.json();
  },
};
