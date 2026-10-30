import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,mjs}'],
    setupFiles: ['tests/setup.ts'],
    restoreMocks: true,
    fileParallelism: false,
  },
});
