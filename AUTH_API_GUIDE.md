# 🔐 API de Autenticação - Guia Rápido

## Endpoints

### 🔑 POST `/api/auth/login`
Autentica usuário com email e senha.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": "Helder Silva",
  "email": "user@example.com",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set:**
- `Authentication`: Refresh Token (httpOnly, 7 dias)

---

### 🔄 POST `/api/auth/refresh`
Rotaciona tokens usando o refresh token do cookie.

**Request:**
- Sem body
- Cookie: `Authentication` (automaticamente enviado)

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set:**
- Novo `Authentication` refresh token

---

### 👋 POST `/api/auth/logout`
Invalida o refresh token do usuário.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

### 👤 GET `/api/auth/me`
Retorna dados do usuário logado.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "Helder Silva"
}
```

---

## 🔐 Fluxo de Autenticação

### 1️⃣ Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt
```

Retorna `accessToken` e seta cookie `Authentication`.

### 2️⃣ Usar Access Token
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

Access Token válido por **15 minutos**.

### 3️⃣ Rotacionar Tokens (antes de expirar)
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt
```

Retorna novo `accessToken` e novo cookie `Authentication`.

### 4️⃣ Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <accessToken>" \
  -b cookies.txt
```

Invalida o refresh token.

---

## ⏱️ Tempos de Expiração

| Token | Duração | Armazenamento | Uso |
|-------|---------|---------------|-----|
| **Access** | 15 min | Body (JSON) | Chamadas API |
| **Refresh** | 7 dias | Cookie (httpOnly) | Rotacionar tokens |

---

## 🔒 Segurança

✅ **Access Token**
- JWT assinado com `JWT_SECRET`
- Curta duração (15 min)
- Enviado no body da resposta

✅ **Refresh Token**
- JWT assinado com `REFRESH_TOKEN_SECRET`
- Armazenado em cookie `httpOnly`
- Não acessível por JavaScript (XSS protection)
- Rotação automática (novo JTI gerado a cada refresh)
- Hash do JTI salvo no banco (revogação possível)

✅ **Cookies**
- `httpOnly`: Não acessível por JavaScript
- `secure`: Apenas HTTPS (em produção)
- `sameSite: strict`: CSRF protection

---

## 🧪 Testar no Swagger

Acesse: http://localhost:3000/docs

1. Clique em `POST /auth/login`
2. Execute com email e senha
3. Copie o `accessToken`
4. Clique no botão 🔓 **Authorize** (canto superior direito)
5. Cole: `Bearer <accessToken>`
6. Agora pode chamar endpoints protegidos

---

## ❌ Erros Comuns

| Erro | Causa | Solução |
|------|-------|--------|
| `401 Unauthorized` | Email/senha inválidos | Verificar credenciais |
| `401 Token inválido` | Access token expirado | Fazer refresh |
| `401 Refresh token revogado` | Logout foi feito | Fazer login novamente |
| `400 Cookie não encontrado` | Refresh cookie perdido | Fazer login novamente |

---

## 📝 Variáveis de Ambiente

```env
JWT_SECRET=<string aleatória 32+ chars>
JWT_EXPIRATION=900
REFRESH_TOKEN_SECRET=<string aleatória 32+ chars>
REFRESH_TOKEN_TTL=604800
```

Gerar secrets:
```bash
openssl rand -base64 32
```

