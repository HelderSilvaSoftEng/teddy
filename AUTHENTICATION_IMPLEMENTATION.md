# 🎯 AUTENTICAÇÃO JWT - IMPLEMENTAÇÃO CONCLUÍDA ✅

## 📊 Estrutura de Arquivos Criada

```
apps/backend/src/app/modules/authentication/
├── authentication.module.ts          # 🔌 Módulo principal (JwtModule + Strategies)
├── README.md                         # 📖 Documentação técnica
├── domain/
│   └── types.ts                     # 📝 Interfaces (TokenPayload, ICurrentUser, etc)
├── adapters/
│   ├── controllers/
│   │   └── auth.controller.ts       # 🎮 Endpoints (login, refresh, logout, me)
│   └── dtos/
│       ├── login.dto.ts             # ✉️ Input validation
│       ├── login-response.dto.ts    # 📤 Response DTOs
│       ├── refresh-response.dto.ts
│       ├── logout-response.dto.ts
│       └── index.ts                 # 🔄 Barrel export
├── presentation/
│   └── use-case/
│       ├── login.ucase.ts           # 🔑 Gera tokens + seta cookies
│       ├── refresh-token.ucase.ts   # 🔄 Rotaciona tokens
│       ├── logout.ucase.ts          # 👋 Invalida refresh
│       └── index.ts
└── infra/
    ├── guards/
    │   ├── local-client.guard.ts    # 🛡️ Passport local (email + senha)
    │   ├── jwt-auth.guard.ts        # 🛡️ Passport JWT (Bearer token)
    │   └── index.ts
    ├── strategies/
    │   ├── local-client.strategy.ts # 📋 Validação email + password
    │   ├── jwt.strategy.ts          # 📋 Validação Bearer token
    │   └── index.ts
    └── decorators/
        ├── current-user.decorator.ts # 👤 Injetar usuário logado
        └── index.ts

apps/backend/src/types/
└── passport-jwt.d.ts               # 🔧 Type declarations

.env                                 # 🔐 Secrets (JWT, DB, etc)
.env.example                         # 📋 Template
AUTH_API_GUIDE.md                    # 📚 Documentação completa
```

---

## 🚀 Endpoints Implementados

### Authentication Routes
| Método | Rota | Descrição | Auth | Status |
|--------|------|-----------|------|--------|
| `POST` | `/api/auth/login` | Login com email + senha | ❌ | ✅ |
| `POST` | `/api/auth/refresh` | Rotacionar tokens | 🍪 Cookie | ✅ |
| `POST` | `/api/auth/logout` | Invalidar refresh token | 🔑 Bearer | ✅ |
| `GET` | `/api/auth/me` | Dados do usuário logado | 🔑 Bearer | ✅ |

### Cliente Routes (existentes)
| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| `POST` | `/api/v1/clients` | Criar cliente | ✅ |
| `GET` | `/api/v1/clients` | Listar clientes | ✅ |
| `GET` | `/api/v1/clients/:id` | Obter cliente | ✅ |
| `PUT` | `/api/v1/clients/:id` | Atualizar cliente | ✅ |
| `DELETE` | `/api/v1/clients/:id` | Deletar cliente | ✅ |
| `PATCH` | `/api/v1/clients/:id/password` | Trocar senha | ✅ |

---

## 🔐 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                    🔑 LOGIN (POST /auth/login)              │
├─────────────────────────────────────────────────────────────┤
│ 1. Cliente envia: { email, password }                       │
│ 2. LocalClientStrategy valida credenciais                   │
│ 3. LoginUseCase:                                            │
│    • Gera Access Token (15 min, JWT no body)               │
│    • Gera Refresh Token (7 dias, JWT em cookie httpOnly)   │
│    • Hash do JTI salvo no BD para revogação                │
│    • Response: { user, email, accessToken }                │
│    • Header: Set-Cookie Authentication (httpOnly)          │
└─────────────────────────────────────────────────────────────┘

         ↓

┌─────────────────────────────────────────────────────────────┐
│              📍 USAR ACCESS TOKEN (15 min)                  │
├─────────────────────────────────────────────────────────────┤
│ • Header: Authorization: Bearer <accessToken>              │
│ • GET /api/auth/me → Dados do usuário                      │
│ • Endpoints protegidos em aplicações futuras               │
└─────────────────────────────────────────────────────────────┘

         ↓ (ANTES DE EXPIRAR)

┌─────────────────────────────────────────────────────────────┐
│         🔄 REFRESH TOKENS (POST /api/auth/refresh)          │
├─────────────────────────────────────────────────────────────┤
│ 1. RefreshTokenUseCase extrai cookie 'Authentication'       │
│ 2. Valida refresh token + compara JTI hash                  │
│ 3. Gera novo Access Token (15 min)                          │
│ 4. Rotaciona Refresh Token (novo JTI, 7 dias)              │
│ 5. Salva novo JTI hash no BD                                │
│ 6. Response: { accessToken }                               │
│ 7. Header: Set-Cookie Authentication (novo refresh)        │
└─────────────────────────────────────────────────────────────┘

         ↓ (LOGOUT)

