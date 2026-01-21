import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './adapters/controllers/auth.controller';

// Use Cases
import { LoginUseCase, RefreshTokenUseCase, LogoutUseCase, RecoveryPasswordUseCase, ResetPasswordUseCase } from './presentation/use-case';

// Strategies & Guards
import { LocalUserStrategy, JwtStrategy } from './infra/strategies';

// Users module (para UserRepository)
import { UsersModule } from '../users/users.module';

// Email module
import { EmailModule } from '../../../common/services/email';

// Audit module
import { AuditModule } from '../../../common/modules/audit';

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
    UsersModule,
    EmailModule,
    AuditModule,
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
    LocalUserStrategy,
    JwtStrategy,
  ],
  exports: [JwtModule, PassportModule, JwtStrategy],
})
export class AuthenticationModule {}
