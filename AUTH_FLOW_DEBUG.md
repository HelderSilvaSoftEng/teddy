# 🔐 Fluxo Completo de Autenticação - Checklist de Debugging

## ✅ Correções Implementadas

### 1. **`.env` - CRÍTICO**
```diff
- JWT_EXPIRES_IN=24h  ❌ INVÁLIDO (string em formato Go)
+ JWT_EXPIRATION=3600  ✅ CORRETO (número em segundos)
+ REFRESH_TOKEN_SECRET=seu_refresh_secret_super_seguro_aqui  ✅ NOVO
+ REFRESH_TOKEN_TTL=604800  ✅ NOVO (7 dias)
```
**Problema**: O código esperava `JWT_EXPIRATION` como **número**, mas o `.env` tinha `JWT_EXPIRES_IN` como **string**.

---

## 📋 Fluxo de Autenticação (Passo a Passo)

### **1️⃣ LOGIN - `POST /api/auth/login`**

```bash
curl --location 'http://localhost:3000/api/auth/login' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Expected Response (200 OK):**
```json
{
  "user": "João Silva",
  "email": "joao@example.com",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Cookies (httpOnly):**
- `Authentication`: accessToken
- `RefreshToken`: refreshToken

**What's Happening:**
1. LocalClientAuthGuard valida email/senha do BD
2. LoginUseCase gera 2 tokens:
   - **accessToken**: `JWT_EXPIRATION` (3600 segundos = 1 hora)
   - **refreshToken**: `REFRESH_TOKEN_TTL` (604800 segundos = 7 dias)
3. Ambos os tokens são setados como cookies httpOnly
4. accessToken também retorna no JSON body

---

### **2️⃣ ACESSAR CLIENTE - `GET /api/v1/clients`**

#### **Opção A: Via Authorization Bearer Header** ✅ RECOMENDADO
```bash
curl --location 'http://localhost:3000/api/v1/clients' \
  --header 'Authorization: Bearer <accessToken_do_login>'
```

#### **Opção B: Via Cookie** ✅ TAMBÉM FUNCIONA
```bash
curl --location 'http://localhost:3000/api/v1/clients' \
  --header 'Cookie: Authentication=<accessToken_do_login>'
```

**What's Happening:**
1. JwtAuthGuard recebe a requisição
2. Guard extrai token:
   - Tenta cookie `Authentication` primeiro (prioridade)
   - Se não encontrar, tenta `Authorization: Bearer`
3. JwtStrategy valida assinatura com `JWT_SECRET`
4. Se válido, usuário é anexado à request

**Expected Response (200 OK):**
```json
[
  {
    "id": "...",
    "name": "Cliente 1",
    "email": "cliente1@example.com",
    ...
  }
]
```

---

### **3️⃣ ROTACIONAR TOKEN - `POST /api/auth/refresh`**

```bash
curl --location 'http://localhost:3000/api/auth/refresh' \
  --header 'Cookie: RefreshToken=<refreshToken_do_login>'
```

**Expected Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **4️⃣ LOGOUT - `POST /api/auth/logout`**

```bash
curl --location 'http://localhost:3000/api/auth/logout' \
  --header 'Authorization: Bearer <accessToken_válido>'
```

**Expected Response (200 OK):**
```json
{
  "message": "Logout bem-sucedido",
  "email": "joao@example.com"
}
```

---

### **5️⃣ OBTER USUÁRIO LOGADO - `GET /api/auth/me`**

```bash
curl --location 'http://localhost:3000/api/auth/me' \
  --header 'Authorization: Bearer <accessToken_válido>'
```

**Expected Response (200 OK):**
```json
{
  "id": "d5005e38-383a-4166-bc42-3b15276d5d84",
  "email": "joao@example.com",
  "name": "João Silva"
}
```

---

## 🔴 Erros Comuns e Soluções

### ❌ **"Não autorizado" ao acessar `/api/v1/clients`**

**Possível Causa 1: Token expirado**
```typescript
// Verificar no console: JWT token expirado
// Solução: Fazer novo login
```

**Possível Causa 2: Token inválido**
```typescript
// Verificar no console: JWT inválido
// Solução: Copiar token exato do login
```

**Possível Causa 3: Segredo diferente**
```typescript
// Se gerou com JWT_SECRET = "abc"
// Mas valida com JWT_SECRET = "xyz"
// Solução: Verificar JWT_SECRET no .env está igual em tudo
```

**Possível Causa 4: Cookie não sendo enviado**
```bash
# Postman: Verificar se cookies estão habilitados
# Verificar: Settings > Cookies > Enable cookie jar
```

---

## 🔍 Verificação Rápida do Status

### **1. Verificar JWT_EXPIRATION**
```bash
# Terminal: Verificar arquivo .env
grep JWT_EXPIRATION apps/backend/.env
# Esperado: JWT_EXPIRATION=3600
```

### **2. Verificar se servidor está rodando**
```bash
curl http://localhost:3000/api/health
# Esperado: 200 OK com status
```

### **3. Verificar formato do token**
```bash
# Ir em: https://jwt.io/
# Colar o token para decodificar
# Verificar:
# - Header: {"alg":"HS256","typ":"JWT"}
# - Payload: {"sub":"...", "email":"...", "iat":..., "exp":...}
# - exp (expiração) deve ser > que iat (emissão) + JWT_EXPIRATION
```

### **4. Ver logs do backend**
```bash
# Terminal com servidor rodando
# Procurar por:
# ✅ JWT validado para: joao@example.com
# ou
# ❌ JWT token expirado
# ❌ JWT inválido
```

---

## 📊 Arquitetura de Tokens

```
┌─────────────────────────────────────────────┐
│           LOGIN REQUEST                     │
│  email: "joao@example.com"                  │
│  password: "senha123"                       │
└────────────────┬────────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ LocalClientAuthGuard    │
    │ (valida user/pass no BD) │
    └────────────┬─────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ LoginUseCase.execute()   │
    │ - Gera accessToken       │
    │ - Gera refreshToken      │
    │ - Seta cookies httpOnly  │
    │ - Retorna JSON body      │
    └────────────┬─────────────┘
                 │
                 ▼
    ┌────────────────────────────────────────┐
    │ Response 200 OK                        │
    ├────────────────────────────────────────┤
    │ Body:                                  │
    │ {                                      │
    │   "user": "João Silva",                │
    │   "accessToken": "eyJ...",    ◄─ Use  │
    │   "refreshToken": "eyJ..."   │  em    │
    │ }                            │  Bearer │
    ├────────────────────────────────────────┤
    │ Cookies (httpOnly):                    │
    │ Set-Cookie: Authentication=eyJ...     │
    │ Set-Cookie: RefreshToken=eyJ...       │
    └────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  PRÓXIMAS REQUISIÇÕES                       │
│  GET /api/v1/clients                        │
│  Authorization: Bearer eyJ...      ◄─ Use   │
│                                     este   │
│  OU                                        │
│  Cookie: Authentication=eyJ...    ◄─ Ou   │
│                                    este   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │ JwtAuthGuard                 │
    │ 1. Extrai token (cookie/header)
    │ 2. Valida assinatura         │
    │ 3. Retorna payload           │
    └────────────┬─────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │ JwtStrategy.validate()       │
    │ Retorna ICurrentUser         │
    └────────────┬─────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │ Controller consegue acessar  │
    │ @CurrentUser() user          │
    └────────────────────────────────┘
```

---

## 🧪 Teste com cURL (Copy & Paste)

```bash
# 1. LOGIN
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"senha123"}')

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "✅ Access Token: $ACCESS_TOKEN"

# 2. ACESSAR CLIENTES COM TOKEN
curl -X GET http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 3. OBTER USUÁRIO LOGADO
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## 🚨 Checklist Final

- [ ] `.env` tem `JWT_EXPIRATION=3600`?
- [ ] `.env` tem `REFRESH_TOKEN_SECRET`?
- [ ] Backend está rodando sem erros?
- [ ] Login retorna accessToken + refreshToken?
- [ ] GET `/api/v1/clients` com Bearer token retorna 200?
- [ ] GET `/api/v1/clients` sem token retorna 401?
- [ ] GET `/api/auth/me` com token válido retorna usuário?
- [ ] Token expirado retorna 401 com "Token expirado"?

