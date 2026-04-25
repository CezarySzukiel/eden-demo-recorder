const { expect } = require('playwright/test');

const ACTION_DELAY_MS = Number(process.env.EDEN_ACTION_DELAY_MS || 700);
const TYPE_DELAY_MS = Number(process.env.EDEN_TYPE_DELAY_MS || 90);
const USER_PASSWORD = process.env.EDEN_TEST_PASSWORD || 'CodexTest123!';

function buildDemoContent(prefix = 'demo') {
  const stamp = Date.now().toString(36);
  const suffix = `${prefix}-${stamp}`;
  return {
    suffix,
    organizationName: `Demo NGO Aid Network ${suffix}`,
    officeName: `Warsaw Office ${suffix}`,
    facilityName: `Distribution Point ${suffix}`,
    resourceTypeName: `Blankets ${suffix}`,
  };
}

async function enableDemoCursor(page) {
  await page.addInitScript(() => {
    if (window.__edenDemoCursorInstalled) {
      return;
    }
    window.__edenDemoCursorInstalled = true;

    const installCursor = () => {
      if (document.getElementById('eden-demo-cursor')) {
        return;
      }

      const style = document.createElement('style');
      style.id = 'eden-demo-cursor-style';
      style.textContent = `
        #eden-demo-cursor {
          position: fixed;
          left: 0;
          top: 0;
          width: 18px;
          height: 18px;
          border: 3px solid #111;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.75);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.65);
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 2147483647;
          transition: left 0.12s ease-out, top 0.12s ease-out, transform 0.12s ease-out, background 0.12s ease-out;
        }
        #eden-demo-cursor.eden-demo-cursor-click {
          transform: translate(-50%, -50%) scale(0.82);
          background: rgba(255, 196, 0, 0.9);
        }
      `;
      document.documentElement.appendChild(style);

      const cursor = document.createElement('div');
      cursor.id = 'eden-demo-cursor';
      document.documentElement.appendChild(cursor);

      window.__edenDemoCursorMove = (x, y) => {
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
      };

      window.__edenDemoCursorClick = () => {
        cursor.classList.add('eden-demo-cursor-click');
        window.setTimeout(() => cursor.classList.remove('eden-demo-cursor-click'), 180);
      };
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', installCursor, { once: true });
    } else {
      installCursor();
    }
  });
}

async function moveDemoCursor(locator) {
  const page = locator.page();
  const box = await locator.boundingBox();
  if (!box) {
    return;
  }

  const targetX = box.x + Math.min(box.width / 2, 24);
  const targetY = box.y + Math.min(box.height / 2, 16);

  await page.mouse.move(targetX, targetY, { steps: 18 });
  await page.evaluate(
    ([x, y]) => {
      if (window.__edenDemoCursorMove) {
        window.__edenDemoCursorMove(x, y);
      }
    },
    [targetX, targetY],
  );
  await page.waitForTimeout(200);
}

function buildUser() {
  const stamp = Date.now();
  return {
    firstName: 'Demo',
    lastName: 'Automation',
    email: `codex+${stamp}@example.com`,
    password: USER_PASSWORD,
  };
}

async function pacedClick(locator) {
  await locator.waitFor({ state: 'visible' });
  await moveDemoCursor(locator);
  await locator.click();
  await locator.page().evaluate(() => {
    if (window.__edenDemoCursorClick) {
      window.__edenDemoCursorClick();
    }
  });
  await locator.page().waitForTimeout(ACTION_DELAY_MS);
}

async function pacedFill(locator, value) {
  await locator.waitFor({ state: 'visible' });
  await moveDemoCursor(locator);
  await locator.click();
  await locator.page().evaluate(() => {
    if (window.__edenDemoCursorClick) {
      window.__edenDemoCursorClick();
    }
  });
  await locator.press('ControlOrMeta+A');
  await locator.press('Backspace');
  await locator.page().keyboard.type(value, { delay: TYPE_DELAY_MS });
  await locator.page().waitForTimeout(ACTION_DELAY_MS);
}

async function pacedSelect(locator, value) {
  await locator.waitFor({ state: 'visible' });
  await moveDemoCursor(locator);
  await locator.selectOption(value);
  await locator.page().waitForTimeout(ACTION_DELAY_MS);
}

async function saveForm(page) {
  await pacedClick(page.locator('input[type="submit"][value="Save"]').first());
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ACTION_DELAY_MS);
}

