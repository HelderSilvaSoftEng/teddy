import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3000/api';
let token = '';

export default function () {
  group('Authentication', () => {
    const loginRes = http.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });

    check(loginRes, {
      'Login status is 200': (r) => r.status === 200,
      'Login response time < 500ms': (r) => r.timings.duration < 500,
      'Token received': (r) => r.json('accessToken') !== undefined,
    });

    if (loginRes.status === 200) {
      token = loginRes.json('accessToken');
    }
  });

  if (token) {
    group('Dashboard Endpoints', () => {
      // Test /api/dashboard/stats
      const statsRes = http.get(`${BASE_URL}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      check(statsRes, {
        'Dashboard stats status is 200': (r) => r.status === 200,
        'Dashboard stats response time < 500ms': (r) => r.timings.duration < 500,
        'Stats data valid': (r) => {
          const data = r.json();
          return data.totalUsers !== undefined && data.totalCustomers !== undefined;
        },
      });

      sleep(1);

      // Test /api/dashboard/recent-customers
      const customersRes = http.get(`${BASE_URL}/dashboard/recent-customers?limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      check(customersRes, {
        'Recent customers status is 200': (r) => r.status === 200,
        'Recent customers response time < 500ms': (r) => r.timings.duration < 500,
      });

      sleep(1);

      // Test /api/dashboard/customer-trend/day
      const trendRes = http.get(`${BASE_URL}/dashboard/customer-trend/day?days=30`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      check(trendRes, {
        'Customer trend status is 200': (r) => r.status === 200,
        'Customer trend response time < 500ms': (r) => r.timings.duration < 500,
      });
    });

    group('Customers Endpoints', () => {
      const customersRes = http.get(`${BASE_URL}/customers?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      check(customersRes, {
        'Customers list status is 200': (r) => r.status === 200,
        'Customers list response time < 500ms': (r) => r.timings.duration < 500,
      });
    });
  }

  sleep(1);
}
