import { defineConfig, devices } from '@playwright/test';

// Suite offline PWA: gira contro la BUILD di produzione (vite preview),
// non il dev server — il service worker si registra solo in PROD.
// Uso: npm run build && npm run test:e2e:offline
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/offline.spec.js',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 180_000,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
