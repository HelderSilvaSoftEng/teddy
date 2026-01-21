# 🔍 OpenTelemetry & Jaeger Tracing

**Última atualização**: 21/01/2026  
**Status**: ✅ Implementado e Funcional

---

## 📚 Índice

1. [O que é Tracing?](#o-que-é-tracing)
2. [Arquitetura](#arquitetura)
3. [Como Funciona](#como-funciona)
4. [Setup Local](#setup-local)
5. [Usando Tracing nos Use-Cases](#usando-tracing-nos-use-cases)
6. [Visualizando Traces no Jaeger](#visualizando-traces-no-jaeger)
7. [Melhores Práticas](#melhores-práticas)
8. [Troubleshooting](#troubleshooting)

---

## O que é Tracing?

**Distributed Tracing** (Rastreamento Distribuído) é uma técnica para rastrear o **caminho completo** de uma requisição através de múltiplos serviços, capturando:

### 🎯 Componentes Principais

| Termo | Descrição | Exemplo |
|-------|-----------|---------|
| **Trace** | Requisição completa | `POST /api/auth/login` inteira |
| **Span** | Operação específica | `find_user`, `generate_tokens`, `update_user` |
| **Trace ID** | Identificador único | `abc123def456` - mesmo em todos os spans |
| **Parent Span** | Span que chama outro | `login_process` → `find_user` |
| **Attributes** | Metadados do span | `user.email: "admin@teddy.com"` |
| **Events** | Marcos durante execução | `"user_found"`, `"token_generated"` |

### 📊 Exemplo Visual

```
POST /api/auth/login (Trace ID: abc123)
├─ login_process [200ms] ← Span pai
│  ├─ find_user [50ms]
│  │  └─ query: SELECT * FROM users WHERE email = ?
│  ├─ generate_tokens [75ms]
│  │  ├─ sign_access_token [30ms]
│  │  └─ sign_refresh_token [45ms]
│  ├─ hash_jti [10ms]
│  ├─ update_user [50ms]
│  │  └─ query: UPDATE users SET...
│  └─ audit_login [15ms]
└─ Response 200 OK
```

---

## Arquitetura

### 🏗️ Stack Implementado

```
┌─────────────────────────────────────┐
│   Backend NestJS (seu app)          │
│  - LoginUseCase                     │
│  - CreateCustomerUseCase            │
│  - UpdateCustomerUseCase            │
│  - GetTracer() + startSpan()        │
└──────────────┬──────────────────────┘
               │ HTTP/OTLP Protocol
               ↓
┌─────────────────────────────────────┐
│  OpenTelemetry SDK                  │
│  - NodeSDK com auto-instrumentations│
│  - JaegerExporter                   │
│  - BatchSpanProcessor               │
└──────────────┬──────────────────────┘
               │ HTTP POST
               ↓
┌─────────────────────────────────────┐
│  Jaeger (Tracing Backend)           │
│  - Collector (port 14268)           │
│  - Storage (in-memory/BadgerDB)     │
│  - Query API                        │
└──────────────┬──────────────────────┘
               │ HTTP
               ↓
┌─────────────────────────────────────┐
│  Jaeger UI (port 16686)             │
│  - Visualizar traces                │
│  - Filtrar por serviço/operação     │
│  - Analisar performance             │
└─────────────────────────────────────┘
```

### 📦 Dependências Instaladas

```json
{
  "@opentelemetry/api": "^1.7.0",           // Core tracing API
  "@opentelemetry/sdk-node": "^0.43.0",     // Node.js SDK
  "@opentelemetry/sdk-trace-node": "^1.17.1", // Trace SDK
  "@opentelemetry/exporter-trace-jaeger-http": "^1.17.1", // Jaeger exporter
  "@opentelemetry/instrumentation": "^0.43.0",
  "@opentelemetry/instrumentation-express": "^0.32.2",
  "@opentelemetry/instrumentation-http": "^0.43.0",
  "@opentelemetry/resources": "^1.17.1",
  "@opentelemetry/semantic-conventions": "^1.17.1"
}
```

---

## Como Funciona

### 🔌 Inicialização (main.ts)

```typescript
import { initializeTracing } from './app/telemetry';

async function bootstrap() {
  // CRUCIAL: Inicializar tracing ANTES de criar a app
  initializeTracing();

  const app = await NestFactory.create(AppModule);
  // ... resto da configuração
}
```

**Por que primeiro?**
- Jaeger precisa interceptar as HTTP calls do Express
- Se inicializar depois, perderá dados dessas requisições

### ⚙️ Configuração (app/telemetry/tracing.ts)

```typescript
export function initializeTracing(): void {
  // 1. Criar exportador para Jaeger
  const jaegerExporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  });

  // 2. Criar SDK do Node.js
  const sdk = new NodeSDK({
    resource: new Resource({
      'service.name': 'teddy-backend',    // Nome do serviço no Jaeger
      'service.version': '1.0.0',         // Versão
    }),
    traceExporter: jaegerExporter,
    instrumentations: [getNodeAutoInstrumentations()], // Auto-instrumentar Express, HTTP, etc
  });

  // 3. Iniciar SDK
  sdk.start();

  // 4. Graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown().finally(() => process.exit(0));
  });
}
```

### 🎣 Usando Spans Customizados

```typescript
import { getTracer } from './app/telemetry';

export class MyUseCase {
  private readonly tracer = getTracer();

  async execute() {
    // 1. Criar span pai
    const span = this.tracer.startSpan('my_operation', {
      attributes: {
        'user.id': userId,
        'user.email': email,
      },
    });

    try {
      // 2. Criar span filho
      const dbSpan = this.tracer.startSpan('database_query', {
        parent: span,
        attributes: {
          'db.statement': 'SELECT * FROM users WHERE id = ?',
          'db.method': 'findById',
        },
      });

      const result = await this.db.findById(userId);
      dbSpan.end(); // ✅ Sempre fechar span

      // 3. Adicionar event (marca importante)
      span.addEvent('user_found', {
        'user.name': result.name,
      });

      return result;
    } catch (error) {
      // 4. Registrar exceção
      span.recordException(error);
      throw error;
    } finally {
      // 5. Sempre fechar span pai
      span.end();
    }
  }
}
```

---

## Setup Local

### 1️⃣ Iniciar Jaeger

```bash
# Usando docker-compose
docker-compose -f docker-compose.jaeger.yml up -d

# Verificar se está rodando
docker ps | grep jaeger
```

**Ports:**
- **14268** - Collector HTTP (onde backend envia dados)
- **16686** - Jaeger UI (onde você visualiza)

### 2️⃣ Instalar Dependências

```bash
# Na raiz do projeto
pnpm install

# Ou no backend específico
cd apps/backend && pnpm install
```

### 3️⃣ Configurar Variável de Ambiente

Adicione ao `.env` do backend:

```env
# Jaeger Configuration
JAEGER_ENDPOINT=http://localhost:14268/api/traces
NODE_ENV=development
```

### 4️⃣ Iniciar Backend

```bash
npm run dev -- --project=backend

# Ou
cd apps/backend && npm run dev
```

### 5️⃣ Acessar Jaeger UI

```
http://localhost:16686
```

---

## Usando Tracing nos Use-Cases

### ✅ Exemplo: LoginUseCase

```typescript
import { getTracer } from '../../../../../app/telemetry';

@Injectable()
export class LoginUseCase {
  private readonly tracer = getTracer();

  async execute(user: ICurrentUser, response: Response): Promise<LoginResponse> {
    // 1️⃣ Criar span pai para toda operação
    const span = this.tracer.startSpan('login_process', {
      attributes: {
        'user.email': user.email,
        'user.id': user.id,
      },
    });

    try {
      // 2️⃣ Criar span para buscar usuário
      const findUserSpan = this.tracer.startSpan('find_user', {
        parent: span,
        attributes: {
          'db.operation': 'findById',
        },
      });

      const currentUser = await this.userRepository.findById(user.id);
      findUserSpan.end();

      // 3️⃣ Criar span para geração de tokens
      const tokenSpan = this.tracer.startSpan('generate_tokens', { parent: span });

      const accessToken = this.jwtService.sign(payload, { expiresIn: '3600s' });
      const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: '604800s' });

      tokenSpan.end();

      // 4️⃣ Adicionar atributos ao span pai
      span.setAttributes({
        'login.success': true,
        'login.accessCount': currentUser.accessCount,
      });

      return { accessToken, refreshToken };
    } catch (error) {
      // 5️⃣ Registrar exceção
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      // 6️⃣ SEMPRE fechar o span
      span.end();
    }
  }
}
```

### 📝 Spans Implementados

**LoginUseCase:**
- `login_process` (parent)
  - `find_user` - buscar usuário no BD
  - `generate_tokens` - gerar access + refresh tokens
  - `hash_jti` - hash do JTI
  - `update_user` - salvar tokens no BD
  - `audit_login` - registrar auditoria

**CreateCustomerUseCase:**
- `create_customer_process` (parent)
  - `validate_email` - validar email único
  - `create_entity` - criar entidade
  - `save_to_db` - persistir no banco
  - `audit_create` - registrar auditoria

**UpdateCustomerUseCase:**
- `update_customer_process` (parent)
  - `find_customer` - buscar customer
  - `apply_updates` - aplicar mudanças
  - `save_to_db` - persistir no banco
  - `audit_update` - registrar auditoria

---

## Visualizando Traces no Jaeger

### 🎯 Acessar Jaeger UI

```
http://localhost:16686
```

### 📊 Filtrar Traces

**Por Serviço:**
- Dropdown "Service" → `teddy-backend`

**Por Operação:**
- Dropdown "Operation" → `login_process`, `create_customer`, etc

**Por Duração:**
- Min Duration: `10ms`
- Max Duration: `5000ms`

**Por Tag:**
- Adicionar: `user.email = admin@teddy.com`

### 🔎 Analisar Trace

1. **Selecionar trace** na lista
2. **Ver timeline** dos spans
3. **Clicar em span** para detalhes:
   - Duração
   - Atributos
   - Events
   - Exceções

### 📈 Exemplos de Análise

#### Login Lento?
```
1. Abrir Jaeger UI
2. Service: teddy-backend
3. Operation: login_process
4. Ver qual span leva mais tempo
5. Ex: find_user demorando 500ms → verificar índices no BD
```

#### Erro em Create Customer?
```
1. Filtrar por operation: create_customer_process
2. Procurar traces com status error
3. Clicar no span com exceção
4. Ver mensagem de erro completa
5. Stack trace disponível
```

---

## Melhores Práticas

### ✅ DO's

```typescript
// ✅ Sempre fechar spans
const span = this.tracer.startSpan('operation');
try {
  // fazer trabalho
} finally {
  span.end(); // ← SEMPRE!
}

// ✅ Usar hierarquia de spans
const parentSpan = this.tracer.startSpan('parent');
const childSpan = this.tracer.startSpan('child', { parent: parentSpan });
childSpan.end();
parentSpan.end();

// ✅ Adicionar atributos úteis
span.setAttributes({
  'user.id': userId,
  'entity.type': 'Customer',
  'operation.success': true,
});

// ✅ Usar events para marcos
span.addEvent('user_authenticated', { 'auth.method': 'jwt' });
span.addEvent('database_updated');
```

### ❌ DON'Ts

```typescript
// ❌ Não esquecer de fechar span
const span = this.tracer.startSpan('operation');
// ... sem span.end()

// ❌ Não colocar dados sensíveis
span.setAttributes({
  'user.password': 'secret123', // ❌ Nunca!
});

// ❌ Não criar muitos spans desnecessários
for (let i = 0; i < 10000; i++) {
  this.tracer.startSpan(`iteration_${i}`).end(); // ❌ Performance!
}

// ❌ Não registrar dados muito grandes
span.setAttributes({
  'response.body': bigJsonObject, // ❌ Truncará!
});
```

### 🎯 Naming Convention

Usar formato `snake_case` para nomes de spans:
```typescript
// ✅ Bom
startSpan('create_customer')
startSpan('update_user')
startSpan('find_by_email')

// ❌ Ruim
startSpan('CreateCustomer')
startSpan('updateUser')
startSpan('findByEmail')
```

### 📏 Atributos Recomendados

```typescript
// Sempre incluir contexto
{
  'user.id': userId,
  'user.email': email,
  'operation.type': 'CREATE|UPDATE|DELETE|READ',
  'entity.type': 'Customer|User|Order',
  'entity.id': entityId,
  'request.id': requestId,
  'request.method': 'GET|POST|PUT|DELETE',
  'request.path': '/api/v1/customers',
  'response.status': 200,
  'db.operation': 'select|insert|update|delete',
  'db.table': 'customers',
}
```

---

## Troubleshooting

### ❌ Problema: Jaeger não recebe traces

**Solução:**
```bash
# 1. Verificar se Jaeger está rodando
docker ps | grep jaeger

# 2. Verificar logs do Jaeger
docker logs teddy-jaeger

# 3. Testar conexão
curl http://localhost:14268/api/traces

# 4. Verificar JAEGER_ENDPOINT no .env
echo $JAEGER_ENDPOINT

# 5. Se tudo OK, reiniciar backend
npm run dev -- --project=backend
```

### ❌ Problema: UI do Jaeger vazia

**Solução:**
```bash
# 1. Gerar alguns traces
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teddy.com","password":"password"}'

# 2. Aguardar 2-3 segundos
# 3. Atualizar Jaeger UI (F5)
# 4. Verificar dropdown de serviços
```

### ❌ Problema: Memory leak de spans

**Solução:**
```typescript
// ❌ Ruim - span nunca fecha
const span = this.tracer.startSpan('operation');
// ... esqueceu de fechar

// ✅ Bom - usar try/finally
const span = this.tracer.startSpan('operation');
try {
  // operação
} finally {
  span.end();
}
```

### ❌ Problema: Performance degradada

**Solução:**
```typescript
// Usar sampling em produção
const sdk = new NodeSDK({
  // ...
  spanProcessor: [
    new BatchSpanProcessor(jaegerExporter, {
      maxQueueSize: 100,        // Não acumular muitos spans
      maxExportBatchSize: 50,
      scheduledDelayMillis: 5000, // Exportar a cada 5s
    }),
  ],
  // Sampling: exportar apenas 10% dos traces
  sampler: new ProbabilitySampler(0.1),
});
```

---

## 📊 Métricas Capturadas Automaticamente

**OpenTelemetry auto-instrumenta:**

- ✅ HTTP requests (Express)
- ✅ Database queries (se usar driver com suporte)
- ✅ Event loop delays
- ✅ Process memory usage
- ✅ Node.js runtime metrics

**Não instrumentado automaticamente:**
- ❌ Business logic (você cria spans customizados)
- ❌ Custom operations (você cria spans)

---

## 🚀 Próximos Passos

1. ✅ **Jaeger Local** - Já implementado
2. ⏳ **Jaeger em Docker Compose** - Está no `docker-compose.jaeger.yml`
3. ⏳ **Adicionar spans em todos os use-cases** - Comece com Login, Customer, User
4. ⏳ **Grafana + Prometheus** - Opcional, complementa tracing
5. ⏳ **OpenTelemetry em Produção** - DataDog, Jaeger em Kubernetes, etc

---

## 📚 Referências

- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Jaeger Docs](https://www.jaegertracing.io/docs/)
- [OpenTelemetry NestJS Integration](https://github.com/open-telemetry/opentelemetry-js)

---

**Último update**: 21/01/2026  
**Implementado por**: Assistente Copilot  
**Status**: ✅ Pronto para uso
