# Dashboard Implementation - Complete Guide

## 📋 Overview

O Dashboard foi implementado seguindo a arquitetura hexagonal com autenticação segura (JwtAuthGuard), observabilidade completa (OpenTelemetry tracing) e padrões estabelecidos no projeto.

---

## 🎯 Endpoints da API

### GET /api/dashboard/stats
**Obter estatísticas do dashboard**
- **Autenticação**: Required (JwtAuthGuard)
- **Descrição**: Retorna contagem total de usuários, clientes e logs de auditoria
- **Response**:
  ```json
  {
    "totalUsers": 5,
    "totalCustomers": 12,
    "totalAuditLogs": 142,
    "retrievedAt": "2026-01-21T10:30:00.000Z"
  }
  ```

### GET /api/dashboard/recent-users
**Obter usuários recentes**
- **Autenticação**: Required (JwtAuthGuard)
- **Query Params**: 
  - `limit`: Número máximo de usuários (padrão: 5, máximo: 20)
- **Descrição**: Retorna lista de usuários criados recentemente
- **Response**:
  ```json
  [
    {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "User Name",
      "createdAt": "2026-01-20T15:00:00.000Z"
    }
  ]
  ```

---

## 🔧 Arquitetura Backend

### Estrutura de Diretórios
```
apps/backend/src/app/modules/dashboard/
├── domain/
│   ├── entities/
│   │   └── dashboard-statistics.entity.ts  (interfaces)
│   └── ports/
│       └── dashboard.repository.port.ts    (IDashboardRepositoryPort)
├── infra/
│   └── repositories/
│       └── dashboard.repository.ts         (DashboardRepository)
├── adapters/
│   ├── controllers/
│   │   └── dashboard.controller.ts         (@Controller, @UseGuards)
│   └── dtos/
│       ├── dashboard-stats.response.dto.ts
│       └── recent-user.response.dto.ts
├── presentation/
│   └── use-cases/
│       ├── get-dashboard-stats.ucase.ts    (GetDashboardStatsUseCase)
│       └── get-recent-users.ucase.ts       (GetRecentUsersUseCase)
└── dashboard.module.ts
```

### Padrão de Implementação

#### Use-Cases com Tracing
```typescript
// GetDashboardStatsUseCase.execute()
const span = this.tracer.startSpan('get_dashboard_stats_process', {
  attributes: {
    'user.id': user.id,
    'operation': 'GET_STATS',
  },
});

try {
  // 1️⃣ db_query_users
  // 2️⃣ db_query_customers
  // 3️⃣ db_query_audits
  span.setAttributes({ 'status': 200, 'total.users': n, ... });
} catch (error) {
  span.recordException(error);
  throw error;
} finally {
  span.end();
}
```

#### Repository Pattern
```typescript
@Injectable()
export class DashboardRepository implements IDashboardRepositoryPort {
  async getTotalUsers(): Promise<number>
  async getTotalCustomers(): Promise<number>
  async getTotalAuditLogs(): Promise<number>
  async getRecentUsers(limit: number): Promise<RecentUser[]>
}
```

#### Controller Seguro
```typescript
@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  @Get('stats')
  async getStats(@CurrentUser() user: ICurrentUser)
  
  @Get('recent-users')
  async getRecentUsers(@CurrentUser() user, @Query('limit') limit?)
}
```

---

## 🎨 Arquitetura Frontend

### Estrutura
```
apps/frontend/src/
├── domain/
│   └── dashboard/
│       └── dashboard.types.ts             (interfaces)
├── infra/
│   └── services/
│       └── dashboard.service.ts           (API calls)
├── presentation/
│   └── pages/
│       ├── dashboard-page.tsx             (main page)
│       └── dashboard-page.module.css
└── adapters/
    └── components/
        └── dashboard/
            ├── stat-card.tsx              (component)
            ├── stat-card.module.css
            ├── recent-users-table.tsx     (component)
            └── recent-users-table.module.css
```

### Componentes

#### StatCard
- Props: `title`, `value`, `icon`, `color`
- Cores: 'blue' | 'green' | 'purple' | 'orange'
- Exemplo: `<StatCard title="Total de Usuários" value={5} icon="👥" color="blue" />`

#### RecentUsersTable
- Props: `users: RecentUser[]`, `isLoading?: boolean`
- Formatação de data em pt-BR
- Estados: loading, empty, table

