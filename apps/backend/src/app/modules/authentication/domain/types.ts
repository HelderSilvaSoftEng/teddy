export interface TokenPayloadUser {
  sub: string;          // ClientId
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}


export interface RefreshTokenPayload {
  sub: string;          // ClientId
  jti: string;          // ID único para revogação
  typ: 'refresh';
  iat?: number;
  exp?: number;
}


export interface ICurrentUser {
  id: string;
  email: string;
  name?: string;
}


export interface LoginResponse {
  user?: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}


export interface RefreshResponse {
  accessToken: string;
}


export interface LogoutResponse {
  message: string;
}
