import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpCode,
  UseGuards,
  Logger,
  Req,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { Public } from '../../../../../common/decorators/public.decorator';
import { LoginUseCase } from '../../presentation/use-case/login.ucase';
import { RefreshTokenUseCase } from '../../presentation/use-case/refresh-token.ucase';
import { LogoutUseCase } from '../../presentation/use-case/logout.ucase';
import { RecoveryPasswordUseCase } from '../../presentation/use-case/recovery-password.ucase';
import { ResetPasswordUseCase } from '../../presentation/use-case/reset-password.ucase';
import { LocalUserAuthGuard } from '../../infra/guards/local-user.guard';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../infra/decorators/current-user.decorator';
import { LoginDto } from '../../adapters/dtos/login.dto';
import { LoginResponseDto } from '../../adapters/dtos/login-response.dto';
import { RefreshResponseDto } from '../../adapters/dtos/refresh-response.dto';
import { LogoutResponseDto } from '../../adapters/dtos/logout-response.dto';
import { RecoveryPasswordDto } from '../../adapters/dtos/recovery-password.dto';
import { RecoveryPasswordResponseDto } from '../../adapters/dtos/recovery-password-response.dto';
import { ResetPasswordDto } from '../../adapters/dtos/reset-password.dto';
import { ResetPasswordResponseDto } from '../../adapters/dtos/reset-password-response.dto';
import type { ICurrentUser } from '../../domain/types';
import type { IUserRepositoryPort } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/ports/user.repository.port';

@Controller('auth')
@ApiTags('🔐 Autenticação')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly recoveryPasswordUseCase: RecoveryPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepositoryPort,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(200)
  @UseGuards(LocalUserAuthGuard)
  @ApiOperation({
    summary: 'Fazer login',
    description:
      'Autentica usuário com email e senha. Retorna access token no body e refresh token no cookie httpOnly.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou senha inválidos',
  })
  async login(
    @Body() _dto: LoginDto,
    @CurrentUser() user: ICurrentUser,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const result = await this.loginUseCase.execute(user, response);
      response.status(200).json(result);
    } catch (error) {
      this.logger.error(
        `❌ Erro em login: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiCookieAuth('Authentication')
  @ApiOperation({
    summary: 'Rotacionar tokens',
    description:
      'Valida refresh token do cookie e retorna novo access token. Rotaciona automaticamente o refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens rotacionados com sucesso',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido ou expirado',
  })
  async refresh(@Req() request: Request, @Res() response: Response): Promise<void> {
    try {
      this.logger.debug('POST /auth/refresh chamado');

      const refreshToken = request.cookies['Authentication'];
      if (!refreshToken) {
        throw new BadRequestException('Refresh token não encontrado no cookie');
      }

      const result = await this.refreshTokenUseCase.execute(refreshToken, response);

      response.status(200).json(result);
    } catch (error) {
      this.logger.error(
        `❌ Erro em refresh: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Fazer logout',
    description: 'Invalida o refresh token do usuário. Requer access token válido.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout bem-sucedido',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  async logout(
    @CurrentUser() user: ICurrentUser,
    @Res() response: Response,
  ): Promise<void> {
    try {
      this.logger.debug(`POST /auth/logout chamado para: ${user.email}`);

      const result = await this.logoutUseCase.execute(user, response);
      response.status(200).json(result);
    } catch (error) {
      this.logger.error(
        `❌ Erro em logout: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obter usuário logado',
    description: 'Retorna dados do usuário autenticado incluindo contador de acessos. Requer access token válido.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string', nullable: true },
        accessCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  async getMe(@CurrentUser() user: ICurrentUser): Promise<ICurrentUser> {
    this.logger.debug(`📍 GET /auth/me chamado para: ${user.email}`);
    // Buscar usuário completo do banco de dados para incluir accessCount
    const fullUser = await this.userRepository.findById(user.id);
    if (!fullUser) {
      return user;
    }
    const result: ICurrentUser = {
      id: fullUser.id,
      email: fullUser.email,
      name: user.name || undefined,
      accessCount: fullUser.accessCount ?? 0,
    };
    return result;
  }

  @Post('recovery-password')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Solicitar recuperação de senha',
    description: 'Envia link de recuperação para o email do usuário. Link válido por 30 minutos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado com sucesso',
    type: RecoveryPasswordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Email inválido',
  })
  async recoveryPassword(@Body() dto: RecoveryPasswordDto): Promise<RecoveryPasswordResponseDto> {
    try {
      this.logger.debug(`POST /auth/recovery-password chamado para: ${dto.email}`);
      const result = await this.recoveryPasswordUseCase.execute(dto.email);
      return result;
    } catch (error) {
      this.logger.error(
        `❌ Erro em recovery-password: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Post('reset-password')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Resetar senha com token',
    description: 'Cria uma nova senha usando o token de recuperação enviado por email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Senha alterada com sucesso',
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    try {
      this.logger.debug('POST /auth/reset-password chamado');
      const result = await this.resetPasswordUseCase.execute(dto.token, dto.newPassword);
      return result;
    } catch (error) {
      this.logger.error(
        `❌ Erro em reset-password: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Post('increment-access')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Incrementar contador de acessos',
    description: 'Incrementa o contador de acessos do usuário autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contador incrementado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async incrementAccess(@CurrentUser() user: ICurrentUser): Promise<{ message: string }> {
    try {
      this.logger.debug(`POST /auth/increment-access chamado para usuário: ${user.id}`);
      await this.userRepository.incrementAccessCount(user.id);
      return { message: 'Access count incrementado com sucesso' };
    } catch (error) {
      this.logger.error(
        `❌ Erro em increment-access: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
