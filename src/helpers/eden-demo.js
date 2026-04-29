const { expect } = require('playwright/test');
const fs = require('fs');
const path = require('path');

const captionState = new WeakMap();

function parseEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const values = {};

  if (!fs.existsSync(envPath)) {
    return values;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    values[key] = value;
  }

  return values;
}

const ENV_VALUES = parseEnvFile();

function getEnvValue(name) {
  if (process.env[name] !== undefined) {
    return process.env[name];
  }
  return ENV_VALUES[name];
}

function getRequiredNumberEnv(name) {
  const rawValue = getEnvValue(name);
  const parsed = Number(rawValue);

  if (rawValue === undefined || Number.isNaN(parsed)) {
    throw new Error(`Missing numeric environment setting: ${name}`);
  }

  return parsed;
}

function getRequiredStringEnv(name) {
  const value = getEnvValue(name);
  if (!value) {
    throw new Error(`Missing environment setting: ${name}`);
  }
  return value;
}

const ACTION_DELAY_MS = getRequiredNumberEnv('EDEN_ACTION_DELAY_MS');
const TYPE_DELAY_MS = getRequiredNumberEnv('EDEN_TYPE_DELAY_MS');
const SECONDS_PER_WORD = getRequiredNumberEnv('SECONDS_PER_WORD');
const MAX_SECONDS_PER_WRITING = getRequiredNumberEnv('MAX_SECONDS_PER_WRITING');
const MAX_CAPTION_DELAY_MS = Math.round(getRequiredNumberEnv('MAX_CAPTION_DELAY_MS'));
const CURSOR_MOVE_STEPS = getRequiredNumberEnv('EDEN_CURSOR_MOVE_STEPS');
const CURSOR_MOVE_SETTLE_MS = getRequiredNumberEnv('EDEN_CURSOR_MOVE_SETTLE_MS');
const NAVIGATION_CLICK_PAUSE_MS = getRequiredNumberEnv('EDEN_NAVIGATION_CLICK_PAUSE_MS');
const NAVIGATION_POST_CLICK_MS = getRequiredNumberEnv('EDEN_NAVIGATION_POST_CLICK_MS');
const CURSOR_CLICK_VISUAL_MS = getRequiredNumberEnv('EDEN_CURSOR_CLICK_VISUAL_MS');
const POST_CURSOR_CLICK_DELAY_MS = getRequiredNumberEnv('EDEN_POST_CURSOR_CLICK_DELAY_MS');
const DEFAULT_CAPTION_DELAY_MS = getRequiredNumberEnv('EDEN_DEFAULT_CAPTION_DELAY_MS');
const DEFAULT_HOVER_DELAY_MS = getRequiredNumberEnv('EDEN_DEFAULT_HOVER_DELAY_MS');
const OPTIONAL_HOVER_DELAY_MS = getRequiredNumberEnv('EDEN_OPTIONAL_HOVER_DELAY_MS');
const OPTIONAL_HOVER_WAIT_TIMEOUT_MS = getRequiredNumberEnv('EDEN_OPTIONAL_HOVER_WAIT_TIMEOUT_MS');
const FIELD_WAIT_TIMEOUT_MS = getRequiredNumberEnv('EDEN_FIELD_WAIT_TIMEOUT_MS');
const NAVIGATION_WAIT_TIMEOUT_MS = getRequiredNumberEnv('EDEN_NAVIGATION_WAIT_TIMEOUT_MS');
const NAVIGATION_DESTINATION_TIMEOUT_MS = getRequiredNumberEnv('EDEN_NAVIGATION_DESTINATION_TIMEOUT_MS');
const RECORDING_FINISH_DELAY_MS = getRequiredNumberEnv('EDEN_RECORDING_FINISH_DELAY_MS');
const USER_PASSWORD = getRequiredStringEnv('EDEN_TEST_PASSWORD');

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
  await page.addInitScript((cursorClickVisualMs) => {
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
          transition: transform 0.12s ease-out, background 0.12s ease-out;
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

      document.addEventListener('mousemove', (event) => {
        window.__edenDemoCursorMove(event.clientX, event.clientY);
      });

      window.__edenDemoCursorClick = () => {
        cursor.classList.add('eden-demo-cursor-click');
        window.setTimeout(() => cursor.classList.remove('eden-demo-cursor-click'), cursorClickVisualMs);
      };
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', installCursor, { once: true });
    } else {
      installCursor();
    }
  }, CURSOR_CLICK_VISUAL_MS);
}

