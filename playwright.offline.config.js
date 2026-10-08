import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/offline',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4174/focus-frog/', headless: true },
  webServer: { command: 'node scripts/serve-dist.mjs', url: 'http://127.0.0.1:4174/focus-frog/', reuseExistingServer: false },
});
