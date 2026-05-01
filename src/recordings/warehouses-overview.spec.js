const path = require('path');
const { test } = require('playwright/test');
const { RECORDING_VIEWPORT } = require('../helpers/recording-size');
const {
  loadEnvCredentials,
  loginUser,
  RECORDING_FINISH_DELAY_MS,
  saveRecordedVideo,
} = require('../helpers/eden-demo');

const STEP_DELAY_MS = 3000;
const WAREHOUSES_OVERVIEW_LINKS = [
  '/eden/inv/warehouse',
  '/eden/inv/inv_item',
  '/eden/inv/inv_item/report',
  '/eden/inv/inv_item?report=mon',
  '/eden/inv/track_item?report=util',
  '/eden/inv/track_item?report=inc',
  '/eden/inv/track_item?report=rel',
  '/eden/inv/recv',
  '/eden/inv/send',
  '/eden/supply/distribution',
  '/eden/supply/item/summary',
  '/eden/supply/item_category',
  '/eden/inv/facility',
  '/eden/req/req',
];

test('records warehouses overview', async ({ browser, baseURL }) => {
  const user = loadEnvCredentials();
  const setupContext = await browser.newContext({ baseURL });
  const setupPage = await setupContext.newPage();

  await loginUser(setupPage, user);

  const storageState = await setupContext.storageState();
  await setupContext.close();

  const recordedContext = await browser.newContext({
    baseURL,
    storageState,
    viewport: RECORDING_VIEWPORT,
    recordVideo: {
      dir: path.join(process.cwd(), 'artifacts/demo-results'),
      size: RECORDING_VIEWPORT,
    },
  });
  const page = await recordedContext.newPage();

  await page.goto('/eden/inv/index', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  for (const href of WAREHOUSES_OVERVIEW_LINKS) {
    await page.goto(href, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(STEP_DELAY_MS);
  }

  await page.waitForTimeout(RECORDING_FINISH_DELAY_MS);
  await saveRecordedVideo(page, 'warehouses-overview.webm');
});