async function enableDemoCaptions(page) {
  await page.addInitScript(() => {
    if (window.__edenDemoCaptionsInstalled) {
      return;
    }
    window.__edenDemoCaptionsInstalled = true;

    const installCaptions = () => {
      if (document.getElementById('eden-demo-caption')) {
        return;
      }

      const style = document.createElement('style');
      style.id = 'eden-demo-caption-style';
      style.textContent = `
        #eden-demo-caption {
          position: fixed;
          left: 50%;
          bottom: 24px;
          transform: translateX(-50%);
          max-width: min(1100px, calc(100vw - 64px));
          padding: 14px 18px;
          border-radius: 14px;
          background: rgba(17, 24, 39, 0.92);
          color: #fff;
          font: 600 20px/1.4 Arial, sans-serif;
          letter-spacing: 0.01em;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28);
          z-index: 2147483646;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.18s ease-out;
        }
        #eden-demo-caption.eden-demo-caption-visible {
          opacity: 1;
        }
      `;
      document.documentElement.appendChild(style);

      const caption = document.createElement('div');
      caption.id = 'eden-demo-caption';
      document.documentElement.appendChild(caption);

      window.__edenDemoCaptionShow = (text) => {
        caption.replaceChildren();
        for (const [index, line] of text.split('\n').entries()) {
          if (index > 0) {
            caption.appendChild(document.createElement('br'));
          }
          caption.appendChild(document.createTextNode(line));
        }
        caption.classList.add('eden-demo-caption-visible');
      };

      window.__edenDemoCaptionHide = () => {
        caption.classList.remove('eden-demo-caption-visible');
      };
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', installCaptions, { once: true });
    } else {
      installCaptions();
    }
  });
}

async function moveDemoCursor(locator) {
  const page = locator.page();
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) {
    return null;
  }

  const targetX = box.x + Math.min(box.width / 2, 24);
  const targetY = box.y + Math.min(box.height / 2, 16);

  await page.mouse.move(targetX, targetY, { steps: CURSOR_MOVE_STEPS });
  await page.waitForTimeout(CURSOR_MOVE_SETTLE_MS);
  return { x: targetX, y: targetY };
}

function getCaptionMinimumDelay(text, fallback = DEFAULT_CAPTION_DELAY_MS) {
  const longWords = text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3);

  if (!longWords.length) {
    return fallback;
  }

  return Math.min(
    MAX_CAPTION_DELAY_MS,
    Math.max(fallback, longWords.length * SECONDS_PER_WORD * 1000)
  );
}

async function showDemoCaption(page, text) {
  await page.evaluate((value) => {
    if (window.__edenDemoCaptionShow) {
      window.__edenDemoCaptionShow(value);
    }
  }, text);
}

function beginCaption(page, text, delay = DEFAULT_CAPTION_DELAY_MS) {
  const state = {
    text,
    delay,
    startedAt: Date.now(),
  };
  captionState.set(page, state);
  return state;
}

async function waitForCaptionMinimum(page, captionOrText, delay = DEFAULT_CAPTION_DELAY_MS, startedAt = Date.now()) {
  const state = typeof captionOrText === 'string'
    ? { text: captionOrText, delay, startedAt }
    : captionOrText;

  const minimumDelay = getCaptionMinimumDelay(state.text, state.delay);
  const elapsed = Date.now() - state.startedAt;
  const remaining = minimumDelay - elapsed;
  if (remaining > 0) {
    await page.waitForTimeout(remaining);
  }
}

async function showCaption(page, text, delay = DEFAULT_CAPTION_DELAY_MS) {
  const state = beginCaption(page, text, delay);
  await showDemoCaption(page, text);
  return state;
}

async function holdCaption(page, caption) {
  await waitForCaptionMinimum(page, caption);
}

async function showStandaloneCaption(page, text, delay = DEFAULT_CAPTION_DELAY_MS) {
  const caption = await showCaption(page, text, delay);
  await holdCaption(page, caption);
}

async function showCaptionAfterNavigation(page, text, delay = DEFAULT_CAPTION_DELAY_MS) {
  const caption = await showCaption(page, text, delay);
  await holdCaption(page, caption);
}

async function runNavigationStep({ page, trigger, destination, description, delay = DEFAULT_CAPTION_DELAY_MS }) {
  await trigger.waitFor({ state: 'visible', timeout: NAVIGATION_WAIT_TIMEOUT_MS });
  const clickTarget = await moveDemoCursor(trigger);
  await page.waitForTimeout(NAVIGATION_CLICK_PAUSE_MS);
  await triggerDemoCursorClick(page);
  await page.waitForTimeout(NAVIGATION_POST_CLICK_MS);
  if (clickTarget) {
    await page.mouse.click(clickTarget.x, clickTarget.y);
  } else {
    await trigger.click();
  }

  if (destination) {
    await destination.waitFor({ state: 'visible', timeout: NAVIGATION_DESTINATION_TIMEOUT_MS });
  }
  await page.waitForLoadState('networkidle');
  await showCaptionAfterNavigation(page, description, delay);
}

