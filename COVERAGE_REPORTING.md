# 📊 Coverage Reporting

Este projeto utiliza:
- **Frontend**: Vitest com v8 coverage provider
- **Backend**: Jest com @swc/jest

## 🎯 Objetivos de Cobertura

| Métrica | Objetivo |
|---------|----------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

## 📈 Gerar Relatórios

### Frontend

```bash
# Gerar coverage report do frontend
npm run frontend:test:coverage

# Abrir relatório HTML
open apps/frontend/coverage/index.html  # macOS
start apps/frontend/coverage/index.html # Windows
xdg-open apps/frontend/coverage/index.html # Linux
```

### Backend

```bash
# Gerar coverage report do backend
npm run backend:test:coverage

# Abrir relatório HTML
open coverage/apps/backend/index.html  # macOS
start coverage/apps/backend/index.html # Windows
xdg-open coverage/apps/backend/index.html # Linux
```

### Todos os testes com coverage

```bash
npm run test:coverage
```

## 📁 Estrutura de Cobertura

```
apps/frontend/coverage/
├── index.html           # 📊 Relatório visual interativo
├── lcov.info           # 📋 Formato LCOV (para Codecov)
├── coverage-final.json # 📝 Dados brutos em JSON
└── lcov-report/        # 📂 Relatório detalhado por arquivo

coverage/apps/backend/
├── index.html          # 📊 Relatório visual
├── lcov.info          # 📋 Formato LCOV
└── lcov-report/       # 📂 Relatório detalhado
```

## 🔗 Integração com Codecov

Os workflows do GitHub Actions automaticamente enviam cobertura para [Codecov](https://codecov.io):

**Frontend:**
```yaml
- name: Upload frontend coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./apps/frontend/coverage/lcov.info
    flags: frontend
```

**Backend:**
```yaml
- name: Upload backend coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/apps/backend/lcov.info
    flags: backend
```

## 📊 Status de Cobertura

### Frontend

| Camada | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| **Domain** | 100% | 100% | 100% | 100% ✅ |
| **Application** | 100% | 100% | 100% | 100% ✅ |
| **Infra** | 81.81% | 76.92% | 100% | 81.81% ✅ |
| **Presentation** | - | - | - | - | 🚧 |
| **Total** | **85.71%** | **78.57%** | **100%** | **85.71%** ✅ |

### Backend

| Módulo | Cobertura | Status |
|--------|-----------|--------|
| Auth | - | 🚧 |
| Users | - | 🚧 |
| Customers | - | 🚧 |
| Dashboard | - | 🚧 |
| Common | - | 🚧 |

## 🚀 CI/CD com GitHub Actions

### Workflows

1. **frontend-coverage.yml**
   - ✅ Roda testes com coverage
   - ✅ Comenta no PR com relatório
   - ✅ Envia para Codecov

2. **backend-tests.yml**
   - ✅ Roda testes do backend
   - ✅ Roda E2E tests
   - ✅ Valida build

3. **ci-cd.yml** (Pipeline Completo)
   - ✅ Lint & format check
   - ✅ Build frontend + backend
   - ✅ Roda todos os testes
   - ✅ Upload de coverage (frontend + backend)
   - ✅ Notifica resultado

## 📋 Checklist de Coverage

### Frontend
- [x] Vitest configurado com v8 provider
- [x] Thresholds definidos
- [x] Relatório HTML gerado
- [x] LCOV format para CI/CD
- [x] Script `frontend:test:coverage` criado
- [x] 85.71% statements coverage

### Backend
- [x] Jest com @swc/jest configurado
- [x] collectCoverageFrom definido
- [x] Relatório HTML gerado
- [x] LCOV format para CI/CD
- [x] Script `backend:test:coverage` criado
- [ ] Aumentar cobertura de testes

## 🎓 Próximos Passos

1. **Backend**: Adicionar testes unitários para módulos
2. **Frontend**: Melhorar cobertura de componentes
3. Configurar badge de coverage no README
4. Integrar com SonarQube/SonarCloud
5. Adicionar alertas para quedas de cobertura

## 📖 Referências

- [Vitest Coverage](https://vitest.dev/guide/coverage)
- [Jest Coverage](https://jestjs.io/docs/coverage)
- [Codecov Documentation](https://docs.codecov.com)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions)
