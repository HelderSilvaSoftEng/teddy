import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../common/database';
import { ClientsModule } from './modules/clients/clients.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { HealthModule } from '../common/modules/health';
import { MetricsModule, MetricsMiddleware } from '../common/modules/metrics';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ClientsModule,
    AuthenticationModule,
    HealthModule,
    MetricsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Registrar middleware de métricas para todas as rotas
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
