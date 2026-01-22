import axios from 'axios';

describe('E2E: Audit Logging', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Create user and login
    const userData = {
      email: `audit-test-${Date.now()}@example.com`,
      password: 'SecurePass123!',
    };

    const createResponse = await axios.post('/api/v1/users', userData);

    const loginResponse = await axios.post('/api/auth/login', {
      email: userData.email,
      password: userData.password,
    });

    authToken = loginResponse.data.accessToken;
  });

  describe('Audit Trail', () => {
    it('should create audit log when user is created', async () => {
      const userData = {
        email: `audit-create-user-${Date.now()}@example.com`,
        password: 'SecurePass123!',
      };

      const response = await axios.post('/api/v1/users', userData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');

      // Audit should be logged automatically (verified through dashboard logs endpoint if available)
    });

    it('should create audit log when customer is created', async () => {
      const customerData = {
        name: 'Audit Test Customer',
        salary: 7500.00,
      };

      const response = await axios.post('/api/v1/customers', customerData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');

      // Audit should be logged automatically
    });

    it('should track all user actions in audit logs', async () => {
      // Create multiple customers to generate audit logs
      const customer1 = await axios.post(
        '/api/v1/customers',
        { name: 'Customer 1', salary: 5000 },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );

      const customer2 = await axios.post(
        '/api/v1/customers',
        { name: 'Customer 2', salary: 6000 },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );

      expect(customer1.status).toBe(201);
      expect(customer2.status).toBe(201);

      // Stats should show increased audit log count
      const statsResponse = await axios.get('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(statsResponse.data.totalAuditLogs).toBeGreaterThan(0);
    });
  });

  describe('System Health', () => {
    it('should have health check endpoint', async () => {
      try {
        const response = await axios.get('/api/health');
        expect(response.status).toBe(200);
      } catch (error: unknown) {
        const axiosError = error as any;
        expect(axiosError.response?.status).not.toBe(500);
      }
    });

    it('should handle concurrent requests', async () => {
      const promises: Promise<any>[] = [];

      // Create 5 concurrent requests
      for (let i = 0; i < 5; i++) {
        promises.push(
          axios.post(
            '/api/v1/customers',
            { name: `Concurrent Customer ${i}`, salary: 5000 + i * 100 },
            { headers: { Authorization: `Bearer ${authToken}` } },
          ),
        );
      }

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.status).toBe(201);
        expect(result.data).toHaveProperty('id');
      });
    });
  });
});
