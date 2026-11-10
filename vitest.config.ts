import { defineConfig } from 'vitest/config';

// Opening-hours tests use local wall-clock times; pin the zone for stable results.
process.env.TZ = 'Europe/Berlin';

export default defineConfig({
  test: { include: ['tests/**/*.test.ts'] },
});
