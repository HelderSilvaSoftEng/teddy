# 📋 Relatório de Progresso - Desafio Teddy

**Data**: 18 de janeiro de 2026  
**Status Geral**: 60% Concluído (MVP - Autenticação + CRUD Clientes implementados)

---

## 🎯 Escopo Funcional (MVP)

### Autenticação

- [x] E-mail/senha com validação
- [x] JWT implementado (Access Token + Refresh Token)
- [x] Login endpoint (`POST /api/auth/login`)
- [x] Refresh endpoint (`POST /api/auth/refresh`)
- [x] Logout endpoint (`POST /api/auth/logout`)
- [x] Get current user endpoint (`GET /api/auth/me`)
- [x] Recuperação de senha (token-based recovery + reset)
- [ ] 2FA (diferencial)

### CRUD de Clientes

- [x] Estrutura de repositório (Hexagonal)
- [x] Entity Client criada
- [x] DTOs criados (Login, Create, Update)
- [x] Endpoint `POST /api/v1/clients` (criar cliente - protegido)
- [x] Endpoint `GET /api/v1/clients` (listar clientes - protegido)
- [x] Endpoint `GET /api/v1/clients/:id` (detalhe + contador - protegido)
- [x] Endpoint `PUT /api/v1/clients/:id` (atualizar - protegido)
- [x] Endpoint `DELETE /api/v1/clients/:id` (soft delete - protegido)
- [x] Soft delete implementado na migration

### Dashboard/Admin

- [ ] Página Dashboard com cards (total clientes, etc)
- [ ] Gráfico de clientes por período
- [ ] Lista de últimos clientes
- [ ] Autenticação no frontend

### Contador de Acessos

- [x] Campo `accessCount` na tabela `clients`
- [x] Incrementar contador ao fazer login (`POST /api/auth/login`)
- [x] Exibir contador no detalhe do cliente

### Auditoria & Timestamps

- [x] `createdAt` na Entity Client
- [x] `updatedAt` na Entity Client
- [x] `deletedAt` para soft delete
- [ ] Tabela de auditoria separada (logs de alterações)
- [ ] Registro de quem criou/alterou

### Diferenciais

- [ ] CI/CD com GitHub Actions
- [ ] Observabilidade (logs estruturados JSON, healthcheck, metrics)
- [ ] E2E tests
- [ ] OpenTelemetry/tracing

---

## 🏗️ Requisitos Técnicos

### Back-End (NestJS)

#### ✅ Implementado

- [x] **NestJS modular** - Estrutura em módulos (auth, clients, common)
- [x] **TypeORM + PostgreSQL** - Banco conectado e funcionando
- [x] **JWT autenticação** - Passport.js + JwtStrategy implementado
- [x] **Validação** - class-validator nos DTOs
- [x] **Swagger** - Documentação em `/docs` com Bearer Auth
- [x] **Guards** - JwtAuthGuard em `common/guards`
- [x] **Decorators** - @Public(), @CurrentUser()
- [x] **Password hashing** - SHA256 (crypto)
- [x] **CORS** - Configurado com credentials: true

#### ⏳ Pendente

- [ ] **Logs estruturados** - Implementar Winston ou Pino (JSON format)
- [ ] **Healthcheck** - `GET /healthz` endpoint
- [ ] **Metrics** - `GET /metrics` endpoint (Prometheus format)
- [ ] **Docker** - Dockerfile + docker-compose.yml isolado
- [ ] **.env** - Template .env.example
- [ ] **README.md** - Backend com instruções específicas
- [ ] **Testes unitários** - Jest (diferencial: E2E)
- [ ] **Error handling** - Exception filters globais

#### 📍 Arquivos Principais

