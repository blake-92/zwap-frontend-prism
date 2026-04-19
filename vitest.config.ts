import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // Match Nuxt 4 alias: ~ → app/
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('.', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/unit/**/*.spec.ts', 'tests/component/**/*.spec.ts'],
    setupFiles: ['./tests/unit/helpers/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: [
        'app/utils/**/*.{js,ts}',
        'app/composables/**/*.{js,ts}',
        'app/stores/**/*.{js,ts}',
      ],
      exclude: [
        'app/utils/mockData.js', // data, not logic
        '**/*.d.ts',
        '**/node_modules/**',
      ],
      thresholds: {
        'app/utils/**': { statements: 80, branches: 75, functions: 80, lines: 80 },
        'app/composables/**': { statements: 80, branches: 75, functions: 80, lines: 80 },
        'app/stores/**': { statements: 75, branches: 70, functions: 75, lines: 75 },
      },
    },
  },
})
