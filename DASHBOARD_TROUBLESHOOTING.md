# 🔧 Dashboard Troubleshooting Guide

## Problemas Comuns e Soluções

### 1. "401 Unauthorized" ao acessar dashboard

**Sintoma**: Dashboard não carrega, erro 401 na API

**Solução**:
```bash
# Verifique se está autenticado
localStorage.getItem('accessToken')  # DevTools Console

# Se estiver vazio, faça login novamente em http://localhost:5173/login

# Verifique se o token é válido
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/dashboard/stats
```

---

### 2. "Could not resolve" erro de import

**Sintoma**: Erro TypeScript no build

```
Could not resolve "../../application/contexts"
```

**Solução**:
```bash
# Verifique o caminho correto (deve ser ../contexts/auth.context)
# Caminho correto: src/presentation/contexts/auth.context.tsx

# Limpe o cache
npm run nx reset cache

# Rebuilde
npx nx build frontend
```

---

### 3. CORS Error ao chamar API

**Sintoma**: 
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solução**:
```typescript
// Backend deve ter CORS habilitado
// Verifique main.ts

app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});

// Frontend deve usar Bearer token correto
fetch('http://localhost:3000/api/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  },
});
```

---

### 4. Jaeger não recebe traces

**Sintoma**: 
- Jaeger UI vazio
- Nenhuma trace aparece

**Solução**:
```bash
# 1. Verifique se Jaeger está rodando
docker ps | grep jaeger

# 2. Verifique endpoint OTLP
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# 3. Verifique logs do backend
npm run start:backend

# 4. Faça uma requisição
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/dashboard/stats

# 5. Acesse http://localhost:16686 e procure por "teddy-backend" service
```

---

### 5. Database connection error

**Sintoma**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solução**:
```bash
# Verifique se PostgreSQL está rodando
docker ps | grep postgres

# Inicie docker-compose
docker-compose up -d postgres

# Verifique variáveis de ambiente
cat .env | grep DATABASE_URL

# Deve estar como:
# DATABASE_URL=postgresql://user:password@localhost:5432/teddy_db
```

---

### 6. Dashboard page shows "Você precisa estar autenticado"

**Sintoma**:
- Ao acessar /dashboard, mensagem de não autenticado
- Mas está logado na aplicação

**Solução**:
```typescript
// Verifique se useAuth() está funcionando
// Em DevTools Console:
console.log(localStorage.getItem('accessToken'))  // Deve ter token
console.log(localStorage.getItem('refreshToken')) // Deve ter token

// Verifique se AuthProvider está wrapping App
// Em main.tsx:
<AuthProvider>
  <App />
</AuthProvider>

// Se ainda não funcionar, limpe localStorage e faça login novamente
localStorage.clear()
// Depois recarregue: http://localhost:5173/login
```

---

### 7. Stats showing 0 values

**Sintoma**:
- Dashboard carrega mas mostra "0" para todos valores

**Solução**:
```bash
# Verifique se há dados no banco
psql -U your_user -d teddy_db

# Execute queries:
SELECT COUNT(*) FROM users WHERE deleted_at IS NULL;
SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL;
SELECT COUNT(*) FROM audit_logs;

# Se estiverem vazios, crie dados de teste:
INSERT INTO users (id, email, name) VALUES (gen_random_uuid(), 'test@test.com', 'Test');

# Ou verifique se a soft delete está sendo usada corretamente
# (deletedAt field deve ser NULL para ativa)
```

---

### 8. Sidebar button not appearing

**Sintoma**:
- Botão "Dashboard" não aparece na sidebar

**Solução**:
```bash
# Verifique se sidebar.tsx foi modificado corretamente
grep -n "dashboard" apps/frontend/src/adapters/components/common/sidebar.tsx

# Deve conter:
# - import da rota /dashboard
# - botão com onClick(() => handleNavigation('/dashboard'))
# - icon: material-symbols-outlined dashboard

# Reconstrua
npx nx build frontend --skip-nx-cache

# Limpe cache do navegador (Ctrl+Shift+R)
```

---

### 9. "Type 'null' is not assignable to type"

**Sintoma**:
```
TypeScript error: Type 'null' is not assignable to type 'DashboardStatistics'
```

