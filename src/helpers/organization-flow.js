const { expect } = require('playwright/test');
const {
  clearDemoCaption,
  describeAndClick,
  describeAndFill,
  describeAndSelect,
  describeOnly,
  describeOnlyIfVisible,
  navigateViaHref,
  saveForm,
} = require('./eden-demo');

async function openCreateForm(page, section) {
  const createLink = page.locator(`a[href="${section.createHref}"]`).first();

  await navigateViaHref(page, section.sectionHref, section.sectionDescription, {
    destination: createLink,
  });

  await navigateViaHref(page, section.createHref, section.createDescription, {
    destination: page.locator('h2').first(),
  });
}

async function runDescribedField(page, step) {
  const locator = page.locator(step.selector);

  if (step.action === 'describe') {
    if (step.ifVisible) {
      await describeOnlyIfVisible(locator, step.description, step.delay);
      return;
    }
    await describeOnly(locator, step.description, step.delay);
    return;
  }

  if (step.action === 'fill') {
    await describeAndFill(locator, step.description, step.value);
    return;
  }

  if (step.action === 'click') {
    await describeAndClick(locator, step.description);
    return;
  }

  if (step.action === 'select') {
    await describeAndSelect(locator, step.description, step.value, step.match);
    return;
  }

  throw new Error(`Unsupported recording field action: ${step.action}`);
}

async function runRecordPlan(page, plan, options = {}) {
  if (options.useMenuNavigation) {
    await openCreateForm(page, plan.section);
  } else {
    await page.goto(plan.directHref, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  }

  await expect(page.locator(plan.firstSelector)).toBeVisible();

  for (const step of plan.fields) {
    await runDescribedField(page, step);
  }

  await saveForm(page);
  await clearDemoCaption(page);
  await expect(page.getByRole('cell', { name: plan.resultCellName }).first()).toBeVisible();
}

async function createOrganization(page, plan, options = {}) {
  await runRecordPlan(page, plan, options);
}

async function createOffice(page, plan, options = {}) {
  await runRecordPlan(page, plan, options);
}

async function createFacility(page, plan, options = {}) {
  await runRecordPlan(page, plan, options);
}

module.exports = {
  createFacility,
  createOffice,
  createOrganization,
  openCreateForm,
  runDescribedField,
  runRecordPlan,
};
