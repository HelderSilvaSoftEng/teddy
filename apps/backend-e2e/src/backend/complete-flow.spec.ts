import axios from 'axios';

describe('E2E: Complete User Flow', () => {
  let customerId: string;

  describe('User Registration & Authentication', () => {
    it('should create a new user', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
      };

      const response = await axios.post('/api/v1/users', userData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('email', userData.email);
      expect(response.data).not.toHaveProperty('password');
    });

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
      };

      await axios.post('/api/v1/users', userData);

      try {
        await axios.post('/api/v1/users', userData);
        fail('Should have thrown 409 Conflict');
      } catch (error: any) {
        expect(error.response?.status).toBe(409);
      }
    });

    it('should login successfully and return tokens', async () => {
      const userData = {
        email: `login-test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
      };

      await axios.post('/api/v1/users', userData);

      const loginResponse = await axios.post('/api/auth/login', {
        email: userData.email,
        password: userData.password,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('accessToken');
      expect(loginResponse.data).toHaveProperty('refreshToken');
    });

    it('should fail login with wrong password', async () => {
      const userData = {
        email: `wrong-pwd-${Date.now()}@example.com`,
        password: 'SecurePass123!',
      };

      await axios.post('/api/v1/users', userData);

      try {
        await axios.post('/api/auth/login', {
          email: userData.email,
          password: 'WrongPassword123!',
        });
        fail('Should have thrown 404 Not Found');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should refresh token successfully', async () => {
      const userData = {
        email: `refresh-test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
      };

      await axios.post('/api/v1/users', userData);
      const loginResponse = await axios.post('/api/auth/login', {
        email: userData.email,
        password: userData.password,
      });

      const oldRefreshToken = loginResponse.data.refreshToken;
      const refreshResponse = await axios.post('/api/auth/refresh', {
        refreshToken: oldRefreshToken,
      });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data).toHaveProperty('accessToken');
      expect(refreshResponse.data).toHaveProperty('refreshToken');
    });
  });

  describe('Customer Management', () => {
    let authToken: string;
    let testUserId: string;

    beforeAll(async () => {
      const userData = {
        email: `customer-test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
      };

      const createResponse = await axios.post('/api/v1/users', userData);
      testUserId = createResponse.data.id;

      const loginResponse = await axios.post('/api/auth/login', {
        email: userData.email,
        password: userData.password,
      });

      authToken = loginResponse.data.accessToken;
    });

    it('should create a customer', async () => {
      const customerData = {
        name: 'João Silva',
        salary: 5000.50,
      };

      const response = await axios.post('/api/v1/customers', customerData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('userId', testUserId);

      customerId = response.data.id;
    });

    it('should get all customers', async () => {
      const response = await axios.get('/api/v1/customers', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get customer by id', async () => {
      const response = await axios.get(`/api/v1/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', customerId);
    });

    it('should fail to get non-existent customer', async () => {
      try {
        await axios.get('/api/v1/customers/non-existent-id', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        fail('Should have thrown 404');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe('Dashboard Statistics', () => {
    let authToken: string;

    beforeAll(async () => {
      const userData = {
        email: `dashboard-test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
      };

      await axios.post('/api/v1/users', userData);

      const loginResponse = await axios.post('/api/auth/login', {
        email: userData.email,
        password: userData.password,
      });

      authToken = loginResponse.data.accessToken;
    });

    it('should get dashboard stats', async () => {
      const response = await axios.get('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalUsers');
      expect(response.data).toHaveProperty('totalCustomers');
      expect(response.data).toHaveProperty('totalAuditLogs');
    });

    it('should get customer trend by day', async () => {
      const response = await axios.get('/api/dashboard/customer-trend/day', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('Authentication & Authorization', () => {
    it('should fail without authentication token', async () => {
      try {
        await axios.get('/api/v1/customers');
        fail('Should have thrown 401');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });

    it('should fail with invalid token', async () => {
      try {
        await axios.get('/api/v1/customers', {
          headers: { Authorization: 'Bearer invalid-token' },
        });
        fail('Should have thrown 401');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });
  });

  describe('Validation & Error Handling', () => {
    it('should fail with invalid email format', async () => {
      try {
        await axios.post('/api/v1/users', {
          email: 'invalid-email',
          password: 'SecurePass123!',
        });
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }
    });

    it('should fail with password too short', async () => {
      try {
        await axios.post('/api/v1/users', {
          email: `short-pwd-${Date.now()}@example.com`,
          password: 'short',
        });
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }
    });
  });
});
