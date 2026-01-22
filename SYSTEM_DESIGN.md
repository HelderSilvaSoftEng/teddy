# 📐 System Design & Component Overview

## High-Level System Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                            CLIENT LAYER                                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                         ┃
┃   🖥️  Browser                                                          ┃
┃   ├─ React SPA (apps/frontend)                                        ┃
┃   ├─ Pages: Login, Users, Customers, Dashboard                        ┃
┃   ├─ State Management: React Hooks + Context                          ┃
┃   └─ HTTP Client: Fetch API (JWT in headers)                          ┃
┃                                                                         ┃
┗━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                   │ HTTPS
                   │ POST /api/auth/login
                   │ GET /api/v1/users (+ Authorization header)
                   │
┏━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                          APPLICATION LAYER                            ┃
┃                      (NestJS Backend - Port 3000)                     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                         ┃
┃  ┌──────────────────────────────────────────────────────────────────┐  ┃
┃  │                 🎮 HTTP Controllers/Routes                       │  ┃
┃  │  ├─ AuthController: /auth/login, /auth/refresh, /auth/logout    │  ┃
┃  │  ├─ UsersController: /users (CRUD)                              │  ┃
┃  │  ├─ CustomersController: /customers (CRUD)                      │  ┃
┃  │  ├─ DashboardController: /dashboard/stats, /dashboard/trends   │  ┃
┃  │  └─ HealthController: /health, /health/live, /health/ready      │  ┃
┃  └──────────────┬───────────────────────────────────────────────────┘  ┃
┃                 │ Dependency Injection                                  ┃
┃  ┌──────────────┴───────────────────────────────────────────────────┐  ┃
┃  │            📋 Use Cases / Application Services                   │  ┃
┃  │  ├─ LoginUseCase → generates JWT + sets cookie                  │  ┃
┃  │  ├─ RefreshTokenUseCase → rotate tokens                         │  ┃
┃  │  ├─ CreateUserUseCase → validates + saves                       │  ┃
┃  │  ├─ CreateCustomerUseCase → creates + audits                    │  ┃
┃  │  └─ GetDashboardStatsUseCase → aggregates data                  │  ┃
┃  └──────────────┬───────────────────────────────────────────────────┘  ┃
┃                 │ Repository Injection                                  ┃
┃  ┌──────────────┴───────────────────────────────────────────────────┐  ┃
┃  │         🏛️  Repository Pattern (Data Access)                     │  ┃
┃  │  ├─ UserRepository → TypeORM operations on users table          │  ┃
┃  │  ├─ CustomerRepository → TypeORM operations on customers table  │  ┃
┃  │  ├─ AuditLogRepository → TypeORM operations on audit_logs      │  ┃
┃  │  └─ HealthRepository → Database connectivity checks             │  ┃
┃  └──────────────┬───────────────────────────────────────────────────┘  ┃
┃                 │ SQL Queries                                           ┃
┗━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                   │ TCP:5432 (PostgreSQL protocol)
                   │ Connection Pool (max 20)
                   │
┏━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                         DATA LAYER                                    ┃
┃                   (PostgreSQL - Port 5432)                           ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                         ┃
┃  Database: teddy_db                                                    ┃
┃  ├─ Tables:                                                            ┃
┃  │  ├─ users (id, email, password_hash, status, created_at)          ┃
┃  │  ├─ customers (id, userId, name, salary, company, status)         ┃
┃  │  ├─ audit_logs (id, userId, action, entityType, changes)          ┃
┃  │  └─ typeorm_metadata (internal)                                   ┃
┃  ├─ Indexes:                                                           ┃
┃  │  ├─ idx_users_email                                               ┃
┃  │  ├─ idx_customers_user_id                                         ┃
┃  │  ├─ idx_audit_logs_created_at                                     ┃
┃  │  └─ idx_audit_logs_entity_type_id                                 ┃
┃  └─ Soft Delete: deletedAt column em todos tables                    ┃
┃                                                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