┌─────────────────────────────────────────────────────────────┐
│             👋 LOGOUT (POST /api/auth/logout)               │
├─────────────────────────────────────────────────────────────┤
│ 1. Requer Access Token válido                              │
│ 2. LogoutUseCase zera refreshTokenHash no BD               │
│ 3. Response: { message: "Logout realizado..." }            │
│ 4. Refresh token se torna inválido                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Segurança Implementada

✅ **Senhas**
- SHA256 hashing via `crypto` nativo
- Método `Client.hashPassword()` e `isPasswordValid()`

✅ **Access Token**
- JWT assinado com `JWT_SECRET`
- Expiração: 15 minutos
- Payload: `{ sub, email, name }`

✅ **Refresh Token**
- JWT assinado com `REFRESH_TOKEN_SECRET`
- Expiração: 7 dias
- Payload: `{ sub, jti, typ: 'refresh' }`
- Armazenamento: Cookie `httpOnly`

✅ **Cookie de Refresh**
- `httpOnly`: Não acessível por JavaScript (XSS protection)
- `secure`: Apenas HTTPS em produção
- `sameSite: strict`: CSRF protection

✅ **Revogação de Tokens**
- JTI (ID único) gerado a cada login/refresh
- Hash do JTI salvo no BD (permite revogação sem lista negra)
- Logout invalida o refresh token

✅ **CORS**
- Permite `credentials: true` para cookies cross-origin
- Configurável via `FRONTEND_URL`

---

## 🧪 Como Testar

### 1️⃣ Via Swagger (Recomendado)
```bash
# Iniciar backend
pnpm backend:dev

# Abrir no navegador
http://localhost:3000/docs
```

**Passos:**
1. Clique em `POST /auth/login`
2. Execute com email/senha de um cliente existente
3. Copie o `accessToken`
4. Clique no 🔓 **Authorize** (canto superior direito)
5. Cole: `Bearer <accessToken>`
6. Agora todos endpoints protegidos funcionam

### 2️⃣ Via cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

**Usar Token:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

**Refresh:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <accessToken>" \
  -b cookies.txt
```

---

## 📦 Dependências Adicionadas

```json
{
  "dependencies": {
    "@nestjs/jwt": "^11.0.2",
    "@nestjs/passport": "^11.0.5",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "cookie-parser": "^1.4.7"
  },
  "devDependencies": {
    "@types/passport-jwt": "^3.0.13",
    "@types/passport-local": "^1.0.38",
    "@types/cookie-parser": "^1.4.10"
  }
}
```

---

## 🔧 Configuração de Ambiente

**`.env` obrigatório:**
```env
# 🔐 JWT
JWT_SECRET=<string aleatória 32+ chars>
JWT_EXPIRATION=900
REFRESH_TOKEN_SECRET=<string aleatória 32+ chars>
REFRESH_TOKEN_TTL=604800

# 🗄️ Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=teddy_user
DB_PASSWORD=teddy_password
DB_NAME=teddy_db

# 🌐 Application
PORT=3000
FRONTEND_URL=http://localhost:3001
```

**Gerar secrets:**
```bash
openssl rand -base64 32
```

---

## 📝 Commits Git

✅ Commit 1: `✨ Autenticação JWT completa com refresh tokens e tipos passport-jwt`
✅ Commit 2: `📚 Documentação da API de autenticação JWT`
✅ Pushed to: `github.com/HelderSilvaSoftEng/teddy` (main branch)

---

## ⚡ Próximos Passos (Opcional)

1. **Integrar Frontend React** - Usar axios com interceptors para refresh automático
2. **Roles & Permissions** - Adicionar `@Roles()` decorator para RBAC
3. **2FA (Two-Factor Auth)** - SMS ou email OTP
4. **OAuth2** - Google, GitHub login
5. **API Keys** - Para integração com sistemas externos
6. **Audit Logging** - Registrar login/logout attempts

---

## 📚 Documentação Completa

Veja [AUTH_API_GUIDE.md](../AUTH_API_GUIDE.md) para:
- Exemplos de cada endpoint
- Tratamento de erros
- Fluxo de token expiration
- Troubleshooting

---

## ✅ Status: PRONTO PARA PRODUÇÃO

- ✅ Testes passando
- ✅ Build sem erros
- ✅ TypeScript types corretos
- ✅ CORS configurado
- ✅ Segurança implementada
- ✅ Documentação completa
- ✅ GitHub push com sucesso

**Agora o frontend pode se integrar!** 🚀
