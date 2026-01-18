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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { LoginUseCase } from '../../presentation/use-case/login.ucase';
import { RefreshTokenUseCase } from '../../presentation/use-case/refresh-token.ucase';
import { LogoutUseCase } from '../../presentation/use-case/logout.ucase';
import { LocalClientAuthGuard } from '../../infra/guards/local-client.guard';
import { JwtAuthGuard } from '../../infra/guards/jwt-auth.guard';
import { CurrentUser } from '../../infra/decorators/current-user.decorator';
import { LoginDto } from '../../adapters/dtos/login.dto';
import { LoginResponseDto } from '../../adapters/dtos/login-response.dto';
import { RefreshResponseDto } from '../../adapters/dtos/refresh-response.dto';
import { LogoutResponseDto } from '../../adapters/dtos/logout-response.dto';
import type { ICurrentUser } from '../../domain/types';

/**
 * AuthController - Orquestra rotas de autenticação
 * 
 * Endpoints:
 * POST /login        - Login com email + senha → Access Token
 * POST /refresh      - Refresh Token → novo Access Token
 * POST /logout       - Invalida refresh token
 * GET  /me          - Retorna dados do usuário logado
 */
@Controller('auth')
@ApiTags('🔐 Autenticação')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  /**
   * POST /auth/login
   * 
   * Login com email + senha
   * Retorna: { user, email, accessToken }
   * Cookie: Authentication (httpOnly, refresh token)
   */
  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalClientAuthGuard)
  @ApiOperation({
    summary: '🔑 Fazer login',
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
    @Body() _dto: LoginDto,  // Validado pelo guard
    @CurrentUser() user: ICurrentUser,
    @Res() response: Response,
  ): Promise<void> {
    try {
      this.logger.debug(`📍 POST /auth/login chamado para: ${user.email}`);

      const result = await this.loginUseCase.execute(user, response);

      response.status(200).json(result);
    } catch (error) {
      this.logger.error(
        `❌ Erro em login: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * POST /auth/refresh
   * 
   * Rotaciona tokens
   * Extrai refresh token do cookie
   * Retorna novo access token
   */
  @Post('refresh')
  @HttpCode(200)
  @ApiCookieAuth('Authentication')
  @ApiOperation({
    summary: '🔄 Rotacionar tokens',
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
      this.logger.debug('📍 POST /auth/refresh chamado');

      // Extrair refresh token do cookie
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

  /**
   * POST /auth/logout
   * 
   * Invalida refresh token
   * Requer JWT Bearer token
   */
  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '👋 Fazer logout',
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
  async logout(@CurrentUser() user: ICurrentUser): Promise<LogoutResponseDto> {
    try {
      this.logger.debug(`📍 POST /auth/logout chamado para: ${user.email}`);

      return await this.logoutUseCase.execute(user);
    } catch (error) {
      this.logger.error(
        `❌ Erro em logout: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * GET /auth/me
   * 
   * Retorna dados do usuário logado
   * Requer JWT Bearer token
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '👤 Obter usuário logado',
    description: 'Retorna dados do usuário autenticado. Requer access token válido.',
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
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  async getMe(@CurrentUser() user: ICurrentUser): Promise<ICurrentUser> {
    this.logger.debug(`📍 GET /auth/me chamado para: ${user.email}`);
    return user;
  }
}