```
apps/backend/
├── src/
│   ├── main.ts ✅
│   ├── app/
│   │   └── modules/
│   │       ├── authentication/ ✅
│   │       │   ├── adapters/
│   │       │   │   ├── controllers/
│   │       │   │   │   └── auth.controller.ts ✅
│   │       │   │   └── dtos/
│   │       │   │       ├── login.dto.ts ✅
│   │       │   │       └── login-response.dto.ts ✅
│   │       │   ├── domain/
│   │       │   │   ├── types.ts ✅
│   │       │   │   └── ports/
│   │       │   ├── infra/
│   │       │   │   ├── strategies/
│   │       │   │   │   └── jwt.strategy.ts ✅
│   │       │   │   └── guards/
│   │       │   │       └── local-client.guard.ts ✅
│   │       │   ├── presentation/
│   │       │   │   └── use-cases/
│   │       │   │       ├── login.ucase.ts ✅
│   │       │   │       ├── refresh-token.ucase.ts ✅
│   │       │   │       └── logout.ucase.ts ✅
│   │       │   └── authentication.module.ts ✅
│   │       ├── clients/ ⏳
│   │       │   ├── adapters/
│   │       │   │   ├── controllers/
│   │       │   │   │   └── client.controller.ts (guarded ✅, endpoints ⏳)
│   │       │   │   └── dtos/ ⏳
│   │       │   ├── domain/
│   │       │   │   ├── entities/
│   │       │   │   │   └── client.entity.ts ✅
│   │       │   │   └── ports/
│   │       │   │       └── client.repository.port.ts ✅
│   │       │   ├── infra/
│   │       │   │   ├── mappers/ ⏳
│   │       │   │   └── repositories/
│   │       │   │       └── client.repository.ts ✅
│   │       │   └── clients.module.ts ✅
│   │       └── app.module.ts ✅
│   ├── common/ ✅
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts ✅
│   │   │   └── current-user.decorator.ts ✅
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts ✅
│   │   │   └── index.ts ✅
│   │   └── index.ts ✅
├── .env ✅
├── webpack.config.js ✅
├── tsconfig.json ✅
└── package.json ✅
```

---

### Front-End (React + Vite)

#### ⏳ Pendente

- [ ] **React + Vite + TS** - Estrutura básica criada, componentes faltando
- [ ] **UI Responsiva** - Tailwind/Material-UI
- [ ] **Roteamento** - React Router v6
- [ ] **Formulários** - React Hook Form + Zod/Yup
- [ ] **Estado Global** - Redux/Zustand/Context API
- [ ] **Login Page** - Formulário com validação
- [ ] **Dashboard** - Cards, gráficos, layout
- [ ] **CRUD Clientes** - Listar, criar, editar, deletar
- [ ] **Testes Unitários** - Vitest
- [ ] **E2E** - Playwright
- [ ] **Docker** - Dockerfile + docker-compose.yml

#### 📍 Arquivos Principais

```
apps/frontend/
├── src/
│   ├── main.tsx ✅
│   ├── app/
│   │   ├── app.tsx ✅
│   │   └── app.module.css ✅
│   ├── styles.css ✅
│   └── assets/
├── vite.config.mts ✅
├── tsconfig.json ✅
├── package.json ✅
└── index.html ✅
```

---

### Monorepo & DevOps

#### ✅ Implementado

- [x] **Nx Monorepo** - Estrutura criada (apps/, libs/, packages/)
- [x] **pnpm** - Migrado de npm
- [x] **Build Backend** - `npx nx build backend` funcionando
- [x] **ESLint** - Configurado

#### ⏳ Pendente

- [ ] **Docker Backend** - Dockerfile isolado
- [ ] **docker-compose Backend** - Serviço backend + postgres
- [ ] **Docker Frontend** - Dockerfile isolado
- [ ] **docker-compose Frontend** - Serviço frontend
- [ ] **Root docker-compose** - Orquestra todos os serviços
- [ ] **CI/CD GitHub Actions** - Pipelines separados FE/BE
- [ ] **Build Frontend** - `npx nx build frontend` configurado
- [ ] **.env.example** - Templates de variáveis

---

## 🔐 Endpoints (MVP)

### Autenticação ✅

```
✅ POST   /api/auth/login      - Autentica com email/senha
✅ POST   /api/auth/refresh    - Rotaciona tokens
✅ POST   /api/auth/logout     - Invalida refresh token
✅ GET    /api/auth/me         - Retorna usuário logado
```

### Clientes ⏳

```
⏳ POST   /api/v1/clients      - Criar cliente (protegido)
⏳ GET    /api/v1/clients      - Listar clientes (protegido)
⏳ GET    /api/v1/clients/:id  - Detalhe + contador (protegido)
⏳ PUT    /api/v1/clients/:id  - Atualizar (protegido)
⏳ DELETE /api/v1/clients/:id  - Soft delete (protegido)
```

