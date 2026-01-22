# 🚀 Dashboard Deployment Checklist

## Pre-Deployment Verification

### Code Quality

- [ ] Compilação sem erros: `npx nx build backend`
- [ ] Compilação sem erros: `npx nx build frontend`
- [ ] Sem warnings TypeScript
- [ ] Linting aprovado: `npx nx lint`
- [ ] Testes passando: `npx nx test`

### Security

- [ ] JwtAuthGuard em todos endpoints
- [ ] @CurrentUser() decorator em use
- [ ] Sem hardcoded secrets
- [ ] CORS configurado corretamente
- [ ] Environment variables definidas

### Backend Files

- [ ] ✅ dashboard.repository.port.ts
- [ ] ✅ dashboard.repository.ts
- [ ] ✅ dashboard-statistics.entity.ts
- [ ] ✅ dashboard-stats.response.dto.ts
- [ ] ✅ recent-user.response.dto.ts
- [ ] ✅ get-dashboard-stats.ucase.ts
- [ ] ✅ get-recent-users.ucase.ts
- [ ] ✅ dashboard.controller.ts
- [ ] ✅ dashboard.module.ts
- [ ] ✅ app.module.ts (DashboardModule imported)

### Frontend Files

- [ ] ✅ dashboard.types.ts
- [ ] ✅ dashboard.service.ts
- [ ] ✅ dashboard-page.tsx
- [ ] ✅ stat-card.tsx
- [ ] ✅ recent-users-table.tsx
- [ ] ✅ app.tsx (rota /dashboard adicionada)
- [ ] ✅ sidebar.tsx (botão Dashboard adicionado)

### Documentation

- [ ] ✅ DASHBOARD.md
- [ ] ✅ IMPLEMENTATION_SUMMARY.md
- [ ] ✅ DASHBOARD_TROUBLESHOOTING.md
- [ ] ✅ README.md atualizado

---

## Database Preparation

### Verify Schema

```sql
-- Verifique se tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Deve incluir:
-- - users (com deletedAt para soft delete)
-- - customers (com deletedAt para soft delete)
-- - audit_logs
```

### Create Test Data (Optional)

```sql
-- Se banco vazio, adicione dados de teste
INSERT INTO users (id, email, name, created_at) 
VALUES (gen_random_uuid(), 'admin@teddy.com', 'Admin User', NOW());

INSERT INTO customers (id, user_id, name, created_at)
VALUES (gen_random_uuid(), (SELECT id FROM users LIMIT 1), 'Test Customer', NOW());
```

---

## Environment Configuration

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRATION=3600
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_TTL=604800

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

### Frontend (.env or .env.local)

```bash
# API Endpoint
VITE_API_URL=http://localhost:3000

# Auth
VITE_JWT_STORAGE_KEY=accessToken
```

---

## Service Dependencies

### Docker Services Required

```bash
# Database
postgres:15-alpine
PORTS: 5432

# Observability
jaeger:latest (all-in-one)
PORTS: 4317, 4318, 14268, 16686

# Optional: Monitoring
prometheus:latest
grafana:latest
```

### Verification

```bash
docker-compose up -d
docker ps

# All services must show 'Up'
```

---

## API Endpoints Verification

### Authentication Required

```bash
# Get Stats
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/dashboard/stats
# Expected: 200 + JSON with stats

# Get Recent Users
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/dashboard/recent-users?limit=5"
# Expected: 200 + JSON array
```

### Expected Response Codes

| Endpoint | Code | Meaning |
|----------|------|---------|
| /api/dashboard/stats | 200 | Success |
| /api/dashboard/stats | 401 | Missing auth |
| /api/dashboard/stats | 403 | Invalid token |
| /api/dashboard/stats | 500 | Server error |

---

## Frontend Access Verification

### Routes

- [ ] /login - Login page (public)
- [ ] / - Home/Customers (protected)
- [ ] /dashboard - Dashboard (protected) ✅ NEW
- [ ] /customers - Customers (protected)
- [ ] /selected-customers - Selected Customers (protected)

### Authentication Flow

1. [ ] Usuário em /login → credenciais → token
2. [ ] Token em localStorage
3. [ ] useAuth() hook retorna isAuthenticated=true
4. [ ] Rotas protegidas acessíveis
5. [ ] /dashboard carrega dados

### UI Components

- [ ] StatCard renders
- [ ] RecentUsersTable renders
- [ ] Dashboard sidebar button visible
- [ ] Responsive layout funciona

---

## Observability Validation

### Jaeger Setup

```bash
# Jaeger UI accessible
curl http://localhost:16686/status

# Expected: 200

# Acesse UI
open http://localhost:16686
```

### Trace Verification

1. [ ] Acesse Jaeger UI
2. [ ] Service dropdown → select "teddy-backend"
3. [ ] Operation dropdown → select operation
4. [ ] Verifique spans:
   - get_dashboard_stats_process
   - get_recent_users_process
