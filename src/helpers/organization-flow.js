/**
 * @fileoverview Organization module workflow functions for demo recordings.
 *
 * Provides functions for creating organizations, offices, and facilities
 * with narrated field descriptions for demo videos.
 */

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

/**
 * Opens a create form by navigating through section page.
 *
 * Navigates to the section list page, then to the create form page,
 * showing captions for each navigation step.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} section - Section configuration.
 * @param {string} section.sectionHref - Href to section list page.
 * @param {string} section.sectionDescription - Caption for section page.
 * @param {string} section.createHref - Href to create form page.
 * @param {string} section.createDescription - Caption for create form.
 * @returns {Promise<void>}
 *
 * @example
 * await openCreateForm(page, {
 *   sectionHref: '/eden/org/organisation',
 *   sectionDescription: 'Organizations section',
 *   createHref: '/eden/org/organisation/create',
 *   createDescription: 'Create new organization'
 * });
 */
async function openCreateForm(page, section) {
  const createLink = page.locator(`a[href="${section.createHref}"]`).first();

  await navigateViaHref(page, section.sectionHref, section.sectionDescription, {
    destination: createLink,
  });

  await navigateViaHref(page, section.createHref, section.createDescription, {
    destination: page.locator('h2').first(),
  });
}

/**
 * Runs a single field interaction step with description.
 *
 * Executes the appropriate action (describe, fill, select, click) for a form
 * field based on the step configuration. Supports conditional visibility checks.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} step - Field step configuration.
 * @param {string} step.action - Action type: 'describe', 'fill', 'select', 'click'.
 * @param {string} step.selector - CSS selector for the field.
 * @param {string} step.description - Caption text for the field.
 * @param {string} [step.value] - Value to fill or select (for fill/select actions).
 * @param {string} [step.match] - Match mode for select: 'exact' or 'contains'.
 * @param {string} [step.fallbackSelect] - Fallback behavior: 'firstAvailable', 'skip', etc.
 * @param {boolean} [step.ifVisible] - Only describe if field is visible (for describe action).
 * @param {boolean} [step.closeAutocomplete] - Pick/dismiss autocomplete suggestions after filling.
 * @param {number} [step.delay] - Caption display duration.
 * @returns {Promise<void>}
 * @throws {Error} If action type is not supported.
 *
 * @example
 * await runDescribedField(page, {
 *   action: 'fill',
 *   selector: '#org_organisation_name',
 *   description: 'Organization name',
 *   value: 'Test Organization'
 * });
 */
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
    await describeAndFill(locator, step.description, step.value, {
      closeAutocomplete: step.closeAutocomplete,
    });
    return;
  }

  if (step.action === 'click') {
    await describeAndClick(locator, step.description);
    return;
  }

  if (step.action === 'select') {
    await describeAndSelect(locator, step.description, step.value, step.match, step.fallbackSelect);
    return;
  }

  throw new Error(`Unsupported recording field action: ${step.action}`);
}

/**
 * Executes a complete record creation plan.
 *
 * Navigates to the create form (via menu or direct), fills all fields with
 * descriptions, saves the form, and verifies the record appears in the list.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} plan - Record creation plan.
 * @param {Object} [plan.section] - Section navigation config (if useMenuNavigation).
 * @param {string} plan.directHref - Direct URL to create form.
 * @param {string} plan.firstSelector - Selector for first form field.
 * @param {Array<Object>} plan.fields - Array of field step configurations.
 * @param {string} plan.resultCellName - Text to verify in result table cell.
 * @param {Object} [options={}] - Execution options.
 * @param {boolean} [options.useMenuNavigation=false] - Navigate via menu instead of direct URL.
 * @returns {Promise<void>}
 *
 * @example
 * await runRecordPlan(page, {
 *   section: { sectionHref: '/eden/org/organisation', ... },
 *   directHref: '/eden/org/organisation/create',
 *   firstSelector: '#org_organisation_name',
 *   fields: [...],
 *   resultCellName: 'Test Organization'
 * }, { useMenuNavigation: true });
 */
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

/**
 * Creates an organization record with narrated field descriptions.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} plan - Organization creation plan (see runRecordPlan).
 * @param {Object} [options={}] - Execution options (see runRecordPlan).
 * @returns {Promise<void>}
 *
 * @example
 * const plan = buildOrganizationRecord(locale, content);
 * await createOrganization(page, plan, { useMenuNavigation: true });
 */
async function createOrganization(page, plan, options = {}) {
  await runRecordPlan(page, plan, options);
}

/**
 * Creates an office record with narrated field descriptions.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} plan - Office creation plan (see runRecordPlan).
 * @param {Object} [options={}] - Execution options (see runRecordPlan).
 * @returns {Promise<void>}
 *
 * @example
 * const plan = buildOfficeRecord(locale, content);
 * await createOffice(page, plan, { useMenuNavigation: true });
 */
async function createOffice(page, plan, options = {}) {
  await runRecordPlan(page, plan, options);
}

/**
 * Creates a facility record with narrated field descriptions.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} plan - Facility creation plan (see runRecordPlan).
 * @param {Object} [options={}] - Execution options (see runRecordPlan).
 * @returns {Promise<void>}
 *
 * @example
 * const plan = buildFacilityRecord(locale, content);
 * await createFacility(page, plan, { useMenuNavigation: true });
 */
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