#### DashboardPage
- Autenticação obrigatória (useAuth hook)
- Loading states para stats e users
- Error handling com exibição visual
- Grid responsivo para cards
- Timestamp de atualização

---

## 🔐 Segurança

### Proteção de Endpoints
- ✅ @UseGuards(JwtAuthGuard) em todos endpoints
- ✅ @CurrentUser() decorator para injetar usuário autenticado
- ✅ Rota protegida no frontend com isAuthenticated check
- ✅ Token enviado em headers (Authorization: Bearer token)

### Frontend Authentication
```typescript
// Verificação automática
if (!isAuthenticated) {
  return <div>Você precisa estar autenticado...</div>;
}

// Rota protegida em app.tsx
{isAuthenticated ? (
  <Route path="/dashboard" element={<DashboardPage />} />
) : null}
```

---

## 📊 Observabilidade

### OpenTelemetry Spans

#### DashboardPage Load
```
get_dashboard_stats_process [user.id, operation: GET_STATS]
├── db_query_users
├── db_query_customers
└── db_query_audits

get_recent_users_process [user.id, operation: GET_RECENT_USERS, limit]
└── db_query_recent_users
```

### Logging
```typescript
this.logger.log(`[DashboardController] GET /api/dashboard/stats - usuário: ${user.id}`);
this.logger.error(`[GetDashboardStatsUseCase] Erro ao obter estatísticas: ${error.message}`);
```

### Rastreamento Jaeger
- Endpoint: http://localhost:16686
- Service: teddy-backend
- Filtro por operação: get_dashboard_stats_process, get_recent_users_process

---

## 🧪 Testando o Dashboard

### 1. Iniciar aplicação
```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend
npm run start:frontend

# Terminal 3 - Serviços (Docker)
docker-compose up -d
```

### 2. Autenticar
- Acesse http://localhost:5173/login
- Faça login com suas credenciais
- Token será armazenado em localStorage

### 3. Acessar Dashboard
- Navegue para http://localhost:5173/dashboard
- Ou clique no botão "Dashboard" na sidebar
- Dashboard carregará estatísticas em tempo real

### 4. Verificar Observabilidade
- Jaeger UI: http://localhost:16686
- Procure por "teddy-backend" service
- Filtro por spans: get_dashboard_stats_process, get_recent_users_process

### 5. Testar API diretamente
```bash
# Stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/dashboard/stats

# Recent Users (limit=3)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/dashboard/recent-users?limit=3
```

---

## ✅ Checklist de Implementação

- ✅ Backend hexagonal architecture completa
- ✅ DTOs e entities do domain
- ✅ Repository pattern com TypeORM
- ✅ Use-cases com tracing (getTracer)
- ✅ Logger pattern [CONTEXT]
- ✅ Controller com @UseGuards(JwtAuthGuard)
- ✅ Module registration em AppModule
- ✅ Frontend domain types
- ✅ Dashboard service com fetch + Authorization
- ✅ Components reusáveis (StatCard, RecentUsersTable)
- ✅ DashboardPage com autenticação
- ✅ Rota integrada em app.tsx
- ✅ Botão Dashboard na sidebar
- ✅ Compilação sem erros (backend + frontend)
- ✅ OpenTelemetry tracing
- ✅ Error handling e loading states

---

## 🚀 Próximos Passos (Opcionais)

1. **Cache do Dashboard**: Implementar cache em Redis com TTL
2. **Gráficos**: Adicionar biblioteca de gráficos (Chart.js, Recharts)
3. **Filtros Temporais**: Estatísticas por período
4. **Export de Dados**: Exportar dashboard para PDF/Excel
5. **Real-time Updates**: WebSocket para atualizações em tempo real

---

## 📝 Commits Recomendados

```bash
git add apps/backend/src/app/modules/dashboard/
git commit -m "feat(dashboard): implement backend hexagonal architecture with tracing"

git add apps/frontend/src/domain/dashboard/
git add apps/frontend/src/infra/services/
git add apps/frontend/src/presentation/pages/dashboard-page.*
git add apps/frontend/src/adapters/components/dashboard/
git commit -m "feat(dashboard): implement frontend dashboard with components"

git add apps/frontend/src/app/app.tsx
git add apps/frontend/src/adapters/components/common/sidebar.tsx
git commit -m "feat(dashboard): integrate dashboard routing and sidebar navigation"

git add apps/backend/src/app/app.module.ts
git commit -m "feat(dashboard): register DashboardModule in AppModule"
```

---

Implementação completa e pronta para uso! 🎉
