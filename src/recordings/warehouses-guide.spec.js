const path = require('path');
const { test } = require('playwright/test');
const locale = require('../locale/warehouse/pl.json');
const { RECORDING_VIEWPORT } = require('../helpers/recording-size');
const { showPageStep } = require('../helpers/recording-steps');
const {
  clearDemoCaption,
  describeOnly,
  enableDemoCaptions,
  enableDemoCursor,
  loadEnvCredentials,
  loginUser,
  navigateViaTopMenu,
  RECORDING_FINISH_DELAY_MS,
  saveRecordedVideo,
  showStandaloneCaption,
} = require('../helpers/eden-demo');

const INTRO_CAPTION = locale.warehouses_intro_caption;

test('records warehouses guide', async ({ browser, baseURL }) => {
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

  await enableDemoCursor(page);
  await enableDemoCaptions(page);

  await page.goto('/eden/inv/index', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await showStandaloneCaption(page, INTRO_CAPTION, 12000);
  await describeOnly(
    page.locator('h1, h2').first(),
    locale.warehouses_why_module,
    3000,
  );
  await showStandaloneCaption(
    page,
    locale.warehouses_cycle_intro,
    3000,
  );

  await showPageStep(
    page,
    { href: '/eden/inv/warehouse_type', description: locale.warehouses_warehouse_types },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: '/eden/supply/catalog', description: locale.warehouses_catalogs },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: '/eden/supply/item_category', description: locale.warehouses_item_categories },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: ['/eden/supply/item/summary', '/eden/supply/item'], description: locale.warehouses_items },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: '/eden/inv/supplier', description: locale.warehouses_suppliers },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: '/eden/inv/warehouse', description: locale.warehouses_warehouses },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: '/eden/inv/recv', description: locale.warehouses_received_incoming_shipments },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: '/eden/req/req', description: locale.warehouses_requests },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: '/eden/req/commit', description: locale.warehouses_match_requests_commit },
    { delay: 1800 },
  );
  await navigateViaTopMenu(
    page,
    'Warehouses',
    locale.warehouses_top_menu_back_to_module,
    {
      destination: page.locator('a[href="/eden/inv/send"]').first(),
      delay: 1200,
    },
  );
  await showPageStep(
    page,
    { href: '/eden/inv/send', description: locale.warehouses_sent_shipments },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: '/eden/inv/recv', description: locale.warehouses_receive_other_side },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: '/eden/supply/distribution', description: locale.warehouses_distributions },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: '/eden/inv/adj', description: locale.warehouses_adjust_stock_levels },
    { delay: 1800 },
  );
  await showPageStep(
    page,
    { href: ['/eden/inv/inv_item/report', '/eden/inv/inv_item'], description: locale.warehouses_reports },
    { delay: 1800 },
  );
  await showStandaloneCaption(
    page,
    locale.warehouses_full_cycle_summary,
    3000,
  );

  await clearDemoCaption(page);
  await page.waitForTimeout(RECORDING_FINISH_DELAY_MS);
  await saveRecordedVideo(page, 'warehouses-guide.webm');
});
