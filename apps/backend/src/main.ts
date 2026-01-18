import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🔐 CORS com suporte a cookies
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,  // ✅ Permite cookies cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // 🍪 Parser de cookies (necessário para ler Set-Cookie headers)
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
        description: 'Access Token (15 minutos)',
      },
      'access-token',
    )
    .addCookieAuth('Authentication', {
      type: 'apiKey',
      in: 'cookie',
      description: 'Refresh Token (httpOnly, 7 dias)',
    })
    .addTag('🔐 Autenticação', 'Authentication endpoints')
    .addTag('👥 Clientes', 'Client management endpoints')
    .addTag('🏥 Health', 'Health check endpoints')
    .addTag('📊 Métricas', 'Metrics endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `📚 Swagger documentation: http://localhost:${port}/docs`,
  );
}

bootstrap();
