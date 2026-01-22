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

## Análise de Escalabilidade Real

### Por Que Escala Bem Hoje

O backend é **stateless**. Cada requisição traz seu JWT, faz o trabalho. Não salva sessão em memória, não depende de estado anterior. Isso significa que você pode colocar 5, 10 ou 100 instâncias atrás de um load balancer (Nginx, AWS ALB) e estará funcionando. Requisição chega, o LB escolhe uma instância, trabalha, devolve e finaliza.

O banco é o ponto central. Todas instâncias conversam com o mesmo PostgreSQL. Vocês já têm índices onde importa (email, customer_id, created_at) e soft deletes feitos certo (`deletedAt IS NULL` é indexed). Queries simples como COUNT(*).

### Gargalos Realistas

**Audit logs crescendo demais:** Você loga tudo funcionará bem, mas logo essa tabela tem milhões de registros. Queries em audit ficam lentas. Solução futura: tabelas particionadas por data ou move de histórico pra data warehouse. Por agora, não é problema.

**Pool de conexão PostgreSQL:** Se tiver 10 instâncias do backend com 20 conexões cada = 200 conexões no pool. PostgreSQL tem limite. Solução: PgBouncer (intermediário que faz pooling). Quando bater nesse limite, é rápido de resolver.

**Volume em real-time:** Se crescer muito, queries em dashboard ficam lentas. Redis resolveria isso com cache de 5 minutos. Economia enorme de I/O.

### O Que Já Tá Fazendo Certo

Schema é clean. Sem denormalizações desnecessárias que depois viram pesadelo. Usuários, clientes, audit logs bem separados. Índices onde precisam. Soft deletes implementado do jeito certo. Logs auditáveis.

### Se Precisar Escalar Mais

**Horizontal (mais máquinas):** Adiciona instâncias backend, pronto.

**Vertical (mais poder):** Redis pra cache, read replicas do Postgres, query optimization.

**Sharding (dividir base):** Se PostgreSQL ficar saturado, distribui clientes por owner_id ou range. Como vocês tão com domain/ports/infra bem separado, trocar pra ShardingRepository é coisa de alguns dias.

---

## Deployment Strategy

### Desenvolvimento (Local)

```bash
# Tudo em containers Docker
docker-compose up -d
npm run dev  # Backend + Frontend
```

### Production - Escalado

**Opção 1: Kubernetes**

- Deploy múltiplas instâncias do backend
- LoadBalancer na frente
- PostgreSQL gerenciado (AWS RDS, DigitalOcean Managed)
- Prometheus + Grafana pra monitoring

**Opção 2: Serverless (AWS Lambda)**

- NestJS configurado como Lambda handler
- AWS RDS pro database
- S3 pra storage
- CloudFront pra CDN

---

## Monitoramento & Observabilidade

Já tá configurado com OpenTelemetry e Jaeger. Key metrics que importam:

**Application:** HTTP latency, database queries, active connections, error rates
**Business:** Users created/day, customers created/day, audit log volume
**Infrastructure:** CPU, memory, disk I/O, network I/O

Se tiver mais volume, ativa Prometheus + Grafana (já tem no docker-compose) pra alertas.

---

## Security by Design

Já implementado:

✅ **Authentication:** JWT com refresh tokens  
✅ **Password:** Bcrypt com salt  
✅ **Database:** Prepared statements (TypeORM) contra SQL injection  
✅ **CORS:** Configurado por origin  
✅ **Validation:** Pipes em todos DTOs  
✅ **Error Handling:** Não expõe stack traces  
✅ **Audit:** Tudo logado  
✅ **HTTPS Ready:** Código agnóstico de protocolo

---
