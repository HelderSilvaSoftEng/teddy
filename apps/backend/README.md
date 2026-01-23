# 🚀 Backend - Teddy CRM

API REST que gerencia tudo: autenticação, clientes, dashboards e observabilidade. Construído com NestJS e TypeScript.
## 🚀 Como Rodar

### Local (sem Docker)
```bash
cd apps/backend
pnpm install
pnpm start
```
Acessa em: **http://localhost:3000/api**
Docs: **http://localhost:3000/docs**

### Com Docker
```bash
cd apps/backend
docker-compose up -d
```

### Variáveis de Ambiente
Cria `.env.local`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/teddy
JWT_SECRET=seu_secret_super_seguro_aqui
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

## 📦 Módulos

### 🔐 **Auth Module** (`src/app/auth/`)
Controla login, JWT tokens e refresh:
- `LoginUseCase`: Valida email/senha, gera tokens
- `RefreshTokenUseCase`: Renova token expirado
- `JwtStrategy`: Valida tokens nas requests
- `AuthGuard`: Middleware que verifica autenticação

**Endpoints:**
```
POST   /api/auth/login          → Login
POST   /api/auth/refresh        → Refresh Token
POST   /api/auth/logout         → Logout (blacklist)
```

### 👥 **Customer Module** (`src/app/customer/`)
CRUD de clientes e seleção:
- `ListCustomersUseCase`: Busca com filtro, paginação e busca por status
- `CreateCustomerUseCase`: Cria novo cliente (ACTIVE)
- `UpdateCustomerUseCase`: Edita dados ou muda status (ACTIVE/SELECTED)
- `DeleteCustomerUseCase`: Deleta cliente (soft delete)

**Endpoints:**
```
GET    /api/customers           → Lista (com filtros)
POST   /api/customers           → Cria
PUT    /api/customers/:id       → Atualiza
DELETE /api/customers/:id       → Deleta
```

**Filtros Disponíveis:**
- `status`: ACTIVE ou SELECTED
- `search`: Busca por nome
- `skip/take`: Paginação
- `sortBy/order`: Ordenação

### 📊 **Dashboard Module** (`src/app/dashboard/`)
Estatísticas e gráficos:
- `GetDashboardStatsUseCase`: Total, selecionados, últimas adições
- `GetCustomerTrendUseCase`: Gráfico de tendência (dia/mês)
- `GetSalaryAnalyticsUseCase`: Análise de salários

**Endpoints:**
```
GET    /api/dashboard/stats           → Estatísticas
GET    /api/dashboard/customer-trend  → Tendências
GET    /api/dashboard/salary          → Salários
```

### 👤 **User Module** (`src/app/user/`)
Informações do usuário:
- `GetUserProfileUseCase`: Retorna dados do usuário autenticado
- `UpdateUserUseCase`: Atualiza perfil

**Endpoints:**
```
GET    /api/users/me            → Dados do usuário autenticado
PUT    /api/users/me            → Atualiza usuário
```

### 🏥 **Health Check**
```
GET    /api/health              → Status da app + banco
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T14:38:01.575Z",
  "uptime": 76.273,
  "database": {
    "status": "up",
    "responseTime": 11
  }
}
```

## 🗄️ Banco de Dados

### Tabelas Principais

**users**
```
id (UUID)
email (VARCHAR, unique)
password (hash SHA256)
status (ACTIVE/INACTIVE)
refreshTokenHash (para segurança)
refreshTokenExpires
accessCount (quantas vezes fez login)
createdAt, updatedAt, deletedAt (soft delete)
```

**customers**
```
id (UUID)
userId (foreign key → users)
name (VARCHAR)
salary (DECIMAL)
company (VARCHAR)
status (ACTIVE/SELECTED)
createdAt, updatedAt, deletedAt (soft delete)
```

### Migrations
Localizadas em `src/migrations/`:
- Controlam versionamento do schema
- Rodam automaticamente na inicialização
- Rollback possível se necessário

## 🔐 Autenticação

### JWT Flow
```
1. Login: POST /api/auth/login
   ↓
2. Retorna: { accessToken, refreshToken, user }
   ↓
3. Frontend salva tokens (localStorage)
   ↓
4. A cada request: Header Authorization: Bearer {accessToken}
   ↓
5. Token expira em 1 hora
   ↓
6. Se expirou: POST /api/auth/refresh com refreshToken
   ↓
7. Novo accessToken retornado
```

### Segurança
- Passwords com hash SHA256
- Tokens JWT com expiração
- Refresh tokens com validade estendida
- Logout com blacklist em Redis
- CORS configurado

## 📊 Observabilidade

### Prometheus Metrics
- `http_requests_total`: Total de requisições
- `http_request_duration`: Tempo de resposta
- `database_query_duration`: Tempo de query
- `active_connections`: Conexões ativas

### Jaeger Tracing
- Rastreia requests ponta a ponta
- Mostra tempo em cada serviço
- Identifica gargalos

### Logs
- Salvo em `logs/` com Winston
- Rotação automática
- Níveis: error, warn, info, debug

## 🧪 Testes

### Unit Tests
```bash
pnpm test
```
Testa cada use case isoladamente

### E2E Tests
```bash
pnpm test:e2e
```
Testa fluxos completos (login → CRUD)

### Load Tests
```bash
pnpm run load-test
```
Simula muitas requisições simultaneamente

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Verifica se PostgreSQL está rodando
docker ps | grep postgres

# Ou inicia Docker
docker-compose up -d
```

### "JWT token expired"
- Frontend deve chamar `/api/auth/refresh`
- Use o `refreshToken` salvo

### "Email already exists"
- Email já está cadastrado
- Use outro email ou delete o usuário anterior

### "Customer not found"
- ID do cliente está errado
- Ou cliente foi deletado (soft delete)

## 📚 Stack Técnico

| Tecnologia | Uso |
|-----------|-----|
| **NestJS** | Framework web |
| **TypeScript** | Tipagem estática |
| **TypeORM** | ORM para banco |
| **PostgreSQL** | Banco principal |
| **Redis** | Cache e sessions |
| **JWT** | Autenticação |
| **Swagger** | Documentação API |
| **Winston** | Logging |
| **Prometheus** | Métricas |
| **Jaeger** | Tracing distribuído |
| **Jest** | Testes unitários |
| **Cypress** | Testes E2E |

## 🎯 Próximas Melhorias

- [ ] Rate limiting por IP
- [ ] 2FA (autenticação de dois fatores)
- [ ] Auditoria de ações (quem fez o quê)
- [ ] Exportar dados em Excel
- [ ] Backup automático do banco
- [ ] API GraphQL (além de REST)
- [ ] Webhooks para eventos
- [ ] Integração com SSO (Google/GitHub)
