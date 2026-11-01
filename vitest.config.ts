import { defineConfig } from 'vitest/config'

// Configuración de pruebas separada de vite.config.ts: las pruebas no necesitan
// el plugin de React Compiler ni el proxy de desarrollo.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
