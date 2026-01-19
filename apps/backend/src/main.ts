import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { LoggerService } from './common/services/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // ✅ Desabilitar logger padrão do NestJS
  });

  // ✅ Usar LoggerService como logger global
  const loggerService = new LoggerService('NestJS');
  app.useLogger(loggerService);
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,  // ✅ Permite cookies cross-origin
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
      withCredentials: true, // ✅ Permite credenciais em requisições
      persistAuthorization: true, // ✅ Mantém autenticação entre requisições
    },
  });

  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  
  // Log de inicialização com sucesso usando o LoggerService
  loggerService.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`, 'Bootstrap');
  loggerService.log(`📚 Swagger documentation: http://localhost:${port}/docs`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
