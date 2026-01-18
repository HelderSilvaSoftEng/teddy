/**
 * Tipos e Interfaces para Autenticação
 * Domain Layer - Contém contatos puros de domínio
 */

/**
 * Payload do Access Token (JWT) - Curta duração (15 min)
 */
export interface TokenPayloadUser {
  sub: string;          // ClientId
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}

/**
 * Payload do Refresh Token (JWT) - Longa duração (7 dias)
 */
export interface RefreshTokenPayload {
  sub: string;          // ClientId
  jti: string;          // ID único para revogação
  typ: 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * Usuário atual no contexto da requisição
 */
export interface ICurrentUser {
  id: string;
  email: string;
  name?: string;
}

/**
 * Response do login
 */
export interface LoginResponse {
  user: string;
  email: string;
  accessToken: string;  // Retornado no body
  // refreshToken vem via Set-Cookie (httpOnly)
}

/**
 * Response do refresh
 */
export interface RefreshResponse {
  accessToken: string;
}

/**
 * Response de logout
 */
export interface LogoutResponse {
  message: string;
}
