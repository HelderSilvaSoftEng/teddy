module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'coverage',
  testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
