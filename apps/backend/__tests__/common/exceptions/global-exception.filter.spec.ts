import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from 'src/common/exceptions/global-exception.filter';
import {
  NotFoundException,
  ConflictException,
  ValidationException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  InternalServerException,
} from 'src/common/exceptions/business.exception';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

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

    // Mock Logger
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('catch - BusinessException', () => {
    it('should catch NotFoundException and return 404', () => {
      const exception = new NotFoundException('User not found', { entityType: 'User', id: '123' });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: 'NOT_FOUND',
          message: 'User not found',
          details: { entityType: 'User', id: '123' },
        }),
      );
    });

    it('should catch ConflictException and return 409', () => {
      const exception = new ConflictException('Email already exists', { field: 'email', value: 'test@test.com' });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          code: 'CONFLICT',
          message: 'Email already exists',
        }),
      );
    });

    it('should catch UnauthorizedException and return 401', () => {
      const exception = new UnauthorizedException('Invalid token');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        }),
      );
    });

    it('should catch ForbiddenException and return 403', () => {
      const exception = new ForbiddenException('Access denied');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          code: 'FORBIDDEN',
          message: 'Access denied',
        }),
      );
    });

    it('should catch BadRequestException and return 400', () => {
      const exception = new BadRequestException('Invalid input', { field: 'email' });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST',
          message: 'Invalid input',
        }),
      );
    });

    it('should catch InternalServerException and return 500', () => {
      const exception = new InternalServerException('Something went wrong');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        }),
      );
    });

    it('should include timestamp in response', () => {
      const exception = new NotFoundException('Not found');
      const beforeTime = new Date();

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      const responseTime = new Date(response.timestamp);

      expect(responseTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    });

    it('should include path and method in response', () => {
      const exception = new NotFoundException('Not found');

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.path).toBe('/api/users');
      expect(response.method).toBe('POST');
    });
  });

  describe('catch - HttpException', () => {
    it('should catch NestJS HttpException', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Forbidden',
        }),
      );
    });

    it('should catch HttpException with custom response', () => {
      const exception = new HttpException(
        { message: 'Custom error', details: 'Some details' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('catch - Generic Error', () => {
    it('should catch generic Error', () => {
      const exception = new Error('Something went wrong');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Something went wrong',
        }),
      );
    });

    it('should catch unknown error', () => {
      const unknownError = 'string error';

      filter.catch(unknownError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
        }),
      );
    });
  });

  describe('response structure', () => {
    it('should have standard response structure', () => {
      const exception = new NotFoundException('Test');

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];

      expect(response).toHaveProperty('statusCode');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('path');
      expect(response).toHaveProperty('method');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('code');
    });

    it('should include details when available', () => {
      const details = { entityType: 'User', id: '123' };
      const exception = new NotFoundException('Not found', details);

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.details).toEqual(details);
    });

    it('should not include details when not available', () => {
      const exception = new NotFoundException('Not found');

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.details).toBeUndefined();
    });
  });
});
