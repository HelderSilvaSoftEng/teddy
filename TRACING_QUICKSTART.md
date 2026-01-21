# 🚀 OpenTelemetry Quick Start Guide

## ⚡ Comece aqui em 5 minutos

### 1️⃣ Inicie Jaeger

```bash
docker-compose -f docker-compose.jaeger.yml up -d
```

✅ Jaeger rodando em `http://localhost:16686`

### 2️⃣ Instale dependências

```bash
# Na raiz do projeto
pnpm install
```

### 3️⃣ Configure .env

Certifique-se que tem no `.env`:

```env
JAEGER_ENDPOINT=http://localhost:14268/api/traces
```

### 4️⃣ Inicie backend

```bash
npm run dev -- --project=backend
```

✅ Backend rodando em `http://localhost:3000/api`

### 5️⃣ Teste um trace

```bash
# Fazer login (irá gerar trace)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teddy.com","password":"password"}'
```

### 6️⃣ Visualize no Jaeger

1. Abra `http://localhost:16686`
2. **Service**: `teddy-backend`
3. **Operation**: `login_process`
4. Clique em um trace para ver detalhes

---

## 🎯 O que você vai ver

```
login_process (200ms)
├─ find_user (50ms)
├─ generate_tokens (75ms)
├─ hash_jti (10ms)
├─ update_user (50ms)
└─ audit_login (15ms)
```

---

## 📖 Documentação Completa

Veja [TRACING.md](./TRACING.md) para guia completo com:
- ✅ Como funciona
- ✅ Como usar em seus use-cases
- ✅ Melhores práticas
- ✅ Troubleshooting

---

## 💡 Próximos Passos

1. Adicione spans em outros use-cases (CreateCustomer, UpdateCustomer, etc)
2. Veja padrão no `LoginUseCase` como exemplo
3. Copie/adapte para outros use-cases

---

## 🛠️ Comandos Úteis

```bash
# Ver logs do Jaeger
docker logs teddy-jaeger -f

# Parar Jaeger
docker-compose -f docker-compose.jaeger.yml down

# Limpar dados do Jaeger
docker-compose -f docker-compose.jaeger.yml down -v
```

---

Pronto! Agora você tem rastreamento completo de suas requisições! 🎉
