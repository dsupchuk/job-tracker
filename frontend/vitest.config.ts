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
  },
})
