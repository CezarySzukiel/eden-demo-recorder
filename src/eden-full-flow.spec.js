const { test, expect } = require('playwright/test');
const { loadRecordingLocale } = require('./helpers/locale');
const { buildOrganizationSetupStory } = require('./recordings/organization-setup.story');
const {
  buildDemoContent,
  buildUser,
  loginUser,
  openOrganizations,
  registerUser,
} = require('./helpers/eden-demo');
const {
  createFacility,
  createOffice,
  createOrganization,
} = require('./helpers/organization-flow');

const { captions: locale, values } = loadRecordingLocale('organizations');

async function ensureResourceType(page, typeName) {
  await page.goto('/eden/org/resource/create', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#org_resource_parameter_id')).toBeVisible();

  const typeExists = await page.locator('#org_resource_parameter_id option', {
    hasText: typeName,
  }).count();

  if (typeExists > 0) {
    return;
  }

  await page.goto('/eden/org/resource_type/create', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#org_resource_type_name')).toBeVisible();
  await page.locator('#org_resource_type_name').fill(typeName);
  await page.waitForTimeout(700);
  await page.locator('input[type="submit"][value="Save"]').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);
  await expect(page.getByText('Resource Type added')).toBeVisible();

  await page.goto('/eden/org/resource/create', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#org_resource_parameter_id')).toBeVisible();
  await expect(page.locator('#org_resource_parameter_id option', { hasText: typeName })).toHaveCount(1);
}

async function createResource(page, content) {
  const resourceType = content.resourceTypeName;
  const quantity = content.resourceQuantity;
  await ensureResourceType(page, resourceType);

  await page.goto('/eden/org/resource/create', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#org_resource_parameter_id')).toBeVisible();

  await page.locator('#org_resource_organisation_id').selectOption({ label: content.organizationName });
  await page.waitForTimeout(700);
  await page.locator('#org_resource_location_id_L0').selectOption({ label: 'Poland' });
  await page.waitForTimeout(700);
  await page.locator('#org_resource_parameter_id').selectOption({ label: resourceType });
  await page.waitForTimeout(700);
  await page.locator('#org_resource_value').fill(quantity);
  await page.waitForTimeout(700);
  await page.locator('input[type="submit"][value="Save"]').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);

  await expect(page.getByText('Resource added')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Resource Details' })).toBeVisible();
  await expect(page.getByText(resourceType, { exact: true }).last()).toBeVisible();
  await expect(page.getByText(quantity, { exact: true }).last()).toBeVisible();
}

test('registers, logs in, navigates to Organizations, and creates core records', async ({ page }) => {
  const user = buildUser();
  const content = buildDemoContent('full', values);
  const story = buildOrganizationSetupStory(locale, content);

  await registerUser(page, user);
  await loginUser(page, user);
  await openOrganizations(page);
  await createOrganization(page, story.organization);
  await createOffice(page, story.office);
  await createFacility(page, story.facility);
  await createResource(page, content);
});
