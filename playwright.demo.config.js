const { defineConfig } = require('playwright/test');

module.exports = defineConfig({
  testDir: './tests/recordings',
  timeout: 180000,
  outputDir: 'artifacts/demo-results',
  reporter: [['list']],
  use: {
    baseURL: process.env.EDEN_BASE_URL || 'http://127.0.0.1:8000/eden',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1600, height: 900 },
    launchOptions: {
      slowMo: 600,
    },
    trace: 'off',
    screenshot: 'off',
    video: {
      mode: 'on',
      size: { width: 1600, height: 900 },
    },
  },
});
