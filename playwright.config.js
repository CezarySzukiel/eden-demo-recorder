const { defineConfig } = require('playwright/test');

module.exports = defineConfig({
  testDir: './src',
  timeout: 180000,
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: process.env.EDEN_BASE_URL || 'http://127.0.0.1:8000/eden',
    browserName: 'chromium',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