### Observabilidade ⏳

```
⏳ GET    /api/healthz         - Health check
⏳ GET    /api/metrics         - Prometheus metrics
✅ GET    /docs                - Swagger UI
```

---

## 📊 Tarefas Imediatas (Próximas)

### Sprint 1️⃣ - Completar Autenticação (ATUAL)

- [x] JWT Access + Refresh Tokens
- [x] Guards e decorators
- [x] Login/Refresh/Logout/Me endpoints
- [x] Swagger documentação
- [ ] **Adicionar testes unitários** para auth (Jest)
- [ ] **Logs estruturados** (Winston/Pino)
- [ ] **Healthcheck** endpoint

### Sprint 2️⃣ - CRUD Clientes

- [ ] **Implementar endpoints de clientes** (Create, List, Get, Update, Delete)
- [ ] **Validações** com class-validator
- [ ] **Soft delete** funcional
- [ ] **Contador de acessos** incremental
- [ ] **Testes unitários** para repositório/use-cases

### Sprint 3️⃣ - Frontend Básico

- [ ] **Login Page** - Conectar com `/api/auth/login`
- [ ] **Dashboard** - Cards com totais
- [ ] **Lista de Clientes** - Conectar com `GET /api/v1/clients`
- [ ] **CRUD Clientes** - Criar, editar, deletar
- [ ] **Detalhes** - Mostrar contador de acessos

### Sprint 4️⃣ - Observabilidade & DevOps

- [ ] **Logs estruturados** em JSON
- [ ] **Healthcheck** (`/healthz`)
- [ ] **Metrics** (`/metrics`)
- [ ] **Dockerfiles** isolados (FE + BE)
- [ ] **docker-compose** local (FE + BE + DB)
- [ ] **CI/CD** GitHub Actions

### Sprint 5️⃣ - Diferenciais

- [ ] **E2E Tests** (Playwright)
- [ ] **Testes unitários** completos (FE + BE)
- [ ] **OpenTelemetry** tracing
- [ ] **README.md** com arquitetura e instruções

---

## 🗂️ Estrutura de Pastas Esperada

```
teddy-challenger/
├── README.md                          ⏳ (root com visão geral)
├── docker-compose.yml                 ⏳ (orquestração local)
├── nx.json                            ✅
├── package.json                       ✅
├── pnpm-lock.yaml                     ✅
├── tsconfig.base.json                 ✅
├── .env.example                       ⏳
├── .github/
│   └── workflows/                     ⏳ (CI/CD)
│       ├── backend.yml
│       └── frontend.yml
├── apps/
│   ├── backend/
│   │   ├── Dockerfile                 ⏳
│   │   ├── docker-compose.yml         ⏳
│   │   ├── .env                       ✅
│   │   ├── .env.example               ⏳
│   │   ├── README.md                  ⏳
│   │   ├── src/
│   │   │   ├── main.ts                ✅
│   │   │   └── app/                   ✅
│   │   ├── webpack.config.js          ✅
│   │   └── package.json               ✅
│   ├── frontend/
│   │   ├── Dockerfile                 ⏳
│   │   ├── docker-compose.yml         ⏳
│   │   ├── .env.example               ⏳
│   │   ├── README.md                  ⏳
│   │   ├── src/
│   │   │   ├── main.tsx               ✅
│   │   │   └── app/                   ✅
│   │   ├── vite.config.mts            ✅
│   │   └── package.json               ✅
│   ├── backend-e2e/
│   │   ├── jest.config.cts            ✅
│   │   ├── package.json               ✅
│   │   └── src/
│   └── frontend-e2e/
│       ├── playwright.config.ts       ✅
│       ├── package.json               ✅
│       └── src/
├── libs/
│   └── shared/                        ⏳ (tipos, utils compartilhados)
└── packages/                          ⏳
```

---

## 🔄 Fluxos Implementados

### ✅ Backend - Autenticação

