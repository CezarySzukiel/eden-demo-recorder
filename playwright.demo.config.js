const { defineConfig } = require('playwright/test');
const { RECORDING_VIEWPORT } = require('./src/helpers/recording-size');

module.exports = defineConfig({
  testDir: './src/recordings',
  timeout: 1800000,
  outputDir: 'artifacts/playwright-output',
  reporter: [['list']],
  use: {
    baseURL: process.env.EDEN_BASE_URL || 'http://127.0.0.1:8000/eden',
    browserName: 'chromium',
    headless: false,
    viewport: RECORDING_VIEWPORT,
    launchOptions: {
      slowMo: 600,
    },
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
});
