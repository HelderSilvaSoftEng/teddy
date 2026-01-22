import { vi } from 'vitest';

/**
 * Mock helpers for frontend tests
 */

export const mockFetch = (data: any, status = 200, ok = true) => {
  return vi.fn().mockResolvedValueOnce({
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
};

export const mockFetchError = (message: string, status = 500) => {
  return vi.fn().mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error: message }),
    text: async () => message,
  });
};

export const mockFetchNetworkError = () => {
  return vi.fn().mockRejectedValueOnce(new Error('Network error'));
};

export const setLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
};

export const getLocalStorage = (key: string) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const clearLocalStorage = () => {
  localStorage.clear();
};

export const mockAuthToken = (token = 'mock-jwt-token-xyz123') => {
  setLocalStorage('accessToken', token);
  return token;
};

export const mockAuthTokenExpired = () => {
  setLocalStorage('accessToken', 'expired-token');
  return 'expired-token';
};

/**
 * Mock response builders
 */

export const mockDashboardStats = () => ({
  totalUsers: 42,
  totalCustomers: 128,
  totalAuditLogs: 512,
  customersCreatedToday: 5,
  usersRegisteredToday: 3,
});

export const mockRecentCustomers = () => [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva',
    email: 'joao@example.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174000',
    name: 'Maria Santos',
    email: 'maria@example.com',
    createdAt: new Date().toISOString(),
  },
];

export const mockCustomerList = () => ({
  data: [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '923e4567-e89b-12d3-a456-426614174000',
      name: 'Empresa ABC',
      salary: 50000,
      status: 'Active',
      createdAt: new Date().toISOString(),
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174000',
      userId: '923e4567-e89b-12d3-a456-426614174000',
      name: 'Empresa XYZ',
      salary: 75000,
      status: 'Active',
      createdAt: new Date().toISOString(),
    },
  ],
  total: 2,
});

export const mockLoginResponse = () => ({
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token',
  refreshToken: 'refresh-token-xyz',
  user: {
    id: '923e4567-e89b-12d3-a456-426614174000',
    email: 'user@example.com',
    name: 'Test User',
  },
});

export const mockUserData = () => ({
  id: '923e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
});
