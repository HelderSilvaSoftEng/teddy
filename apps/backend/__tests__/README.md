# 🧪 Arquitetura de Testes - Backend Teddy Challenger

## Estrutura de Diretórios

Seguindo a **Arquitetura Hexagonal**, os testes estão organizados em uma estrutura **paralela** ao código-fonte:

```
apps/backend/
├── src/                                    # Código fonte
│   ├── common/
│   │   ├── exceptions/
│   │   │   ├── business.exception.ts
│   │   │   ├── global-exception.filter.ts
│   │   │   └── validation-exception.filter.ts
│   │   └── ...
│   └── app/
│       └── modules/
│           ├── users/
│           │   ├── adapters/
│           │   ├── domain/
│           │   ├── infra/
│           │   └── presentation/
│           │       └── use-cases/
│           │           ├── create-user.ucase.ts
│           │           └── find-user-by-id.ucase.ts
│           └── authentication/
│               ├── adapters/
│               ├── domain/
│               ├── infra/
│               └── presentation/
│                   └── use-case/
│                       ├── login.ucase.ts
│                       └── refresh-token.ucase.ts
│
├── __tests__/                              # Testes unitários (paralelo a src/)
│   ├── common/
│   │   ├── exceptions/
│   │   │   ├── global-exception.filter.spec.ts
│   │   │   └── validation-exception.filter.spec.ts
│   │   └── ...
│   └── app/
│       └── modules/
│           ├── users/
│           │   └── presentation/
│           │       └── use-cases/
│           │           ├── create-user.ucase.spec.ts
│           │           └── find-user-by-id.ucase.spec.ts
│           └── authentication/
│               └── presentation/
│                   └── use-cases/
│                       ├── login.ucase.spec.ts
│                       └── refresh-token.ucase.spec.ts
│
├── jest.config.js                          # Configuração Jest
├── tsconfig.spec.json                      # TypeScript para testes
└── src/test-setup.ts                       # Setup dos testes
```

## Princípios da Arquitetura de Testes

### 1. **Separação Clara**
- Testes estão **fora** do diretório `src/`
- Estrutura de `__tests__/` espelha exatamente a estrutura de `src/`
- Fácil identificar qual teste corresponde a qual código

### 2. **Organização Hexagonal**
Testes respeitam as camadas da arquitetura:
- **`adapters/`** - Testes de controladores, DTOs, conversores
- **`domain/`** - Testes de entidades, tipos, portas
- **`infra/`** - Testes de repositórios, handlers de query
- **`presentation/`** - Testes de use-cases

### 3. **Nomenclatura Consistente**
- Arquivo source: `create-user.ucase.ts`
- Arquivo teste: `create-user.ucase.spec.ts`
- Sufixo `.spec.ts` para testes

## Cobertura de Testes Atual

### ✅ Exception Filters (2 suites)
```
__tests__/common/exceptions/
├── global-exception.filter.spec.ts       (10 testes)
└── validation-exception.filter.spec.ts   (8 testes)
```

**Testes**:
- Captura de BusinessException (8 tipos)
- Captura de HttpException
- Captura de Generic Error
- Estrutura de resposta padronizada
- Inclusão de details contextual
- Formatação de erros de validação

### ✅ Use-Cases (4 suites)
```
__tests__/app/modules/
├── users/presentation/use-cases/
│   ├── create-user.ucase.spec.ts         (4 testes)
│   └── find-user-by-id.ucase.spec.ts     (4 testes)
└── authentication/presentation/use-cases/
    ├── login.ucase.spec.ts               (4 testes)
    └── refresh-token.ucase.spec.ts       (5 testes)
```

**Testes**:
- Validação de exceções corretas (ConflictException, NotFoundException)
- Verificação de status codes (409, 404, 401)
- Validação de detalhes contextuais
- Mock de dependências (repositories, JWT, ConfigService)

## Executar Testes

### Rodar todos os testes
```bash
npm run backend:test
# ou
npx nx test backend
```

### Rodar testes específicos
```bash
npx jest __tests__/common/exceptions/global-exception.filter.spec.ts
```

### Modo watch
```bash
npx jest --watch
```

### Com cobertura
```bash
npx jest --coverage
```

## Próximos Passos para Completar

### 1. **Resolver Imports de Módulos TypeScript**
- Configurar `tsconfig.spec.json` com `paths` mapping
- ou usar `moduleNameMapper` no Jest
- Permitir que `ts-jest` compile corretamente os imports

### 2. **Expandir Cobertura**
Módulos ainda sem testes:
- **Customers** (5 use-cases)
- **Dashboard** (4 use-cases)
- **Audit** (1 use-case)
- **Repositories** (infra layer)
- **Mappers** (adapters layer)

### 3. **Mocking Avançado**
- Criar factory functions para mocks comuns
- Setup fixtures para dados de teste
- Test utilities para casos comuns

### 4. **E2E Tests**
- Configurar testes em `apps/backend-e2e/`
- Testar fluxos completos (signup → login → CRUD)
- Validar integração com banco de dados

## Arquivos de Configuração

### `jest.config.js`
```javascript
export default {
  displayName: 'backend',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
```

### `tsconfig.spec.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "node"],
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "include": ["src/**/*.spec.ts", "__tests__/**/*.spec.ts"]
}
```

## Melhorias Recomendadas

1. **Usar `@nestjs/testing` ModuleRef**
   - Para melhor mocking de módulos NestJS
   - Compilar módulos completos no teste

2. **E2E com Database Real**
   - Usar Docker para PostgreSQL em testes
   - Setup/teardown automático

3. **CI/CD Integration**
   - Rodar testes em cada PR
   - Gerar cobertura
   - Falhar build se cobertura < threshold

4. **Performance**
   - Parallelizar testes
   - Usar test databases em memória

## Referências

- [Jest Configuration](https://jestjs.io/docs/configuration)
- [ts-jest Guide](https://kulshekhar.github.io/ts-jest/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