async function navigateViaHref(page, href, description, options = {}) {
  const hrefs = Array.isArray(href) ? href : [href];
  let trigger = null;
  let chosenHref = hrefs[0];

  for (const candidate of hrefs) {
    const visibleTrigger = page.locator(`a[href="${candidate}"]:visible`).first();
    if (await visibleTrigger.count()) {
      trigger = visibleTrigger;
      chosenHref = candidate;
      break;
    }
    const anyTrigger = page.locator(`a[href="${candidate}"]`).first();
    if (await anyTrigger.count()) {
      trigger = anyTrigger;
      chosenHref = candidate;
      break;
    }
  }

  if (!trigger) {
    await page.goto(chosenHref, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await showCaptionAfterNavigation(page, description, options.delay ?? DEFAULT_CAPTION_DELAY_MS);
    return;
  }

  const destination = options.destination ?? page.locator('h1, h2').first();
  await runNavigationStep({
    page,
    trigger,
    destination,
    description,
    delay: options.delay ?? DEFAULT_CAPTION_DELAY_MS,
  });
}

async function navigateViaTopMenu(page, name, description, options = {}) {
  await runNavigationStep({
    page,
    trigger: page.getByRole('menuitem', { name }),
    destination: options.destination ?? page.locator('h1, h2').first(),
    description,
    delay: options.delay ?? DEFAULT_CAPTION_DELAY_MS,
  });
}

async function runHoverDescription(locator, description, delay = DEFAULT_HOVER_DELAY_MS, waitTimeout = FIELD_WAIT_TIMEOUT_MS) {
  const page = locator.page();
  await locator.waitFor({ state: 'visible', timeout: waitTimeout });
  await moveDemoCursor(locator);
  const caption = await showCaption(page, description, delay);
  await holdCaption(page, caption);
}

async function tryRunHoverDescription(locator, description, delay = OPTIONAL_HOVER_DELAY_MS, waitTimeout = OPTIONAL_HOVER_WAIT_TIMEOUT_MS) {
  try {
    await runHoverDescription(locator, description, delay, waitTimeout);
    return true;
  } catch (error) {
    return false;
  }
}

async function clearDemoCaption(page) {
  captionState.delete(page);
  await page.evaluate(() => {
    if (window.__edenDemoCaptionHide) {
      window.__edenDemoCaptionHide();
    }
  });
}

async function triggerDemoCursorClick(page) {
  await page.evaluate(() => {
    if (window.__edenDemoCursorClick) {
      window.__edenDemoCursorClick();
    }
  });
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

function loadEnvCredentials() {
  const email = getEnvValue('EMAIL');
  const password = getEnvValue('PASSWORD');

  if (!email || !password) {
    throw new Error('Missing EMAIL or PASSWORD in .env or environment variables');
  }

  return { email, password };
}

async function pacedClick(locator) {
  await locator.waitFor({ state: 'visible' });
  await moveDemoCursor(locator);
  await triggerDemoCursorClick(locator.page());
  await locator.page().waitForTimeout(POST_CURSOR_CLICK_DELAY_MS);
  await locator.click();
  await locator.page().waitForTimeout(ACTION_DELAY_MS);
}

async function pacedFill(locator, value) {
  await locator.waitFor({ state: 'visible' });
  await moveDemoCursor(locator);
  await triggerDemoCursorClick(locator.page());
  await locator.page().waitForTimeout(POST_CURSOR_CLICK_DELAY_MS);
  await locator.click();
  await locator.press('ControlOrMeta+A');
  await locator.press('Backspace');
  await locator.page().keyboard.type(value, { delay: TYPE_DELAY_MS });
  await locator.page().waitForTimeout(ACTION_DELAY_MS);
}

async function pacedSelect(locator, value) {
  await locator.waitFor({ state: 'visible' });
  await moveDemoCursor(locator);
  await triggerDemoCursorClick(locator.page());
  await locator.page().waitForTimeout(POST_CURSOR_CLICK_DELAY_MS);
  await locator.click();
  await locator.selectOption(value);
  await locator.page().waitForTimeout(ACTION_DELAY_MS);
}

async function selectOptionContainingText(locator, text) {
  const value = await locator.evaluate((select, matchText) => {
    const option = Array.from(select.options).find((entry) => entry.textContent.includes(matchText));
    return option ? option.value : null;
  }, text);

  if (!value) {
    throw new Error(`Could not find option containing text: ${text}`);
  }

  await locator.selectOption(value);
}

async function runFieldStep(locator, step) {
  const delay = step.captionDelay ?? DEFAULT_CAPTION_DELAY_MS;
  const page = locator.page();
  await locator.waitFor({ state: 'visible', timeout: step.waitTimeout ?? FIELD_WAIT_TIMEOUT_MS });
  await moveDemoCursor(locator);
  const caption = await showCaption(page, step.description, delay);

  if (step.action === 'hover') {
    await holdCaption(page, caption);
    return;
  }

  await triggerDemoCursorClick(locator.page());
  await locator.page().waitForTimeout(POST_CURSOR_CLICK_DELAY_MS);

  if (step.action === 'fill') {
    await locator.click();
    await locator.press('ControlOrMeta+A');
    await locator.press('Backspace');
    await locator.page().keyboard.type(step.value, { delay: TYPE_DELAY_MS });
    await locator.page().waitForTimeout(ACTION_DELAY_MS);
    await holdCaption(page, caption);
    return;
  }

  if (step.action === 'click') {
    await locator.click();
    await locator.page().waitForTimeout(ACTION_DELAY_MS);
    await holdCaption(page, caption);
    return;
  }

  if (step.action === 'select') {
    await locator.click();
    if (step.match === 'contains') {
      await selectOptionContainingText(locator, step.value);
    } else {
      await locator.selectOption(step.value);
    }
    await locator.page().waitForTimeout(ACTION_DELAY_MS);
    await holdCaption(page, caption);
    return;
  }

  throw new Error(`Unsupported field action: ${step.action}`);
}

async function describeAndFill(locator, description, value) {
  await runFieldStep(locator, { action: 'fill', description, value });
}

async function describeAndSelect(locator, description, value, match = 'exact') {
  await runFieldStep(locator, { action: 'select', description, value, match });
}

async function describeAndClick(locator, description) {
  await runFieldStep(locator, { action: 'click', description });
}

async function describeOnly(locator, description, delay = DEFAULT_HOVER_DELAY_MS) {
  await runHoverDescription(locator, description, delay);
}

async function describeOnlyIfVisible(locator, description, delay = OPTIONAL_HOVER_DELAY_MS, waitTimeout = OPTIONAL_HOVER_WAIT_TIMEOUT_MS) {
  await tryRunHoverDescription(locator, description, delay, waitTimeout);
}

async function saveForm(page) {
  await pacedClick(page.locator('input[type="submit"][value="Save"]').first());
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ACTION_DELAY_MS);
}

async function saveRecordedVideo(page, targetFileName) {
  const video = page.video();
  if (!video) {
    return null;
  }

  await page.context().close();

  const sourcePath = await video.path();
  const targetDir = path.join(process.cwd(), 'artifacts', 'demo-results');
  const targetPath = path.join(targetDir, targetFileName);

  fs.mkdirSync(targetDir, { recursive: true });
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
  }
  fs.renameSync(sourcePath, targetPath);

  return targetPath;
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
  await page.goto('/eden/default/user/login', { waitUntil: 'domcontentloaded' });
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

module.exports = {
  ACTION_DELAY_MS,
  CURSOR_CLICK_VISUAL_MS,
  CURSOR_MOVE_SETTLE_MS,
  CURSOR_MOVE_STEPS,
  DEFAULT_CAPTION_DELAY_MS,
  DEFAULT_HOVER_DELAY_MS,
  MAX_CAPTION_DELAY_MS,
  MAX_SECONDS_PER_WRITING,
  NAVIGATION_CLICK_PAUSE_MS,
  NAVIGATION_DESTINATION_TIMEOUT_MS,
  NAVIGATION_WAIT_TIMEOUT_MS,
  NAVIGATION_POST_CLICK_MS,
  OPTIONAL_HOVER_DELAY_MS,
  OPTIONAL_HOVER_WAIT_TIMEOUT_MS,
  POST_CURSOR_CLICK_DELAY_MS,
  RECORDING_FINISH_DELAY_MS,
  SECONDS_PER_WORD,
  TYPE_DELAY_MS,
  buildDemoContent,
  buildUser,
  clearDemoCaption,
  describeAndClick,
  describeAndFill,
  describeAndSelect,
  describeOnly,
  describeOnlyIfVisible,
  enableDemoCursor,
  enableDemoCaptions,
  loadEnvCredentials,
  loginUser,
  navigateViaTopMenu,
  navigateViaHref,
  openOrganizations,
  registerUser,
  showDemoCaption,
  saveForm,
  saveRecordedVideo,
  showStandaloneCaption,
};
