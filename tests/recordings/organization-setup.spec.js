const path = require('path');
const { test } = require('playwright/test');
const {
  buildDemoContent,
  buildUser,
  createFacility,
  createOffice,
  createOrganization,
  enableDemoCursor,
  loginUser,
  openOrganizations,
  registerUser,
} = require('../helpers/eden-demo');

test('records organization setup scenario', async ({ browser, baseURL }) => {
  const user = buildUser();
  const content = buildDemoContent('org');
  const setupContext = await browser.newContext({ baseURL });
  const setupPage = await setupContext.newPage();

  await registerUser(setupPage, user);
  await loginUser(setupPage, user);
  await openOrganizations(setupPage);

  const storageState = await setupContext.storageState();
  await setupContext.close();

  const recordedContext = await browser.newContext({
    baseURL,
    storageState,
    viewport: { width: 1600, height: 900 },
    recordVideo: {
      dir: path.join(process.cwd(), 'artifacts/demo-results'),
      size: { width: 1600, height: 900 },
    },
  });
  const page = await recordedContext.newPage();

  await enableDemoCursor(page);
  await page.goto('/eden/org/index', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);

  await createOrganization(page, content.organizationName, { useMenuNavigation: true });
  await createOffice(page, content.organizationName, content.officeName, { useMenuNavigation: true });
  await createFacility(page, content.organizationName, content.facilityName, { useMenuNavigation: true });

  await page.waitForTimeout(1500);
  await recordedContext.close();
});
