# 🔐 Módulo de Autenticação

Implementação completa de autenticação com JWT e refresh tokens seguindo a arquitetura hexagonal.

## 🎯 Características

### ✅ Segurança
- **Access Token** (JWT): 15 minutos de duração
- **Refresh Token** (JWT): 7 dias de duração
- **Cookie httpOnly**: Refresh token armazenado com segurança (não acessível via JavaScript)
- **SHA256 Hashing**: Passwords e JTI tokens hasheados no banco
- **JTI Revocation**: Cada token tem um ID único para rastreamento

### 🔄 Fluxo Completo

```
1. LOGIN
   POST /api/auth/login
   Body: { email, password }
   ├─ LocalClientStrategy valida credenciais
   ├─ LoginUseCase gera tokens
   ├─ Access Token → Response body
   └─ Refresh Token → Set-Cookie (httpOnly)

2. REFRESH
   POST /api/auth/refresh
   Cookie: Authentication (refresh token)
   ├─ Extrai refresh token do cookie
   ├─ RefreshTokenUseCase valida JTI hash
   ├─ Novo access token → Response body
   └─ Novo refresh token → Set-Cookie (rotacionado)

3. LOGOUT
   POST /api/auth/logout
   Header: Authorization: Bearer <access-token>
   ├─ JwtAuthGuard valida token
   ├─ LogoutUseCase limpa refresh token hash no BD
   └─ Response: { message: "Logout realizado" }

4. GET ME
   GET /api/auth/me
   Header: Authorization: Bearer <access-token>
   └─ Retorna: { id, email, name }
```

## 📁 Estrutura de Arquivos

```
authentication/
├── domain/
│   └── types.ts                          # Interfaces (TokenPayloadUser, RefreshTokenPayload, ICurrentUser)
├── presentation/
│   └── use-case/
│       ├── login.ucase.ts               # Gera access + refresh tokens, seta cookie
│       ├── refresh-token.ucase.ts       # Valida e rotaciona tokens
│       ├── logout.ucase.ts              # Invalida refresh token
│       └── index.ts                     # Exports
├── adapters/
│   ├── controllers/
│   │   └── auth.controller.ts           # 4 endpoints (POST login, refresh, logout, GET me)
│   └── dtos/
│       ├── login.dto.ts                 # { email, password }
│       ├── login-response.dto.ts        # { user, email, accessToken }
│       ├── refresh-response.dto.ts      # { accessToken }
│       ├── logout-response.dto.ts       # { message }
│       └── index.ts                     # Exports
├── infra/
│   ├── strategies/
│   │   ├── local-client.strategy.ts     # Passport local (email + password)
│   │   ├── jwt.strategy.ts              # Passport JWT (Bearer token)
│   │   └── index.ts                     # Exports
│   ├── guards/
│   │   ├── local-client.guard.ts        # AuthGuard('clients')
│   │   ├── jwt-auth.guard.ts            # AuthGuard('jwt')
│   │   └── index.ts                     # Exports
│   └── decorators/
│       ├── current-user.decorator.ts    # @CurrentUser() - Injeta ICurrentUser
│       └── index.ts                     # Exports
└── authentication.module.ts             # Módulo principal
```

## 🔌 Integração

### AppModule
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ClientsModule,
    AuthenticationModule,  // ← NOVO
  ],
})
export class AppModule {}
```

### main.ts
```typescript
// CORS com suporte a cookies
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,  // ✅ Permite cookies cross-origin
});

// Parser de cookies
app.use(cookieParser());
```

## 🌍 Variáveis de Ambiente

```env
# JWT
JWT_SECRET=seu_secret_32_caracteres_minimo
JWT_EXPIRATION=900              # 15 minutos em segundos

# Refresh Token
REFRESH_TOKEN_SECRET=seu_secret_diferente
REFRESH_TOKEN_TTL=604800        # 7 dias em segundos

# CORS
FRONTEND_URL=http://localhost:3001
```

## 📊 Banco de Dados

Cliente já possui as colunas necessárias:

```typescript
// Client Entity
@Column({ type: 'varchar', nullable: true })
refreshTokenHash?: string;      // Hash do JTI para validação

@Column({ type: 'timestamp', nullable: true })
refreshTokenExpires?: Date;     // Data de expiração do refresh token
```

## 🧪 Testando no Swagger

1. **Navegue para**: http://localhost:3000/docs
2. **POST /auth/login**
   ```json
   {
     "email": "cliente@example.com",
     "password": "senhaSegura123"
   }
   ```
   → Recebe `accessToken` no body e `Authentication` cookie

3. **POST /auth/refresh**
   → Automaticamente usa cookie `Authentication`
   → Recebe novo `accessToken`

4. **GET /auth/me**
   → Clique em "Authorize" (🔒) e cole o access token
   → Retorna dados do usuário

5. **POST /auth/logout**
   → Clique em "Authorize" e cole o access token
   → Invalida o refresh token

## 🔐 Fluxo de Segurança

### Login
1. ✅ Email + senha validados pelo `LocalClientStrategy`
2. ✅ Cliente verificado se está ACTIVE
3. ✅ Access Token gerado com payload curto (15 min)
4. ✅ Refresh Token gerado com JTI único (7 dias)
5. ✅ JTI hasheado com SHA256 + salvo no BD
6. ✅ Refresh Token enviado em cookie httpOnly
7. ✅ Access Token retornado no body JSON

### Refresh
1. ✅ Refresh token extraído do cookie (seguro)
2. ✅ JWT validado e decodificado
3. ✅ JTI hash comparado com hash no BD (revogação)
4. ✅ Expiração verificada
5. ✅ Novo access token gerado
6. ✅ Novo refresh token gerado (rotação)
7. ✅ Novos tokens no body + cookie

### Logout
1. ✅ Access token validado
2. ✅ Refresh token hash + expiração zerados no BD
3. ✅ Próximas tentativas de refresh falharão

## 🎓 Conceitos Aplicados

### Hexagonal Architecture
- **Domain**: Tipos e interfaces de negócio
- **Application**: Lógica de casos de uso
- **Adapters**: Controllers, DTOs, Mappers
- **Infrastructure**: Estratégias, Guards, Repos

### Passport.js Patterns
- LocalStrategy: Credential-based authentication
- JwtStrategy: Token-based authentication
- Guards: Request lifecycle protection
- Decorators: Parameter injection

### Security Best Practices
- ✅ Passwords hasheados (SHA256)
- ✅ Refresh tokens em cookie httpOnly
- ✅ JTI para rastreamento + revogação
- ✅ Expiração dupla (token + BD)
- ✅ CORS com credentials: true
- ✅ SameSite=strict para proteção CSRF

## 📚 Referências

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport.js](http://www.passportjs.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
