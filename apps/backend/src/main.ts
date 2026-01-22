import { ValidationPipe, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { LoggerService } from './common/services/logger';
import { initializeTracing } from './app/telemetry';
import { GlobalExceptionFilter, ValidationExceptionFilter } from './common/exceptions';
import { writeSync } from 'fs';

// ⚠️ Force flush to stdout/stderr to ensure logs are printed
const flush = () => {
  try {
    writeSync(1, '');
    writeSync(2, '');
  } catch (e) {
    // ignore
  }
};

// 🔴 Global error handlers BEFORE bootstrap
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [MAIN] Unhandled Rejection at promise:', promise);
  console.error('Reason:', reason);
  if (reason instanceof Error) {
    console.error('Stack:', reason.stack);
  }
  flush();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ [MAIN] Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  flush();
  process.exit(1);
});

async function bootstrap() {
  try {
    // 🔍 Initialize OpenTelemetry tracing BEFORE creating NestFactory
    initializeTracing();
    flush();

    console.log('🔍 [MAIN] Iniciando NestFactory.create...');
    console.log('⏰ [MAIN] Starting with timeout protection...');
    flush();
    
    let app: INestApplication;
    try {
      console.log('📝 [MAIN] About to call NestFactory.create()');
      flush();
      
      app = await NestFactory.create(AppModule, {
        logger: false, // ✅ Desabilitar logger padrão do NestJS
      });
      
      console.log('✅ [MAIN] NestFactory.create returned successfully');
      flush();
    } catch (createError) {
      console.error('❌ [MAIN] CRITICAL ERROR creating NestApp:');
      console.error('Error Type:', createError?.constructor?.name);
      console.error('Error Message:', createError instanceof Error ? createError.message : String(createError));
      if (createError instanceof Error) {
        console.error('Error Stack:', createError.stack);
        console.error('Error Cause:', (createError as any).cause);
      }
      flush();
      throw createError;
    }
    
    console.log('✅ [MAIN] NestFactory.create completo');
    flush();

    // ✅ Usar LoggerService como logger global
    const loggerService = new LoggerService('NestJS');
    app.useLogger(loggerService);
    
    console.log('🔍 [MAIN] Configurando CORS...');
    flush();
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:4200',
      credentials: true,  // ✅ Permite cookies cross-origin
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    
    app.use(cookieParser());
    
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    
    console.log('🔍 [MAIN] Aplicando pipes e filtros...');
    flush();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    // 🔴 Registrar filtros globais de exceção
    app.useGlobalFilters(
      new ValidationExceptionFilter(),
      new GlobalExceptionFilter(),
    );

    console.log('🔍 [MAIN] Configurando Swagger...');
    flush();
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
    
    console.log('🔍 [MAIN] Iniciando app.listen...');
    flush();
    await app.listen(port);
    console.log('✅ [MAIN] app.listen completo');
    flush();
    
    // Log de inicialização com sucesso usando o LoggerService
    loggerService.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`, 'Bootstrap');
    loggerService.log(`📚 Swagger documentation: http://localhost:${port}/docs`, 'Bootstrap');
  } catch (error) {
    console.error('❌ [MAIN] Erro durante bootstrap:');
    if (error instanceof Error) {
      console.error('  Mensagem:', error.message);
      console.error('  Stack:', error.stack);
      console.error('  Cause:', (error as any).cause);
    } else {
      console.error('  Erro desconhecido:', error);
    }
    flush();
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('❌ [MAIN] Bootstrap promise rejected:', err);
  flush();
  process.exit(1);
});
