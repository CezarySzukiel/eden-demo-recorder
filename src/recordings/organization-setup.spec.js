const path = require('path');
const { test } = require('playwright/test');
const locale = require('../locale/organizations/pl.json');
const { RECORDING_VIEWPORT } = require('../helpers/recording-size');
const { buildOrganizationSetupStory } = require('./organization-setup.story');
const {
  buildDemoContent,
  clearDemoCaption,
  enableDemoCaptions,
  enableDemoCursor,
  loadEnvCredentials,
  loginUser,
  openOrganizations,
  RECORDING_FINISH_DELAY_MS,
  saveRecordedVideo,
} = require('../helpers/eden-demo');
const {
  createFacility,
  createOffice,
  createOrganization,
} = require('../helpers/organization-flow');

test('records organization setup scenario', async ({ browser, baseURL }) => {
  const user = loadEnvCredentials();
  const content = buildDemoContent('org');
  const story = buildOrganizationSetupStory(locale, content);
  const setupContext = await browser.newContext({ baseURL });
  const setupPage = await setupContext.newPage();

  await loginUser(setupPage, user);
  await openOrganizations(setupPage);

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
  await page.goto('/eden/org/index', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  await createOrganization(page, story.organization, { useMenuNavigation: true });
  await createOffice(page, story.office, { useMenuNavigation: true });
  await createFacility(page, story.facility, { useMenuNavigation: true });

  await clearDemoCaption(page);
  await page.waitForTimeout(RECORDING_FINISH_DELAY_MS);
  await saveRecordedVideo(page, 'organization-setup.webm');
});
