# 🏗️ Arquitetura & Escalabilidade - Teddy

## Padrão Hexagonal (Ports & Adapters)

O projeto implementa Hexagonal Architecture para máxima escalabilidade:

### Exemplo: Dashboard Feature

```
dashboard/
├── domain/                          # Core do negócio
│   ├── dashboard.entity.ts          # Entidade pura (sem dependências)
│   └── types.ts                     # Tipos domínio
│
├── ports/                           # Contratos (interfaces)
│   └── dashboard.repository.port.ts # Interface que qualquer BD implementa
│
├── infra/                           # Implementações técnicas
│   └── dashboard.repository.ts      # Implementação TypeORM
│
├── adapters/                        # Controllers, DTOs
│   ├── controllers/
│   │   └── dashboard.controller.ts
│   └── dtos/
│       ├── dashboard-stats.response.dto.ts
│       └── recent-customers.response.dto.ts
│
└── presentation/                    # Orquestração
    └── use-cases/
        ├── get-dashboard-stats.ucase.ts
        └── get-recent-customers.ucase.ts
```

### Benefícios

✅ **Independência de Framework**: Trocar TypeORM por Prisma = mudar só 1 arquivo
✅ **Testabilidade**: Mock repositories facilmente
✅ **Separação de Concerns**: Cada camada tem responsabilidade clara
✅ **Escalabilidade**: Adicione novos adapters (GraphQL, gRPC) sem quebrar core

---

## Estratégia de Escalabilidade

### 1. Escalabilidade Horizontal (Múltiplas Instâncias)

**Pronto Para:**

- ✅ Load Balancer (Nginx, HAProxy, AWS ALB)
- ✅ Kubernetes deployment (stateless)
- ✅ Docker containers

**Por que funciona:**

- API é stateless (tokens JWT, sem session storage)
- Cada instância se conecta ao mesmo BD
- Cookies/tokens válidos em qualquer instância

### 2. Escalabilidade Vertical (Mais Poder)

**Otimizações Já Implementadas:**

### 1. Database Indexing

### 2. Query Optimization


### 3. Caching Strategy

**Ready para Redis** (estrutura suporta):

### 4. Database Sharding (Para Futuro)

Quando BD ficar grande, distribuir por usuario_id:

### 5. API Rate Limiting

**Implementado via Guard** (pronto para ativar):


---

## Deployment Strategy

### Desenvolvimento (Local)

```bash
# Tudo em containers Docker
docker-compose up -d
npm run dev  # Backend + Frontend
```

### Staging/Production (Escalado)

**Serverless (AWS Lambda + RDS)**

- Handler: NestJS configurado como Lambda
- BD: AWS RDS (managed PostgreSQL)
- Storage: S3
- CDN: CloudFront

---

## Monitoramento & Observabilidade

### Métricas Coletadas

**Application Metrics:**

- HTTP request latency (P50, P95, P99)
- Database query duration
- Active connections
- Error rates

**Business Metrics:**

- Users created per day
- Customers created per day
- Audit log entries per action

**Infrastructure Metrics:**

- CPU usage
- Memory usage
- Disk I/O
- Network I/O



---

## Security by Design

### Implementações de Segurança

✅ **Authentication**: JWT com refresh tokens
✅ **Password**: Bcrypt com salt
✅ **Database**: TypeORM prepared statements (SQL injection prevention)
✅ **CORS**: Configurado por origin
✅ **Validation**: Pipes de validação em todos DTOs
✅ **Error Handling**: Não expõe stack traces
✅ **Audit**: Todos mutações logadas
✅ **HTTPS Ready**: Código agnóstico de protocolo

---
