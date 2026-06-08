import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const vue = (await import('@vitejs/plugin-vue')).default
  return {
    plugins: [vue()],
    test: {
      environment: 'happy-dom',
      globals: true,
      include: ['tests/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['src/**'],
        thresholds: { lines: 80 },
      },
    },
  }
})