```

---

## Request/Response Flow Example

### 1️⃣ Login Flow

```
┌────────────────────────────────────────────────────────────────────┐
│ BROWSER                                                            │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         │ POST /api/auth/login
                         │ { email: "admin@teddy.com", password: "..." }
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│ AuthController.login()                                             │
│  └─> Call LoginUseCase                                             │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│ LoginUseCase                                                       │
│  ├─> UserRepository.findByEmail(email)                            │
│  │    └─> DB Query: SELECT * FROM users WHERE email = ?           │
│  ├─> Verify password (bcrypt.compare)                             │
│  ├─> Generate JWT access token (15 min)                           │
│  ├─> Generate JWT refresh token (7 days)                          │
│  ├─> Save refresh token hash to DB                                │
│  └─> AuditLogRepository.log("LOGIN", userId)                      │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         │ HTTP 200
                         │ { user, email, accessToken }
                         │ Set-Cookie: Authentication=<refresh_token>
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│ BROWSER                                                            │
│  ├─> Store accessToken in localStorage                            │
│  ├─> Receive Authentication cookie (httpOnly, secure)             │
│  └─> Redirect to /dashboard                                        │
└────────────────────────────────────────────────────────────────────┘
```

### 2️⃣ Fetch Protected Resource

```
┌────────────────────────────────────────────────────────────────────┐
│ BROWSER                                                            │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             │ GET /api/dashboard/stats
                             │ Authorization: Bearer <accessToken>
                             │ Cookie: Authentication=<refresh_token>
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│ Global JWT Guard (middleware)                                      │
│  └─> JwtStrategy.validate(token)                                   │
│      ├─> Verify JWT signature                                      │
│      ├─> Check expiration                                          │
│      └─> Extract payload (userId, email)                           │
└────────────────────────────┬───────────────────────────────────────┘
                             │ ✅ Token válido
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│ DashboardController.getStats(@CurrentUser() user)                 │
│  └─> Call GetDashboardStatsUseCase                                │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│ GetDashboardStatsUseCase                                           │
│  ├─> UserRepository.count()                                        │
│  │    └─> SELECT COUNT(*) FROM users WHERE deletedAt IS NULL      │
│  ├─> CustomerRepository.count()                                    │
│  │    └─> SELECT COUNT(*) FROM customers WHERE deletedAt IS NULL  │
│  ├─> AuditLogRepository.count()                                    │
│  │    └─> SELECT COUNT(*) FROM audit_logs                         │
│  └─> Return { totalUsers, totalCustomers, totalAuditLogs }        │
└────────────────────────┬───────────────────────────────────────────┘
                         │ HTTP 200
                         │ { totalUsers: 5, totalCustomers: 42, ... }
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│ BROWSER                                                            │
│  └─> Update dashboard cards with stats                            │
└────────────────────────────────────────────────────────────────────┘
```

---

## Hexagonal Architecture Layers

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ EXTERNAL WORLD (Change these = não quebra core)            ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                             ┃
┃  ┌─────────────────────────────────────────────────────┐  ┃
┃  │ 🌐 ADAPTERS (Input/Output)                          │  ┃
┃  │ ├─ HTTP Controllers (Express/NestJS)                │  ┃
┃  │ ├─ DTOs & Serializers                               │  ┃
┃  │ ├─ Database Adapters (TypeORM)                      │  ┃
┃  │ ├─ External APIs (Email, Payment)                   │  ┃
┃  │ └─ File Storage (S3, Local FS)                      │  ┃
┃  └────────────────────┬────────────────────────────────┘  ┃
┃                       │ Dependency Inversion              ┃
┃  ┌────────────────────┴────────────────────────────────┐  ┃
┃  │ 🔌 PORTS (Interfaces/Contracts)                    │  ┃
┃  │ ├─ IUserRepository                                 │  ┃
┃  │ ├─ ICustomerRepository                             │  ┃
┃  │ ├─ IMailService                                    │  ┃
┃  │ ├─ IStorageService                                 │  ┃
┃  │ └─ ILogger                                          │  ┃
┃  └────────────────────┬────────────────────────────────┘  ┃
┃                       │ Implement                         ┃
┃                       │                                   ┃
┃          ╔════════════╩════════════╗                      ┃
┃          │                         │                      ┃
┃  ┌───────┴────────┐       ┌───────┴────────┐             ┃
┃  │ 🏛️ INFRA       │       │ 📋 PRESENTATION│             ┃
┃  │ ├─ Repositories│       │ ├─ Use Cases   │             ┃
┃  │ ├─ DB Access   │       │ ├─ Services    │             ┃
┃  │ ├─ Queries     │       │ └─ Orchestration│             ┃
┃  │ └─ ORM Configs │       └───────┬────────┘             ┃
┃  └───────┬────────┘               │                       ┃
┃          │                        │                       ┃
┃          └────────────┬───────────┘                       ┃
┃                       │                                   ┃
┃  ┌────────────────────┴────────────────────────────────┐  ┃
┃  │ 🎯 DOMAIN (CORE - nunca muda)                       │  ┃
┃  │ ├─ Entities                                         │  ┃
┃  │ ├─ Value Objects                                    │  ┃
┃  │ ├─ Business Rules                                   │  ┃
┃  │ ├─ Domain Events                                    │  ┃
┃  │ └─ Aggregates                                       │  ┃
┃  └────────────────────────────────────────────────────┘  ┃
┃                                                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,  -- bcrypt hash
  status VARCHAR NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, INACTIVE
  refreshTokenHash VARCHAR,     -- hash do refresh token
  refreshTokenExpires TIMESTAMP,
  recoveryTokenHash VARCHAR,    -- password reset token
  recoveryTokenExpires TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now(),
  deletedAt TIMESTAMP,          -- soft delete
  accessCount INTEGER DEFAULT 0,
  CONSTRAINT unique_email UNIQUE(email)
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255),
  salary NUMERIC(12,2),
  company VARCHAR(255),
  status VARCHAR NOT NULL DEFAULT 'ACTIVE',
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now(),
  deletedAt TIMESTAMP,
  CONSTRAINT fk_customer_user FOREIGN KEY(userId) REFERENCES users(id)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL REFERENCES users(id),
  userEmail VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,     -- CREATE, UPDATE, DELETE
  entityType VARCHAR(100) NOT NULL,  -- User, Customer
  entityId UUID NOT NULL,
  oldValues JSONB,                 -- valores anteriores
  newValues JSONB,                 -- valores novos
  changes TEXT,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  endpoint VARCHAR(255),
  httpMethod VARCHAR(10),
  status VARCHAR(20),
  errorMessage TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  deletedAt TIMESTAMP
);

-- Indexes para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_customers_user_id ON customers(userId);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(createdAt);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entityType, entityId);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(userId);
```

