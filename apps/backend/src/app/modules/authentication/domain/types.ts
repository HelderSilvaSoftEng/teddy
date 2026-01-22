export interface TokenPayloadUser {
  sub: string;          // UserId
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}


export interface RefreshTokenPayload {
  sub: string;          // UserId
  jti: string;          // ID único para revogação
  typ: 'refresh';
  iat?: number;
  exp?: number;
}

export interface RecoveryTokenPayload {
  sub: string;          // UserId
  email: string;
  type: 'recovery';
  iat?: number;
  exp?: number;
}


export interface ICurrentUser {
  id: string;
  email: string;
  name?: string;
  accessCount?: number;
}


export interface LoginResponse {
  user?: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  accessCount?: number;
}


export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}


export interface LogoutResponse {
  message: string;
}
