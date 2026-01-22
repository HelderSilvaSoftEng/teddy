import { ValidationPipe, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { LoggerService } from './common/services/logger';
import { initializeTracing } from './app/telemetry';
import { GlobalExceptionFilter, ValidationExceptionFilter } from './common/exceptions';

async function bootstrap() {
  try {
    // Initialize OpenTelemetry tracing BEFORE creating NestFactory
    initializeTracing();
    
    const app = await NestFactory.create(AppModule, {
      logger: false,
    });

    // Use LoggerService as global logger
    const loggerService = new LoggerService('NestJS');
    app.useLogger(loggerService);
    
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:4200',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    
    app.use(cookieParser());
    
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    app.useGlobalFilters(
      new ValidationExceptionFilter(),
      new GlobalExceptionFilter(),
    );

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Desafio API')
      .setDescription('API REST for Client Management System')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access Token (1 hora)',
        },
        'access-token',
      )
      .addTag('🔐 Autenticação', 'Authentication endpoints')
      .addTag('🏥 Health', 'Health check endpoints')
      .addTag('📊 Métricas', 'Metrics endpoints')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        withCredentials: true,
        persistAuthorization: true,
      },
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    loggerService.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`, 'Bootstrap');
    loggerService.log(`📚 Swagger documentation: http://localhost:${port}/docs`, 'Bootstrap');
  } catch (error) {
    console.error('❌ Bootstrap error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});