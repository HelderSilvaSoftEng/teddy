/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend',
  resolve: {
    alias: {
      '@teddy-challenger/frontend/domain': path.resolve(__dirname, 'src/domain/index.ts'),
      '@teddy-challenger/frontend/application': path.resolve(__dirname, 'src/application/index.ts'),
      '@teddy-challenger/frontend/infra': path.resolve(__dirname, 'src/infra/index.ts'),
      '@teddy-challenger/frontend/presentation': path.resolve(__dirname, 'src/presentation/index.ts'),
      '@teddy-challenger/frontend/adapters': path.resolve(__dirname, 'src/adapters/index.ts'),
    },
  },
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: 'frontend',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
