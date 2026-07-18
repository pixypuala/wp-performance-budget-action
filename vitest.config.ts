import { defineConfig } from 'vitest/config';

// Pure evaluation logic — the default Node environment is all we need.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
  },
});
