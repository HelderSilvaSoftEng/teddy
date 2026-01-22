# 🎯 Quick Reference Guide

Um guia rápido para desenvolvedores que querem começar rapidamente.

---

## 📝 Sumário Executivo

| Aspecto | Detalhe |
|---------|---------|
| **Projeto** | Sistema full-stack de gestão de usuários e clientes |
| **Stack** | NestJS + React + PostgreSQL + Docker |
| **Arquitetura** | Hexagonal (Domain-Driven) |
| **Testes** | 108 testes passando (85%+ coverage) |
| **Autenticação** | JWT com refresh tokens |
| **Observabilidade** | OpenTelemetry, Jaeger, Prometheus, Grafana |
| **Status** | MVP Completo - Pronto para produção |

---

## ⚡ Comando Essenciais

```bash
# Setup
pnpm install
docker-compose up -d

# Desenvolvimento
npm run dev                    # Backend + Frontend simultâneo
npm run backend:dev            # Backend apenas
npm run frontend:dev           # Frontend apenas

# Testes
npm run test                   # Todos os testes
npm run backend:test          # Unit tests backend
npm run backend:e2e           # E2E tests backend
npm run frontend:test         # Tests frontend

# Build & Production
npm run build                  # Build tudo
npm run backend:prod          # Run production backend

# Linting & Format
npm lint                       # Lint tudo
npm format                     # Format código

# Docker
npm run docker:up             # Subir containers
npm run docker:down           # Parar containers
npm run docker:logs           # Ver logs
```

---

## 🔗 URLs Principais

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Frontend** | <http://localhost:5173> | <admin@teddy.com> / admin123 |
| **API** | <http://localhost:3000/api> | - |
| **Swagger** | <http://localhost:3000/docs> | - |
| **Grafana** | <http://localhost:3001> | admin / admin |
| **Prometheus** | <http://localhost:9090> | - |
| **Jaeger** | <http://localhost:16686> | - |
| **PostgreSQL** | localhost:5432 | postgres / postgres |

---

## 📚 Estrutura de Arquivos

```
teddy/
├── README.md                   # 👈 You are here
├── ARCHITECTURE.md             # Escalabilidade & design
├── SYSTEM_DESIGN.md            # Diagrama de sistema
├── AUTH_API_GUIDE.md           # Exemplos API
├── PROGRESS_REPORT.md          # Status completo
│
├── apps/
│   ├── backend/                # NestJS API
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── modules/    # Feature modules
│   │   │   │   │   ├── authentication/
│   │   │   │   │   ├── users/
│   │   │   │   │   ├── customers/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   └── health/
│   │   │   │   └── app.module.ts
│   │   │   ├── common/         # Shared code
│   │   │   ├── main.ts         # Entry point
│   │   │   └── types/          # TypeScript definitions
│   │   └── __tests__/          # Unit tests
│   │
│   ├── frontend/               # React + Vite
│   │   ├── src/
│   │   │   ├── pages/          # Page components
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── services/       # API clients
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── App.tsx
│   │   │   └── main.tsx        # Entry point
│   │   └── vitest.config.ts
│   │
│   ├── backend-e2e/            # E2E tests
│   └── frontend-e2e/           # Playwright tests
│
├── .env                        # Variables (local)
├── .env.example                # Template
├── docker-compose.yml          # Services
├── package.json                # Root dependencies
├── nx.json                      # Nx config
└── pnpm-workspace.yaml         # Workspace config
```

---

## 🔐 Autenticação Cheat Sheet

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teddy.com","password":"admin123"}' \
  -c cookies.txt
```

### Usar Token

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>" \
  -b cookies.txt
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt
```

---

## 🛠️ Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| **Port 3000 em uso** | `lsof -ti:3000 \| xargs kill -9` |
| **Port 5173 em uso** | `lsof -ti:5173 \| xargs kill -9` |
| **DB não conecta** | Verificar: `docker ps \| grep postgres` |
| **Node modules corrompidos** | `rm -rf node_modules && pnpm install` |
| **Cache velho** | `rm -rf dist && npm run build` |
| **Testes falhando** | `npm run backend:test -- --clearCache` |
| **CORS error** | Verificar CORS_ORIGIN no .env |
| **Token expirado** | O `/refresh` endpoint o regenera automaticamente |

---

## 📊 Metrics & Monitoring

### Health Checks

```bash
# Liveness (pod is running)
curl http://localhost:3000/api/health/live

# Readiness (pod can accept traffic)
curl http://localhost:3000/api/health/ready

# Full status
curl http://localhost:3000/api/health
```

### Database Queries

