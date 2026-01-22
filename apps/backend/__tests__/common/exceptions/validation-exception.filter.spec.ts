import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { ValidationExceptionFilter } from 'src/common/exceptions/validation-exception.filter';

describe('ValidationExceptionFilter', () => {
  let filter: ValidationExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    filter = new ValidationExceptionFilter();

    // Mock Request
    mockRequest = {
      method: 'POST',
      url: '/api/users',
      path: '/api/users',
      ip: '127.0.0.1',
      get: jest.fn((header) => {
        if (header === 'user-agent') return 'Mozilla/5.0';
        return '';
      }),
    };

    // Mock Response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock ArgumentsHost
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('catch', () => {
    it('should catch BadRequestException from class-validator', () => {
      const validationErrors = [
        { property: 'email', constraints: { isEmail: 'email must be an email' } },
        { property: 'password', constraints: { minLength: 'password must be at least 8 characters' } },
      ];

      const exception = new BadRequestException(validationErrors);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          errors: {
            email: ['email must be an email'],
            password: ['password must be at least 8 characters'],
          },
        }),
      );
    });

    it('should format multiple constraints for same field', () => {
      const validationErrors = [
        {
          property: 'password',
          constraints: {
            minLength: 'password must be at least 8 characters',
            matches: 'password must contain uppercase letter',
          },
        },
      ];

      const exception = new BadRequestException(validationErrors);

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.errors.password).toContain('password must be at least 8 characters');
      expect(response.errors.password).toContain('password must contain uppercase letter');
    });

    it('should handle exception with string message', () => {
      const exception = new BadRequestException('Validation failed');

      filter.catch(exception, mockArgumentsHost);

      // Should not crash and let global filter handle it
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should include timestamp in response', () => {
      const validationErrors = [
        { property: 'email', constraints: { isEmail: 'email must be an email' } },
      ];

      const exception = new BadRequestException(validationErrors);
      const beforeTime = new Date();

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      const responseTime = new Date(response.timestamp);

      expect(responseTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    });

    it('should include path and method in response', () => {
      const validationErrors = [
        { property: 'email', constraints: { isEmail: 'email must be an email' } },
      ];

      const exception = new BadRequestException(validationErrors);

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.path).toBe('/api/users');
      expect(response.method).toBe('POST');
    });

    it('should handle empty validation errors array', () => {
      const exception = new BadRequestException([]);

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.errors).toEqual({});
    });

    it('should handle validation errors without constraints', () => {
      const validationErrors = [
        { property: 'email', constraints: {} },
      ];

      const exception = new BadRequestException(validationErrors);

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.errors.email).toEqual([]);
    });
  });

  describe('response structure', () => {
    it('should have standard response structure for validation errors', () => {
      const validationErrors = [
        { property: 'email', constraints: { isEmail: 'email must be an email' } },
      ];

      const exception = new BadRequestException(validationErrors);

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];

      expect(response).toHaveProperty('statusCode');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('path');
      expect(response).toHaveProperty('method');
      expect(response).toHaveProperty('errors');
      expect(response.statusCode).toBe(400);
    });

    it('should include message for validation errors', () => {
      const validationErrors = [
        { property: 'email', constraints: { isEmail: 'email must be an email' } },
      ];

      const exception = new BadRequestException(validationErrors);

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.message).toBe('Erro de validação nos dados enviados');
      expect(response.errors).toBeDefined();
    });
  });
});
