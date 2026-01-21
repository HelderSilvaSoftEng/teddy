# 🔴 Exception Filters - Guia de Uso

## Visão Geral

Os **Exception Filters** centralizam o tratamento de erros em toda a aplicação, fornecendo:
- ✅ Respostas padronizadas em JSON
- ✅ Logging estruturado
- ✅ HTTP status codes apropriados
- ✅ Tratamento automático de validação

## Estrutura

```
src/common/exceptions/
├── business.exception.ts           # Classes de exceção customizadas
├── global-exception.filter.ts      # Filtro global (captura tudo)
├── validation-exception.filter.ts  # Filtro específico para validação
└── index.ts                        # Barrel export
```

## Exceções Disponíveis

### 1. NotFoundException
```typescript
throw new NotFoundException('Cliente não encontrado', {
  entityType: 'Customer',
  entityId: 'abc123'
});
```
**HTTP 404** | `NOT_FOUND`

### 2. ConflictException
```typescript
throw new ConflictException('Email já cadastrado', {
  field: 'email',
  value: 'user@example.com'
});
```
**HTTP 409** | `CONFLICT`

### 3. ValidationException
```typescript
throw new ValidationException('Dados inválidos', {
  field: 'email',
  reason: 'Email format inválido'
});
```
**HTTP 400** | `VALIDATION_ERROR`

### 4. UnauthorizedException
```typescript
throw new UnauthorizedException('Token expirado');
```
**HTTP 401** | `UNAUTHORIZED`

### 5. ForbiddenException
```typescript
throw new ForbiddenException('Você não tem permissão para deletar');
```
**HTTP 403** | `FORBIDDEN`

### 6. BadRequestException
```typescript
throw new BadRequestException('Requisição malformada');
```
**HTTP 400** | `BAD_REQUEST`

### 7. InternalServerException
```typescript
throw new InternalServerException('Erro ao processar', {
  operation: 'database_query',
  originalError: error.message
});
```
**HTTP 500** | `INTERNAL_SERVER_ERROR`

## Resposta Padronizada

### Sucesso (200 OK)
```json
{
  "id": "abc123",
  "email": "user@example.com",
  "status": "ACTIVE"
}
```

### Erro (ex: 404 Not Found)
```json
{
  "statusCode": 404,
  "timestamp": "2026-01-21T15:30:00.000Z",
  "path": "/api/v1/customers/xyz",
  "method": "GET",
  "code": "NOT_FOUND",
  "message": "Cliente não encontrado",
  "details": {
    "entityType": "Customer",
    "entityId": "xyz"
  }
}
```

### Erro de Validação (400 Bad Request)
```json
{
  "statusCode": 400,
  "timestamp": "2026-01-21T15:30:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "code": "VALIDATION_ERROR",
  "message": "Erro de validação nos dados enviados",
  "errors": {
    "email": ["email must be an email"],
    "password": ["password is too short"]
  }
}
```

## Uso em Use-Cases

### Exemplo: CreateUserUseCase

```typescript
import { Injectable } from '@nestjs/common';
import { ConflictException, ValidationException } from '../../../common/exceptions';
import { IUserRepositoryPort } from '../../domain/ports/user.repository.port';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepositoryPort,
  ) {}

  async execute(input: CreateUserDto): Promise<User> {
    // Validação customizada
    if (!input.email.includes('@')) {
      throw new ValidationException('Email inválido', {
        field: 'email',
        received: input.email
      });
    }

    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('Este email já está cadastrado', {
        field: 'email',
        value: input.email
      });
    }

    // Criar usuário
    const user = await this.userRepository.create(input);
    return user;
  }
}
```

### Exemplo: GetCustomerByIdUseCase

```typescript
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../common/exceptions';

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    private customerRepository: ICustomerRepositoryPort,
  ) {}

  async execute(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado', {
        entityType: 'Customer',
        id
      });
    }

    return customer;
  }
}
```

## Fluxo de Tratamento

```
Requisição HTTP
    ↓
Controller → Use-Case → Repository
    ↓
Exceção lançada (ou erro não tratado)
    ↓
Filtro de Validação (BadRequestException)
    ↓ (se não for capturado)
Filtro Global (tudo o mais)
    ↓
Resposta padronizada JSON (+ Log)
    ↓
Cliente recebe erro estruturado
```

## Logging

Cada exceção é automaticamente logada:

```
🎯 Business Exception: CONFLICT - Email já cadastrado
⚠️ HTTP Exception: 400 - Validation failed
❌ Uncaught Error: TypeError: Cannot read property 'id'
```

## Checklist de Implementação

- [x] Classes de exceção customizadas criadas
- [x] Filtro global implementado
- [x] Filtro de validação implementado
- [x] Registro no main.ts (useGlobalFilters)
- [x] Exportação em index.ts
- [ ] Implementar em todos os use-cases
- [ ] Testes para exceções
- [ ] Documentação de API atualizada

## Próximos Passos

1. **Migrar exceções em use-cases** - Substituir throw new Error() por exceções customizadas
2. **Testes unitários** - Testar que exceções são lançadas corretamente
3. **Documentação Swagger** - Adicionar @ApiResponse com schemas de erro