Enable em .env:

```env
DB_LOGGING=true
```

---

## 🧪 Teste um Endpoint

### 1. Listar Usuários

```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <token>"
```

### 2. Criar Cliente

```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "salary": 5000,
    "company": "Tech Corp"
  }'
```

### 3. Dashboard Stats

```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

---

## 🚀 Deploy Checklist

- [ ] Testes passando: `npm test`
- [ ] Build sem erros: `npm run build`
- [ ] Linting aprovado: `npm lint`
- [ ] .env em produção atualizado
- [ ] JWT_SECRET alterado
- [ ] HTTPS ativado
- [ ] CORS_ORIGIN correto
- [ ] Database backup feito
- [ ] Monitoring ativado
- [ ] Rate limiting configurado
- [ ] Logs centralizados
- [ ] CDN para assets estáticos

---

## 🎓 Entendendo a Arquitetura

### Por que Hexagonal?

```
Sem Hexagonal (monolith):
AuthController.login()
  → UserService.validate()
    → UserRepository.find()
      → Database direct access
        → Hard to test, tight coupling

Com Hexagonal (ports & adapters):
AuthController.login()
  → LoginUseCase.execute()
    → IUserRepository.findByEmail()
      → UserRepository (implementation)
        → Database
        
Benefício: Trocar UserRepository por mock/outra BD = 1 linha
```

### Camadas

```
Domain       → Regras de negócio puras
Infra        → Como implementar (BD, HTTP, etc)
Adapters     → Como expor (Controllers, DTOs)
Presentation → Orquestração (Use-cases)
```

---

## 🔄 Fluxo de Uma Feature

### Exemplo: Criar novo endpoint GET /api/users/search

1. **Domain** - Criar use-case se necessário

   ```typescript
   // src/app/modules/users/presentation/use-cases/search-users.ucase.ts
   export class SearchUsersUseCase {
     execute(query: string) { ... }
   }
   ```

2. **Adapter** - Criar DTO

   ```typescript
   // src/app/modules/users/adapters/dtos/search-users.response.dto.ts
   export class UserSearchResultDTO {
     id: string;
     email: string;
   }
   ```

3. **Controller** - Expor endpoint

   ```typescript
   // src/app/modules/users/adapters/controllers/users.controller.ts
   @Get('search')
   async search(@Query('q') query: string) {
     return this.searchUsersUseCase.execute(query);
   }
   ```

4. **Test** - Escrever testes

   ```typescript
   // src/app/modules/users/adapters/controllers/__tests__/search.spec.ts
   it('should find users by email', () => { ... });
   ```

---

## 💾 Environment Variables

### Local (.env)

```env
# Essencial
DB_HOST=localhost
DB_PORT=5432
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=dev_secret
JWT_EXPIRATION=3600

# Opcional (observabilidade)
OTEL_ENABLED=false
LOG_LEVEL=debug
```

### Production (.env.production)

```env
# Seguro
DB_HOST=prod-db.aws.com
DB_PORT=5432
JWT_SECRET=<long_random_string>
NODE_ENV=production

# URLs
FRONTEND_URL=https://app.example.com
API_URL=https://api.example.com

# Observabilidade ativada
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://jaeger.example.com
LOG_LEVEL=info
```

---

## 📞 Documentação Completa

- [README.md](./README.md) - Visão geral
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Design & escalabilidade  
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) - Diagramas & flows
- [AUTH_API_GUIDE.md](./AUTH_API_GUIDE.md) - Exemplos de autenticação
- [AUTHENTICATION_IMPLEMENTATION.md](./AUTHENTICATION_IMPLEMENTATION.md) - Detalhes JWT
- [DASHBOARD.md](./DASHBOARD.md) - Feature dashboard
- [PROGRESS_REPORT.md](./PROGRESS_REPORT.md) - Status detalhado

---

## 🤝 Contribuindo

1. Criar branch: `git checkout -b feature/nova-coisa`
2. Implementar com testes
3. Lint & format: `npm format && npm lint`
4. Testes passam: `npm test`
5. Push & PR

---

## 📄 Licença

MIT - Sinta-se livre para usar, modificar, distribuir

---

## 🆘 Precisa de Ajuda?

- 📖 Leia [ARCHITECTURE.md](./ARCHITECTURE.md) para design decisions
- 🔍 Veja [PROGRESS_REPORT.md](./PROGRESS_REPORT.md) para features
- 🎓 Estude os testes em `__tests__/` folders
- 🐛 Use `DB_LOGGING=true` para debug de queries
- 📊 Acesse Swagger: <http://localhost:3000/docs>