async function registerUser(page, user) {
  await page.goto('/eden/default/user/register', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#auth_user_first_name')).toBeVisible();

  await pacedFill(page.locator('#auth_user_first_name'), user.firstName);
  await pacedFill(page.locator('#auth_user_last_name'), user.lastName);
  await pacedFill(page.locator('#auth_user_email'), user.email);
  await pacedFill(page.locator('#auth_user_password'), user.password);
  await pacedFill(page.locator('#auth_user_password_two'), user.password);
  await pacedSelect(page.locator('#auth_user_language'), { label: 'English' });
  await pacedClick(page.locator('input[type="submit"][value="Register"]'));

  await expect(page.getByText('Registration successful')).toBeVisible();
  await expect(page.getByText('Email verified - you can now login')).toBeVisible();
}

async function loginUser(page, user) {
  await expect(page.locator('#auth_user_email')).toBeVisible();
  await pacedFill(page.locator('#auth_user_email'), user.email);
  await pacedFill(page.locator('#auth_user_password'), user.password);
  await pacedClick(page.locator('input[type="submit"][value="Login"]'));

  await expect(page).toHaveURL(/\/eden\/default\/index$/);
  await expect(page.getByRole('menuitem', { name: 'Organizations' })).toBeVisible();
}

async function openOrganizations(page) {
  await pacedClick(page.getByRole('menuitem', { name: 'Organizations' }));
  await expect(page).toHaveURL(/\/eden\/org\/index$/);
  await expect(page.getByRole('heading', { name: 'Organizations' })).toBeVisible();
}

async function openCreateFormFromOptions(page, sectionName) {
  const sectionConfig = {
    Organizations: {
      sectionHref: '/eden/org/organisation',
      createHref: '/eden/org/organisation/create',
    },
    Offices: {
      sectionHref: '/eden/org/office',
      createHref: '/eden/org/office/create',
    },
    Facilities: {
      sectionHref: '/eden/org/facility',
      createHref: '/eden/org/facility/create',
    },
  }[sectionName];

  if (!sectionConfig) {
    throw new Error(`Unsupported section for menu navigation: ${sectionName}`);
  }

  const sectionLink = page.locator(`a[href="${sectionConfig.sectionHref}"]`).first();
  const createLink = page.locator(`a[href="${sectionConfig.createHref}"]`).first();

  await expect(sectionLink).toBeVisible();
  await pacedClick(sectionLink);
  await expect(createLink).toBeVisible();
  await pacedClick(createLink);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ACTION_DELAY_MS);
}

async function createOrganization(page, name, options = {}) {
  if (options.useMenuNavigation) {
    await openCreateFormFromOptions(page, 'Organizations');
  } else {
    await page.goto('/eden/org/organisation/create', { waitUntil: 'domcontentloaded' });
  }
  await expect(page.locator('#org_organisation_name')).toBeVisible();

  await pacedFill(page.locator('#org_organisation_name'), name);
  await pacedClick(page.locator('#link_defaultorganisation_type_ms'));
  await pacedClick(page.locator('label[for="ui-multiselect-0-link_defaultorganisation_type-option-6"]'));
  await pacedSelect(page.locator('#org_organisation_country'), { label: 'Poland' });
  await saveForm(page);

  await expect(page.getByRole('cell', { name }).first()).toBeVisible();
}

async function createOffice(page, organizationName, officeName = 'Warsaw Office', options = {}) {
  if (options.useMenuNavigation) {
    await openCreateFormFromOptions(page, 'Offices');
  } else {
    await page.goto('/eden/org/office/create', { waitUntil: 'domcontentloaded' });
  }
  await expect(page.locator('#org_office_name')).toBeVisible();

  await pacedFill(page.locator('#org_office_name'), officeName);
  await pacedSelect(page.locator('#org_office_organisation_id'), { label: organizationName });
  await pacedSelect(page.locator('#org_office_location_id_L0'), { label: 'Poland' });
  await saveForm(page);

  await expect(page.getByRole('cell', { name: officeName }).first()).toBeVisible();
}

async function createFacility(page, organizationName, facilityName = 'Distribution Point', options = {}) {
  if (options.useMenuNavigation) {
    await openCreateFormFromOptions(page, 'Facilities');
  } else {
    await page.goto('/eden/org/facility/create', { waitUntil: 'domcontentloaded' });
  }
  await expect(page.locator('#org_facility_name')).toBeVisible();

  await pacedFill(page.locator('#org_facility_name'), facilityName);
  await pacedSelect(page.locator('#org_facility_organisation_id'), { label: organizationName });
  await pacedSelect(page.locator('#org_facility_location_id_L0'), { label: 'Poland' });
  await saveForm(page);

  await expect(page.getByRole('cell', { name: facilityName }).first()).toBeVisible();
}

module.exports = {
  ACTION_DELAY_MS,
  TYPE_DELAY_MS,
  buildDemoContent,
  buildUser,
  createFacility,
  createOffice,
  createOrganization,
  enableDemoCursor,
  loginUser,
  openOrganizations,
  registerUser,
};
