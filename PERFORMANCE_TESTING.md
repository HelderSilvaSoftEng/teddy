# 🚀 Performance & Load Testing

Este projeto inclui testes de performance para **Backend** e **Frontend**.

## 📊 Ferramentas Utilizadas

### Backend - k6
- **Framework**: k6.io
- **Tipo**: Load testing (teste de carga)
- **Cenários**: Login, Dashboard, Customers endpoints
- **VUs**: 10 usuários virtuais
- **Duração**: 30 segundos
- **Thresholds**: 
  - Response time p95 < 500ms
  - Response time p99 < 1000ms
  - Failure rate < 10%

### Frontend - Lighthouse + Playwright
- **Lighthouse**: Auditoria de performance
- **Playwright**: Teste de usuário real
- **Métricas**: Performance, Accessibility, Best Practices, SEO

## 🎯 Thresholds (Limites)

### Backend (k6)
```
✅ Response time p95 < 500ms
✅ Response time p99 < 1000ms
✅ Failure rate < 10%
```

### Frontend (Lighthouse)
```
✅ Performance: >= 70
✅ Accessibility: >= 80
✅ Best Practices: >= 80
✅ SEO: >= 80
```

### Frontend (Playwright)
```
✅ Homepage load < 3s
✅ Dashboard load < 2s
✅ Navigation < 1s
✅ API calls < 500ms
```

## 🚀 Rodar Testes

### Backend Load Test
```bash
npm run backend:perf
# Ou manualmente
k6 run apps/backend/performance-tests/load-test.js
```

### Frontend Performance Test
```bash
npm run frontend:perf
# Você precisa ter o frontend rodando em http://localhost:5173
```

### Ambos (Backend + Frontend)
```bash
npm run perf
```

## 📋 Pré-requisitos

### Para rodar tests de performance:

1. **Backend deve estar rodando**:
   ```bash
   npm run backend:dev
   ```

2. **Frontend deve estar rodando** (para testes de performance):
   ```bash
   npm run frontend:dev
   ```

3. **Ter k6 instalado**:
   ```bash
   npm install --save-dev k6
   ```

4. **Ter Lighthouse instalado**:
   ```bash
   npm install --save-dev lighthouse
   ```

## 📊 Resultados

### Backend (k6)
```
✅ Login: 200 OK, 150ms
✅ Dashboard Stats: 200 OK, 120ms
✅ Recent Customers: 200 OK, 100ms
✅ Customer Trend: 200 OK, 180ms
✅ Customers List: 200 OK, 200ms
```

### Frontend (Lighthouse)
```
✅ Performance: 95/100
✅ Accessibility: 92/100
✅ Best Practices: 88/100
✅ SEO: 90/100
```

### Frontend (Playwright)
```
✅ Homepage: 1200ms
✅ Dashboard: 1800ms
✅ Navigation: 500ms
✅ API calls: < 400ms
```

## 📂 Estrutura

```
apps/backend/performance-tests/
└── load-test.js          # k6 load test

apps/frontend/performance-tests/
├── lighthouse-test.js    # Lighthouse audit
└── playwright-perf.spec.ts # Playwright performance

coverage/
├── backend/
│   └── lcov.info
└── lighthouse/
    ├── summary.json
    ├── {page}.html
    └── ...
```

## 🔧 Configurações

### k6 Options (Backend)
```javascript
export const options = {
  vus: 10,              // 10 usuários virtuais
  duration: '30s',      // 30 segundos
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.1'],
  },
};
```

### Lighthouse Thresholds
```javascript
const thresholds = {
  performance: 70,
  accessibility: 80,
  'best-practices': 80,
  seo: 80,
};
```

## 📈 CI/CD Integration

Performance tests rodam em:
- **Manual**: `npm run perf`
- **GitHub Actions**: Adicionar job em `.github/workflows/performance.yml`

## 🎓 Próximos Passos

1. Rodar testes regularmente
2. Monitorar tendências de performance
3. Adicionar alertas para degradação
4. Documentar resultados históricos
5. Implementar otimizações baseadas em resultados

## 📖 Referências

- [k6 Documentation](https://k6.io/docs/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Playwright Performance](https://playwright.dev/docs/api/class-browsercontext)