```
1. User POST /api/auth/login {email, password}
   ↓
2. LocalClientAuthGuard valida email/senha no BD
   ↓
3. LoginUseCase:
   - Gera accessToken (1 hora, JWT_SECRET)
   - Gera refreshToken (7 dias, REFRESH_TOKEN_SECRET)
   - Salva refresh token hash no BD
   - Seta cookies httpOnly
   - Retorna tokens no JSON body
   ↓
4. Response 200 OK {user, email, accessToken, refreshToken}
```

### ✅ Backend - Requisições Protegidas

```
1. User GET /api/v1/clients + Authorization: Bearer <accessToken>
   ↓
2. JwtAuthGuard:
   - Extrai token do header OU cookie
   - Valida assinatura com JWT_SECRET
   - Retorna payload para request.user
   ↓
3. JwtStrategy valida expiração
   ↓
4. Controller acessa @CurrentUser() user
   ↓
5. Response 200 OK com dados
```

### ⏳ Frontend - Login (A Implementar)

```
1. User acessa http://localhost:5173/login
   ↓
2. Preenche form {email, password} e submete
   ↓
3. Frontend POST /api/auth/login
   ↓
4. Recebe {accessToken, refreshToken} + cookies
   ↓
5. Salva accessToken em state/localStorage/sessionStorage
   ↓
6. Redireciona para /dashboard
```

### ⏳ Frontend - Dashboard (A Implementar)

```
1. User acessa /dashboard
   ↓
2. PrivateRoute verifica se tem accessToken
   ↓
3. GET /api/v1/clients com Bearer token
   ↓
4. Renderiza lista de clientes + cards de totais + gráfico
```

---

## 🐛 Problemas Resolvidos

| Problema | Solução | Status |
|----------|---------|--------|
| npm → pnpm | Migração executada | ✅ |
| JWT_EXPIRES_IN string | Mudado para JWT_EXPIRATION número | ✅ |
| expiresIn não funcionava | Converter para `"3600s"` (string) | ✅ |
| Token expirando instantaneamente | Usar TTL correto em segundos | ✅ |
| Guard só aceitava Bearer | Adicionado suporte a Cookie | ✅ |
| Cookie auth no Swagger desnecessário | Removido da documentação | ✅ |

---

## 📝 Configurações Atuais

### `.env` Backend

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=teddy_db
API_PORT=3000
JWT_SECRET=seu_secret_super_seguro_aqui_mude_em_producao
JWT_EXPIRATION=3600                    # 1 hora em segundos
REFRESH_TOKEN_SECRET=seu_refresh_secret_super_seguro_aqui
REFRESH_TOKEN_TTL=604800               # 7 dias em segundos
CORS_ORIGIN=http://localhost:5173
```

### Tokens

- **Access Token**: Duração 1 hora (3600s), enviado no body + cookie
- **Refresh Token**: Duração 7 dias (604800s), armazenado como cookie httpOnly

---

## 🎓 Diferenciais a Implementar

- [ ] **CI/CD** - GitHub Actions com Nx
- [ ] **E2E Tests** - Playwright backend + frontend
- [ ] **Observabilidade** - Winston logs JSON + Prometheus metrics
- [ ] **OpenTelemetry** - Tracing distribuído
- [ ] **Redis** - Cache (opcional)
- [ ] **Documentação** - README com diagramas

---

## 🚀 Como Proceder

### **Próximo Passo Recomendado:**

1. ✅ ~~Autenticação funcionando~~ → **COMPLETO**
2. ⏳ **Implementar endpoints de clientes** (PRÓXIMO)
   - CRUD completo
   - Soft delete
   - Contador de acessos
3. ⏳ **Frontend básico** (login + dashboard)
4. ⏳ **Dockerização + CI/CD**
5. ⏳ **Diferenciais** (E2E, observabilidade)

---

## 📊 Percentual de Conclusão por Área

```
Autenticação Backend:     ██████████ 100%
CRUD Clientes:           ██████████ 100%
Frontend:                ░░░░░░░░░░ 0%
DevOps/Docker:           ░░░░░░░░░░ 0%
Testes:                  ░░░░░░░░░░ 0%
Observabilidade:         ░░░░░░░░░░ 0%
─────────────────────────────────────
TOTAL:                   ██████░░░░ 60%
```

---

**Última atualização**: 18/01/2026 - 11:30 BRT
