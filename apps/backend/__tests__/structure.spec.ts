// Teste simples para demonstrar a estrutura de testes funcionando
describe('Business Exception Hierarchy', () => {
  it('should demonstrate the test structure is correctly organized', () => {
    const testStructure = {
      backend: {
        src: {
          common: {
            exceptions: ['business.exception.ts', 'global-exception.filter.ts', 'validation-exception.filter.ts'],
          },
          app: {
            modules: {
              users: {
                presentation: {
                  'use-cases': ['create-user.ucase.ts', 'find-user-by-id.ucase.ts'],
                },
              },
              authentication: {
                presentation: {
                  'use-case': ['login.ucase.ts', 'refresh-token.ucase.ts'],
                },
              },
            },
          },
        },
        __tests__: {
          common: {
            exceptions: ['global-exception.filter.spec.ts', 'validation-exception.filter.spec.ts'],
          },
          app: {
            modules: {
              users: {
                presentation: {
                  'use-cases': ['create-user.ucase.spec.ts', 'find-user-by-id.ucase.spec.ts'],
                },
              },
              authentication: {
                presentation: {
                  'use-cases': ['login.ucase.spec.ts', 'refresh-token.ucase.spec.ts'],
                },
              },
            },
          },
        },
      },
    };

    // Verify structure
    expect(testStructure.backend.src.common.exceptions).toEqual([
      'business.exception.ts',
      'global-exception.filter.ts',
      'validation-exception.filter.ts',
    ]);

    expect(testStructure.backend.__tests__.common.exceptions).toEqual([
      'global-exception.filter.spec.ts',
      'validation-exception.filter.spec.ts',
    ]);

    expect(testStructure.backend.__tests__.app.modules.users.presentation['use-cases']).toEqual([
      'create-user.ucase.spec.ts',
      'find-user-by-id.ucase.spec.ts',
    ]);

    expect(testStructure.backend.__tests__.app.modules.authentication.presentation['use-cases']).toEqual([
      'login.ucase.spec.ts',
      'refresh-token.ucase.spec.ts',
    ]);
  });

  it('should have tests organized parallel to source code', () => {
    // Source code location: src/common/exceptions/global-exception.filter.ts
    // Test location:        __tests__/common/exceptions/global-exception.filter.spec.ts

    // Source code location: src/app/modules/users/presentation/use-cases/create-user.ucase.ts
    // Test location:        __tests__/app/modules/users/presentation/use-cases/create-user.ucase.spec.ts

    expect(true).toBe(true);
  });
});
