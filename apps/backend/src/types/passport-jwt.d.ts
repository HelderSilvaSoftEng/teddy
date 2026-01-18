/**
 * Type declarations for passport-jwt
 * Resolves TypeScript errors for passport-jwt module
 */

declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport';
  import { Request } from 'express';

  export interface StrategyOptions {
    jwtFromRequest: (req: Request) => string | null;
    secretOrKey?: string | Buffer;
    secretOrPublicKey?: string | Buffer;
    audience?: string;
    algorithms?: string[];
    issuer?: string;
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
  }

  export interface VerifiedCallback {
    (err: Error | null, user?: any, info?: any): void;
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: (payload: any, done: VerifiedCallback) => void
    );
    authenticate(req?: Request, options?: any): void;
  }

  export interface ExtractJwt {
    fromHeader(
      header_name: string
    ): (request: Request) => string | null;
    fromBodyField(field_name: string): (request: Request) => string | null;
    fromUrlQueryParameter(param_name: string): (request: Request) => string | null;
    fromAuthHeaderAsBearerToken(): (request: Request) => string | null;
    fromExtractors(
      extractors: Array<(request: Request) => string | null>
    ): (request: Request) => string | null;
  }

  export const ExtractJwt: ExtractJwt;
}
