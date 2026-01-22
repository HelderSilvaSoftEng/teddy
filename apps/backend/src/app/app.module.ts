import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../common/database';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { AuditModule } from '../common/modules/audit/audit.module';
import { HealthModule } from '../common/modules/health';
import { MetricsModule, MetricsMiddleware } from '../common/modules/metrics';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { GlobalExceptionFilter, ValidationExceptionFilter } from '../common/exceptions';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    CustomersModule,
    AuthenticationModule,
    AuditModule,
    HealthModule,
    MetricsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Registrar middleware de métricas para todas as rotas
    consumer.apply(MetricsMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
