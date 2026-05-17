/**
 * @fileoverview High-level recording step functions for demo scenarios.
 *
 * Provides reusable functions for common recording patterns like navigating
 * to pages, describing form fields, and showing create form workflows.
 */

const { expect } = require('playwright/test');
const {
  DEFAULT_CAPTION_DELAY_MS,
  navigateViaHref,
} = require('./eden-demo');
const { runDescribedField } = require('./organization-flow');

/**
 * Navigates to a page and shows a caption.
 *
 * Wrapper around navigateViaHref that accepts a step configuration object
 * with optional defaults for delay timing.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} step - Step configuration.
 * @param {string|string[]} step.href - Target href or array of alternatives.
 * @param {string} step.description - Caption text to display.
 * @param {import('playwright').Locator} [step.destination] - Element to wait for.
 * @param {number} [step.delay] - Caption display duration.
 * @param {Object} [defaults={}] - Default values.
 * @param {number} [defaults.delay] - Default caption delay if not in step.
 * @returns {Promise<void>}
 *
 * @example
 * await showPageStep(page, {
 *   href: '/eden/inv/warehouse',
 *   description: 'Opening warehouses section'
 * }, { delay: 2000 });
 */
async function showPageStep(page, step, defaults = {}) {
  await navigateViaHref(page, step.href, step.description, {
    destination: step.destination,
    delay: step.delay ?? defaults.delay ?? DEFAULT_CAPTION_DELAY_MS,
  });
}

/**
 * Describes and optionally interacts with multiple form fields.
 *
 * Iterates through an array of field configurations, running the appropriate
 * action (describe, fill, select, click) for each field.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Array<Object>} fields - Array of field configurations.
 * @param {string} fields[].action - Action type: 'describe', 'fill', 'select', 'click'.
 * @param {string} fields[].selector - CSS selector for the field.
 * @param {string} fields[].description - Caption text for the field.
 * @param {string} [fields[].value] - Value to fill or select.
 * @param {string} [fields[].match] - Match mode for select: 'exact' or 'contains'.
 * @param {string} [fields[].fallbackSelect] - Fallback behavior for select.
 * @param {boolean} [fields[].ifVisible] - Only describe if field is visible.
 * @param {number} [fields[].delay] - Caption delay for this field.
 * @param {Object} [defaults={}] - Default values.
 * @param {number} [defaults.delay] - Default caption delay.
 * @returns {Promise<void>}
 *
 * @example
 * await describeFormFields(page, [
 *   { action: 'fill', selector: '#name', description: 'Enter name', value: 'Test' },
 *   { action: 'select', selector: '#country', description: 'Select country', value: 'Poland' }
 * ]);
 */
async function describeFormFields(page, fields, defaults = {}) {
  for (const field of fields) {
    await runDescribedField(page, {
      action: field.action ?? 'describe',
      selector: field.selector,
      description: field.description,
      value: field.value,
      match: field.match,
      fallbackSelect: field.fallbackSelect,
      ifVisible: field.ifVisible,
      delay: field.delay ?? defaults.delay,
    });
  }
}

/**
 * Shows a complete create form workflow with section and create navigation.
 *
 * This function handles the common pattern of:
 * 1. Navigate to section page (e.g., /eden/org/organisation)
 * 2. Navigate to create form (e.g., /eden/org/organisation/create)
 * 3. Wait for first field to be visible
 * 4. Describe all form fields
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} step - Create form step configuration.
 * @param {string} step.sectionHref - Href to section list page.
 * @param {string} step.sectionDescription - Caption for section page.
 * @param {number} [step.sectionDelay] - Caption delay for section page.
 * @param {string} step.createHref - Href to create form page.
 * @param {string} step.createDescription - Caption for create form.
 * @param {number} [step.createDelay] - Caption delay for create form.
 * @param {string} step.firstFieldSelector - Selector for first form field to wait for.
 * @param {Array<Object>} step.fields - Array of field configurations.
 * @param {Object} [defaults={}] - Default values.
 * @param {number} [defaults.delay] - Default caption delay.
 * @returns {Promise<void>}
 *
 * @example
 * await showCreateFormStep(page, {
 *   sectionHref: '/eden/org/organisation',
 *   sectionDescription: 'Organizations section',
 *   createHref: '/eden/org/organisation/create',
 *   createDescription: 'Create new organization',
 *   firstFieldSelector: '#org_organisation_name',
 *   fields: [
 *     { action: 'fill', selector: '#org_organisation_name', description: 'Name', value: 'Test Org' }
 *   ]
 * }, { delay: 2000 });
 */
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
