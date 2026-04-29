const { expect } = require('playwright/test');
const {
  DEFAULT_CAPTION_DELAY_MS,
  describeOnly,
  navigateViaHref,
} = require('./eden-demo');

async function showPageStep(page, step, defaults = {}) {
  await navigateViaHref(page, step.href, step.description, {
    destination: step.destination,
    delay: step.delay ?? defaults.delay ?? DEFAULT_CAPTION_DELAY_MS,
  });
}

async function describeFormFields(page, fields, defaults = {}) {
  for (const field of fields) {
    await describeOnly(
      page.locator(field.selector),
      field.description,
      field.delay ?? defaults.delay,
    );
  }
}

async function showCreateFormStep(page, step, defaults = {}) {
  await showPageStep(page, {
    href: step.sectionHref,
    description: step.sectionDescription,
    delay: step.sectionDelay,
  }, defaults);
  await showPageStep(page, {
    href: step.createHref,
    description: step.createDescription,
    delay: step.createDelay,
  }, defaults);
  await expect(page.locator(step.firstFieldSelector)).toBeVisible();
  await describeFormFields(page, step.fields, defaults);
}

module.exports = {
  describeFormFields,
  showCreateFormStep,
  showPageStep,
};