5. [ ] Clique em trace para visualizar hierarquia
6. [ ] Verifique atributos customizados

### Logs Check

```bash
# Backend logs
npm run start:backend 2>&1 | grep -E "(DashboardController|GetDashboardStatsUseCase)"

# Expected output:
# [DashboardController] GET /api/dashboard/stats - usuário: {id}
# [GetDashboardStatsUseCase] Estatísticas obtidas com sucesso
```

---

## Performance Checks

### Load Testing (Optional)

```bash
# Teste com 10 requisições
for i in {1..10}; do
  curl -H "Authorization: Bearer TOKEN" \
    http://localhost:3000/api/dashboard/stats
done

# Tempo esperado: < 200ms por requisição
```

### Database Query Performance

```bash
# Verifique query execution time
EXPLAIN ANALYZE
SELECT COUNT(*) FROM users WHERE deleted_at IS NULL;

-- Deve ser < 10ms
```

---

## Backup & Rollback Plan

### Before Deployment

```bash
# Backup do código
git tag v-dashboard-$(date +%Y%m%d)
git push origin v-dashboard-$(date +%Y%m%d)

# Backup do banco
pg_dump teddy_db > backup_$(date +%Y%m%d).sql
```

### Rollback if Needed

```bash
# Se houver erro, reverter:
git revert --no-edit HEAD

# E recompile:
npx nx build backend
npx nx build frontend
```

---

## Post-Deployment Verification

### Smoke Tests

```bash
# 1. Acesse frontend
open http://localhost:5173/dashboard

# 2. Verifique dados carregam
# Deve mostrar cards com números

# 3. Verifique Jaeger
open http://localhost:16686

# 4. Procure por traces
# teddy-backend → get_dashboard_stats_process
```

### User Acceptance Testing (UAT)

- [ ] Usuário pode fazer login
- [ ] Usuário vê Dashboard no menu
- [ ] Dashboard carrega estatísticas
- [ ] Dashboard mostra usuários recentes
- [ ] Dados estão corretos
- [ ] Sem erros no console
- [ ] Sem erros de rede

---

## Documentation Verification

- [ ] DASHBOARD.md - Lido e verificado
- [ ] IMPLEMENTATION_SUMMARY.md - Lido e verificado
- [ ] DASHBOARD_TROUBLESHOOTING.md - Lido e verificado
- [ ] API endpoints documentados
- [ ] Arquitetura explicada
- [ ] Troubleshooting completo

---

## Commit & Release

### Git Workflow

```bash
# Criar feature branch
git checkout -b feat/dashboard

# Adicionar arquivos
git add apps/backend/src/app/modules/dashboard/
git add apps/frontend/src/domain/dashboard/
git add apps/frontend/src/infra/services/
git add apps/frontend/src/presentation/pages/
git add apps/frontend/src/adapters/components/dashboard/
git add apps/backend/src/app/app.module.ts
git add apps/frontend/src/app/app.tsx
git add apps/frontend/src/adapters/components/common/sidebar.tsx
git add DASHBOARD.md
git add IMPLEMENTATION_SUMMARY.md
git add DASHBOARD_TROUBLESHOOTING.md
git add README.md

# Commit
git commit -m "feat(dashboard): implement complete dashboard module

- Backend: Hexagonal architecture with tracing
- Frontend: Responsive dashboard with real-time stats
- Security: JwtAuthGuard protection
- Observability: OpenTelemetry spans
- Documentation: Comprehensive guides"

# Push
git push origin feat/dashboard

# Create Pull Request
# Revisar e mergear em main
```

---

## Final Checklist

### Before Going Live

- [ ] Todos os testes passando
- [ ] Build sem warnings
- [ ] Documentação completa
- [ ] Environment variables configuradas
- [ ] Database migrado
- [ ] Docker services rodando
- [ ] Endpoints respondendo
- [ ] Frontend acessível
- [ ] Jaeger capturando traces
- [ ] Logs estruturados

### Go/No-Go Decision

```
✅ All items checked = GO
❌ Any item missing = NO-GO (fix first)
```

---

## Support & Escalation

### If Issues Arise

1. [ ] Check logs: Backend, Frontend, Docker
2. [ ] Verify database connectivity
3. [ ] Verify token validity
4. [ ] Check CORS configuration
5. [ ] Verify environment variables
6. [ ] Review DASHBOARD_TROUBLESHOOTING.md

### Contacts

- Backend Team: [contact]
- Frontend Team: [contact]
- DevOps Team: [contact]

---

## Sign-Off

**Deployed by:** ________________  
**Date:** ________________  
**Status:** [ ] Success / [ ] Failed  
**Notes:** ________________________  

---

**Last Updated**: 21 de janeiro de 2026
**Dashboard Version**: 1.0.0
**Status**: Production Ready ✅
