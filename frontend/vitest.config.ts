import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // Tests import `describe`/`it`/`expect` explicitly — no ambient globals.
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // The Axios client builds its baseURL from this; MSW handlers match on it.
    env: { VITE_API_URL: 'http://localhost:8080' },
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      // Config, entry points and type-only files carry no logic to cover.
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.d.ts', '**/*.config.*', 'dist/**'],
    },
  },
})
