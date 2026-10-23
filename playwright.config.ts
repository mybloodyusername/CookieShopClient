import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:4200',
    channel: 'chrome',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 1 },
    },
  ],
  webServer: {
    command: 'pnpm start --host localhost --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
  },
});
