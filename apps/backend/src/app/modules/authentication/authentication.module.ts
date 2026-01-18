import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './adapters/controllers/auth.controller';

// Use Cases
import { LoginUseCase, RefreshTokenUseCase, LogoutUseCase } from './presentation/use-case';

// Strategies & Guards
import { LocalClientStrategy, JwtStrategy } from './infra/strategies';

// Clients module (para ClientRepository)
import { ClientsModule } from '../clients/clients.module';

/**
 * AuthenticationModule - Orquestra todo o sistema de autenticação
 * 
 * Responsabilidades:
 * ✅ JWT token generation (15 min access, 7 days refresh)
 * ✅ Passport local strategy (email + password)
 * ✅ Passport JWT strategy (Bearer token)
 * ✅ Login / Refresh / Logout / GetMe endpoints
 * ✅ Cookie management (httpOnly refresh token)
 * 
 * Dependências injetadas:
 * - ClientRepository (para validação de credenciais)
 * - JwtService (para geração de tokens)
 * - ConfigService (para segredos)
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', 900),  // 15 min
        },
      }),
      inject: [ConfigService],
    }),
    ClientsModule,  // Para ClientRepository
  ],
  controllers: [AuthController],
  providers: [
    // Use Cases
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,

    // Strategies
    LocalClientStrategy,
    JwtStrategy,
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthenticationModule {}
