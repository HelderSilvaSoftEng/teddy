import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './adapters/controllers/auth.controller';

// Use Cases
import { LoginUseCase, RefreshTokenUseCase, LogoutUseCase, RecoveryPasswordUseCase, ResetPasswordUseCase } from './presentation/use-case';

// Strategies & Guards
import { LocalClientStrategy, JwtStrategy } from './infra/strategies';

// Clients module (para ClientRepository)
import { ClientsModule } from '../clients/clients.module';

// Email module
import { EmailModule } from '../../../common/services/email';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', 900),  // 1 hora
        },
      }),
      inject: [ConfigService],
    }),
    ClientsModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    // Use Cases
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    RecoveryPasswordUseCase,
    ResetPasswordUseCase,

    // Strategies
    LocalClientStrategy,
    JwtStrategy,
  ],
  exports: [JwtModule, PassportModule, JwtStrategy],
})
export class AuthenticationModule {}