**Solução**:
```typescript
// Use tipos opcionais
const [stats, setStats] = useState<DashboardStatistics | null>(null);

// Ou use value ?? fallback
<StatCard value={stats?.totalUsers ?? 0} />

// Verifique inicialização de state
const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
// Não deve ser null, sempre array vazio inicialmente
```

---

### 10. API returns 403 Forbidden

**Sintoma**:
```
403 Forbidden - Access Denied
```

**Solução**:
```typescript
// Verifique se JwtAuthGuard está funcionando
// O erro pode ser:
// 1. Token expirado - faça login novamente
// 2. Token inválido - limpe localStorage e login
// 3. JWT_SECRET não bate - verifique .env

// Teste com curl:
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login ...)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/dashboard/stats

// Se retornar 403, o token é inválido
```

---

### 11. Build fails with "Module not found"

**Sintoma**:
```
Error: Cannot find module '@app/telemetry'
```

**Solução**:
```bash
# Verifique path aliases em tsconfig.base.json
# Ou use caminho relativo:

// ❌ Errado
import { getTracer } from '@app/telemetry';

// ✅ Correto
import { getTracer } from '../../telemetry';

# Limpe cache
rm -rf dist node_modules/.cache

# Reinstale dependências
npm install

# Rebuilde
npx nx build backend
```

---

### 12. Frontend not communicating with backend

**Sintoma**:
- Dashboard carrega mas sem dados
- Network tab mostra erro

**Solução**:
```bash
# Verifique se backend está rodando
curl http://localhost:3000/api/dashboard/stats
# Deve retornar 401 (sem auth é esperado)

# Verifique URL no serviço
cat apps/frontend/src/infra/services/dashboard.service.ts
# Deve ser: http://localhost:3000/api/dashboard

# Verifique CORS no backend
# main.ts deve ter app.enableCors()

# Reinicie ambos:
# Terminal 1: npm run start:backend
# Terminal 2: npm run start:frontend
```

---

### 13. Observability not working

**Sintoma**:
- Jaeger recebendo dados?
- Spans aparecem no UI?

**Solução**:
```bash
# 1. Verifique se tracing.ts está sendo inicializado
grep -n "initializeTracing" apps/backend/src/main.ts

# Deve estar como primeira linha:
# import { initializeTracing } from './app/telemetry/tracing';
# initializeTracing();

# 2. Verifique OTEL_EXPORTER_OTLP_ENDPOINT
docker logs $(docker ps | grep jaeger | awk '{print $1}') | grep OTLP

# 3. Verifique logs do backend
# Deve haver logs de telemetria inicializada

# 4. Faça uma requisição e espie no Jaeger
http://localhost:16686
# Service: teddy-backend
# Operation: get_dashboard_stats_process
```

---

## 🆘 Ainda com problema?

1. **Verifique logs**:
   ```bash
   # Backend
   npm run start:backend 2>&1 | tail -50
   
   # Docker
   docker-compose logs -f
   
   # Jaeger
   docker logs $(docker ps | grep jaeger | awk '{print $1}')
   ```

2. **Verifique arquivos críticos**:
   ```bash
   ls -la apps/backend/src/app/modules/dashboard/
   ls -la apps/frontend/src/presentation/pages/
   ```

3. **Reconstrua tudo**:
   ```bash
   npm run clean
   npm install
   npx nx build backend
   npx nx build frontend
   ```

4. **Reinicie Docker**:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

---

## 📞 Debugging Avançado

### DevTools Console
```javascript
// Verifique autenticação
console.log(localStorage.getItem('accessToken'));
console.log(localStorage.getItem('user'));

// Teste API manualmente
fetch('http://localhost:3000/api/dashboard/stats', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
}).then(r => r.json()).then(console.log);
```

### Network Tab
1. Abra DevTools (F12)
2. Aba "Network"
3. Recarregue dashboard
4. Verifique requisições:
   - Status 200 = ✅ OK
   - Status 401 = ❌ Não autenticado
   - Status 403 = ❌ Sem permissão
   - Status 500 = ❌ Erro do servidor

### Backend Logs
```
[DashboardController] GET /api/dashboard/stats - usuário: {id}
[GetDashboardStatsUseCase] Estatísticas obtidas com sucesso
```

---

**Last Updated**: 21 de janeiro de 2026
**Status**: Produção Ready ✅
