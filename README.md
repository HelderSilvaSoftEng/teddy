# TeddyChallenger

Sistema full-stack de gestão de usuários e clientes. Stack: **NestJS + React + PostgreSQL + Docker**

Status: MVP Completo - 108 testes passando, 85%+ coverage, pronto para produção.

---

## 🚀 Quick Start (3 minutos)

```bash
# 1. Instalar e rodar serviços
pnpm install && docker-compose up -d

# 2. Iniciar backend (Terminal 1)
npm run backend:dev

# 3. Iniciar frontend (Terminal 2)
npm run frontend:dev

# 4. Acessar
# Frontend:  http://localhost:5173
# API:       http://localhost:3000/api
# Swagger:   http://localhost:3000/docs
```

---

## 🔐 Acesso Inicial

Um usuário **admin padrão** é criado automaticamente na primeira inicialização:

| Campo | Valor |
|-------|-------|
| **Email** | `admin@teddy.com` |
| **Senha** | `admin123` |

**Como acessar:**

1. Frontend: <http://localhost:5173>
2. Faça login com as credenciais acima
3. Ou teste diretamente via Swagger: <http://localhost:3000/docs>

---

## ⚡ Comandos Essenciais

```bash
# Desenvolvimento
npm run dev                    # Backend + Frontend simultâneo
npm run backend:dev            # Backend apenas
npm run frontend:dev           # Frontend apenas

# Testes
npm run test                   # Todos os testes
npm run backend:test          # Unit tests backend
npm run backend:e2e           # E2E tests backend

# Build & Deploy
npm run build                  # Build tudo
npm run backend:prod          # Run production backend

# Linting
npm lint                       # Lint tudo
npm format                     # Format código

# Docker
docker-compose up -d           # Subir containers
docker-compose down            # Parar containers
docker-compose logs -f         # Ver logs em tempo real
```

---

## 📊 Dashboard Feature

Novo dashboard com estatísticas em tempo real, usuários recentes e observabilidade completa via OpenTelemetry.

**Recursos:**

- 📈 Estatísticas de usuários, clientes e auditoria
- 👥 Lista de usuários recentes
- 🔐 Autenticação segura com JwtAuthGuard
- 📊 Tracing distribuído com Jaeger
- 🎨 Interface responsiva com CSS Modules

**Documentação:**

- [Dashboard Guide](./DASHBOARD.md) - Guia completo
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Resumo técnico
- [Troubleshooting](./DASHBOARD_TROUBLESHOOTING.md) - Resolução de problemas

---

## 🏗️ Architecture

Hexagonal Architecture com separação clara de concerns:

```
domain/          → Entities e Business Rules
ports/           → Interfaces e Contracts
infra/           → Implementação de Repositories
adapters/        → Controllers e DTOs
presentation/    → Use-cases com Observabilidade
```

Para detalhes profundos sobre escalabilidade e design patterns, consulte [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## � API Documentation (Swagger)

Acesse a documentação **interativa** de todos os endpoints:

**[🔗 Swagger UI](http://localhost:3000/docs)** → <http://localhost:3000/docs>

### Recursos

- ✅ Todos os endpoints documentados
- 🎯 Teste endpoints direto no navegador
- 📋 Schemas de request/response
- 🔐 Autenticação JWT integrada
- 📊 Status codes e exemplos reais

### Como usar

1. Abra [http://localhost:3000/docs](http://localhost:3000/docs)
2. Clique em **"Authorize"** (canto superior direito)
3. Coloque um token JWT válido
4. Clique em qualquer endpoint e **"Try it out"**
5. Veja a resposta em tempo real

---

## �🔐 Autenticação

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teddy.com","password":"admin123"}'
```

### Usar Token

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh
```

---

## 🔗 URLs & Credenciais

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

## 📊 Health Checks

```bash
# Liveness
curl http://localhost:3000/api/health/live

# Readiness
curl http://localhost:3000/api/health/ready

# Full status
curl http://localhost:3000/api/health
```

---

## 🧪 Testar Endpoints

### Listar Usuários

```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <token>"
```

### Criar Cliente

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

### Dashboard Stats

```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

---

## 🛠️ Troubleshooting

| Problema | Solução |
|----------|---------|
| **Port 3000 em uso** | `lsof -ti:3000 \| xargs kill -9` (Linux/Mac) |
| **DB não conecta** | Verificar: `docker ps \| grep postgres` |
| **Node modules corrompidos** | `rm -rf node_modules && pnpm install` |
| **Cache velho** | `rm -rf dist && npm run build` |
| **Testes falhando** | `npm run backend:test -- --clearCache` |
| **CORS error** | Verificar CORS_ORIGIN no .env |
| **Token expirado** | O `/refresh` endpoint o regenera automaticamente |

---