---

## Module Dependencies Graph

```
app.module.ts (root)
│
├─ DatabaseModule
│  └─ TypeOrmModule (PostgreSQL connection)
│
├─ AuthenticationModule
│  ├─ UsersRepository (injected)
│  ├─ JwtModule (signs tokens)
│  ├─ PassportModule (strategies)
│  └─ Depends: UsersModule
│
├─ UsersModule
│  ├─ UsersController
│  ├─ UsersRepository
│  ├─ CreateUserUseCase
│  ├─ UpdateUserUseCase
│  ├─ DeleteUserUseCase
│  └─ Depends: DatabaseModule
│
├─ CustomersModule
│  ├─ CustomersController
│  ├─ CustomersRepository
│  ├─ AuditLogRepository
│  └─ Depends: UsersModule, DatabaseModule
│
├─ DashboardModule
│  ├─ DashboardController
│  ├─ DashboardRepository
│  ├─ GetDashboardStatsUseCase
│  └─ Depends: DatabaseModule, AuditModule
│
├─ HealthModule
│  ├─ HealthController
│  └─ Depends: DatabaseModule
│
└─ AuditModule (shared)
   ├─ AuditLogRepository
   └─ Depends: DatabaseModule
```

---

## Data Flow: Create Customer

```
React Component (Customers Page)
│
│ handleCreateCustomer(formData)
│ │
│ └─> CustomerService.create(formData)
│     │
│     └─> POST /api/v1/customers
│         │
│         Header: Authorization: Bearer <token>
│         Body: { name, salary, company }
│         │
│         ▼
│     CustomersController.create(@Body() dto, @CurrentUser() user)
│     │
│     ├─ Validate DTO (max 255 chars, salary > 0)
│     │
│     └─> CreateCustomerUseCase.execute(user.id, dto)
│         │
│         ├─ Verify user exists
│         │  └─> SELECT * FROM users WHERE id = ? AND deletedAt IS NULL
│         │
│         ├─ Create Customer object
│         │  └─> new Customer(user.id, name, salary, company)
│         │
│         ├─ Save to database
│         │  └─> INSERT INTO customers (...) VALUES (...)
│         │
│         ├─ Log audit
│         │  └─> INSERT INTO audit_logs
│         │      (userId, action="CREATE", entityType="Customer", ...)
│         │
│         └─> Return CustomerResponseDTO
│             │
│             ▼
│         HTTP 201 Created
│         { id, name, salary, company, status, createdAt }
│         │
│         ▼
│     React Component receives data
│     │
│     ├─ Add to local state
│     ├─ Show success toast
│     └─ Refresh customers list
│
▼
UI updates with new customer
```

---

## Status Codes & Error Handling

```
✅ 200 OK
   → GET endpoints
   → Safe UPDATE endpoints

📝 201 Created
   → POST endpoints (create new resource)

🔄 204 No Content
   → DELETE endpoint (success, no body)

🚫 400 Bad Request
   → Invalid DTO (email format, missing fields)
   → Validation failed

🔐 401 Unauthorized
   → Missing/invalid JWT token
   → Token expired

🚫 403 Forbidden
   → User not owner of resource
   → Insufficient permissions

🔍 404 Not Found
   → Resource doesn't exist
   → User deleted (soft delete)

⚠️ 409 Conflict
   → Email already exists
   → Duplicate resource

💥 500 Internal Server Error
   → Database connection error
   → Unexpected server error
```
