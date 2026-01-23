import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './adapters/controllers/auth.controller';

import { LoginUseCase, RefreshTokenUseCase, LogoutUseCase, RecoveryPasswordUseCase, ResetPasswordUseCase } from './presentation/use-case';

import { LocalUserStrategy, JwtStrategy } from './infra/strategies';

import { UsersModule } from '../users/users.module';

import { EmailModule } from '../../../common/services/email';

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
