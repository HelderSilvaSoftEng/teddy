# 🚀 Quick Start - Comandos com PNPM

## ✨ Mudança Importante

O projeto agora usa **PNPM** em vez de NPM. Todos os scripts continuam igual, mas você precisa usar `pnpm` em vez de `npm`.

---

## 📋 Comandos Comuns

### Instalação & Setup
```bash
# Instalar todas as dependências (primeira vez)
pnpm install

# Ou se usar npm por acidente:
pnpm install --force  # Corrige e reinstala tudo
```

---

### Development

#### Frontend
```bash
# Dev server (localhost:4200)
pnpm run frontend:dev

# Build produção
pnpm run frontend:build

# Testes
pnpm run frontend:test

# Testes com coverage
pnpm run frontend:test:coverage
```

#### Backend
```bash
# Dev server (localhost:3000)
pnpm run backend:dev

# Build produção
pnpm run backend:build

# Testes unitários
pnpm run backend:test

# Testes E2E
pnpm run backend:e2e

# Testes com coverage
pnpm run backend:test:coverage
```

---

### Full Stack

#### Rodar ambos simultaneamente
```bash
# Frontend + Backend em dev mode
pnpm run all:serve
```

#### Build ambos
```bash
# Build frontend + backend
pnpm run build
```

#### Testar ambos
```bash
# Testes frontend + backend
pnpm run test

# Com coverage
pnpm run test:coverage
```

---

### Lint & Format

```bash
# Lint todo o código
pnpm run lint

# Formatar código (prettier)
pnpm run format
```

---

### Docker

```bash
# Subir containers (PostgreSQL + Jaeger)
pnpm run docker:up

# Derrubar containers
pnpm run docker:down

# Ver logs
pnpm run docker:logs
```

---

### Performance

```bash
# Backend performance tests
pnpm run backend:perf

# Frontend performance tests (Lighthouse)
pnpm run frontend:perf

# Ambos
pnpm run perf
```

---

## ❌ ERRADO vs ✅ CERTO

| ❌ ERRADO | ✅ CERTO |
|-----------|----------|
| `npm run dev` | `pnpm run dev` |
| `npm install` | `pnpm install` |
| `npm run test` | `pnpm run test` |
| `npm run build` | `pnpm run build` |
| `npm add lodash` | `pnpm add lodash` |
| `npm run lint` | `pnpm run lint` |

---

## 🆘 Problemas Comuns

### "Cannot find module" após instalar
```bash
# Solução
pnpm install --force
pnpm run build  # rebuild
```

### Build falha com permissão de arquivo
```bash
# Limpar cache do pnpm
pnpm store prune

# Reinstalar
pnpm install --no-frozen-lockfile
```

### node_modules está corrompido
```bash
# Limpar tudo
pnpm store prune
rm -rf node_modules
pnpm install
```

---

## 📚 Referência Rápida

| Tarefa | Comando |
|--------|---------|
| Instalar | `pnpm install` |
| Dev Frontend | `pnpm run frontend:dev` |
| Dev Backend | `pnpm run backend:dev` |
| Build | `pnpm run build` |
| Testes | `pnpm run test` |
| Lint | `pnpm run lint` |
| Format | `pnpm run format` |
| Docker up | `pnpm run docker:up` |
| Docker down | `pnpm run docker:down` |

---

## 🎯 Workflow Típico

```bash
# 1. Clonar e instalar
git clone <repo>
cd teddy-challenger
pnpm install

# 2. Subir infra
pnpm run docker:up

# 3. Dev (2 terminais)
pnpm run backend:dev  # Terminal 1
pnpm run frontend:dev # Terminal 2

# 4. Abrir browser
http://localhost:4200  # Frontend
http://localhost:3000  # Backend API

# 5. Testes em outro terminal
pnpm run test
```

---

**Leia também**: [PACKAGE_MANAGER_CONFIG.md](PACKAGE_MANAGER_CONFIG.md) para mais detalhes
