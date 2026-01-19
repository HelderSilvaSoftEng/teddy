# 🏗️ Auditoria - Módulo Customer (Arquitetura Hexagonal)

## Status: ⚠️ NÃO CONFORME

### Problemas Identificados:

#### 1. **Entity - Mismatch de Propriedades** ❌
**Arquivo:** `domain/entities/customer.entity.ts`
**Problema:** A entity tem campos que não correspondem ao DTO e ao Mapper
- Entity tem: `name`, `company`, `status`, `createdAt`, `updatedAt`, `deletedAt`
- Mapper espera: `userName`, `enterprise`, `accessCount`
- DTO usa: `name`, `company`

**Impacto:** O mapper está mapeando propriedades que não existem na entity.

---

#### 2. **Repository - Erro no Método findAndCount** ⚠️
**Arquivo:** `infra/repositories/customer.repository.ts`
**Problema:** TypeORM não suporta `withDeleted` em `findAndCount()`
**Código problemático:**
```typescript
const [data, total] = await this.repository.findAndCount({
  where: {},
  withDeleted: false,  // ❌ Não funciona aqui
  skip,
  take,
});
```
**Solução:** Usar QueryBuilder

---

#### 3. **Mapper Desatualizado** ❌
**Arquivo:** `infra/mappers/customer.mapper.ts`
**Problema:** Mapeando campos que não existem na entity
- `userName` → não existe (entity tem `name`)
- `enterprise` → não existe (entity tem `company`)
- `accessCount` → não existe na entity

---

#### 4. **Use Cases - Falta Validação** ⚠️
**Arquivo:** `presentation/use-cases/`
**Problema:** Use cases não validam se usuário existe
**Impacto:** Pode criar customers órfãos com userId inexistente

---

#### 5. **Controller - Falta de Injeção de Use Cases** ❌
**Arquivo:** `adapters/controllers/customer.controller.ts`
**Problema:** Use cases não estão injetados no controller
**Consequência:** Métodos estão vazios (return {})

---

#### 6. **Falta de Índices no Banco** ⚠️
**Problema:** Campo `userId` não tem índice
**Impacto:** Queries lentas em `findByUserId()`

---

## ✅ Checklist de Conformidade - Arquitetura Hexagonal

| Camada | Item | Status | Observação |
|--------|------|--------|-----------|
| **Domain** | Entity com regras de negócio | ✅ | OK |
| **Domain** | Port (Interface) | ✅ | OK |
| **Infra** | Repository implementa Port | ✅ | OK, mas com bugs |
| **Infra** | Mapper de Entity → DTO | ❌ | Desatualizado |
| **Presentation** | Use Cases | ⚠️ | Existem mas sem validação |
| **Adapters** | DTOs com validação | ⚠️ | Faltam alguns decoradores |
| **Adapters** | Controller | ❌ | Sem injeção de dependências |
| **Module** | Providers | ⚠️ | Faltam exports do Controller |

---

## 🔧 Recomendações de Correção

### Ordem de Prioridade:

1. **P0 (Crítico):** Corrigir mapper para usar campos corretos da entity
2. **P0 (Crítico):** Injetar use cases no controller
3. **P1 (Alto):** Corrigir repository `findAll()` com QueryBuilder
4. **P1 (Alto):** Adicionar validações nos use cases
5. **P2 (Médio):** Adicionar índice no banco (userId)
6. **P2 (Médio):** Adicionar @Index() decorador na entity

---

## Próximos Passos:

1. ✅ Auditar estrutura (CONCLUÍDO)
2. ⏳ Corrigir mapping e repository
3. ⏳ Implementar injeção no controller
4. ⏳ Adicionar validações nos use cases
5. ⏳ Testar fluxos completos
