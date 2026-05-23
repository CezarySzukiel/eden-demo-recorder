/**
 * @fileoverview Core demo automation helpers for Sahana Eden recordings.
 *
 * Provides functions for cursor animation, caption display, form interactions,
 * navigation, and video recording. All timing and animation parameters are
 * configurable via environment variables.
 */

const { expect } = require('playwright/test');
const fs = require('fs');
const path = require('path');
const {
  getEnvValue,
  getOptionalBooleanEnv,
  getRequiredNumberEnv,
  getRequiredStringEnv,
} = require('./env');

/**
 * WeakMap to track caption state per page for timing calculations.
 * @type {WeakMap<import('playwright').Page, Object>}
 */
const captionState = new WeakMap();

/**
 * Magic numbers used for cursor positioning and caption timing.
 */
const CURSOR_OFFSET_X = 24;
const CURSOR_OFFSET_Y = 16;
const MIN_WORD_LENGTH = 3;

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
const HIDE_DEMO_CAPTIONS = getOptionalBooleanEnv('EDEN_HIDE_CAPTIONS');

const DEFAULT_DEMO_CONTENT_TEMPLATES = {
  organizationName: 'Demo NGO Aid Network {suffix}',
  officeName: 'Warsaw Office {suffix}',
  facilityName: 'Distribution Point {suffix}',
  resourceTypeName: 'Blankets {suffix}',
};

function renderDemoValue(value, tokens) {
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (match, tokenName) => (
      tokens[tokenName] === undefined ? match : tokens[tokenName]
    ));
  }

  if (Array.isArray(value)) {
    return value.map((entry) => renderDemoValue(entry, tokens));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, renderDemoValue(entry, tokens)]),
    );
  }

  return value;
}

/**
 * Builds unique demo content with timestamp-based tokens.
 *
 * Generates unique names and values to avoid conflicts when running multiple
 * tests. Optional templates keep scenario data in values fixtures instead of
 * hardcoding it in story builders.
 *
 * @param {string} [prefix='demo'] - Prefix for the generated suffix.
 * @param {Object} [templates] - Template values using {suffix} and {runId}.
 * @returns {Object} Object containing rendered demo values.
 * @returns {string} return.runId - Timestamp token in base36.
 * @returns {string} return.suffix - Prefix plus runId.
 *
 * @example
 * const content = buildDemoContent('test', {
 *   organizationName: 'Demo NGO Aid Network {suffix}',
 *   organizationAcronym: 'DNA-{runId}',
 * });
 */
function buildDemoContent(prefix = 'demo', templates = DEFAULT_DEMO_CONTENT_TEMPLATES) {
  const stamp = Date.now().toString(36);
  const suffix = `${prefix}-${stamp}`;
  const tokens = {
    prefix,
    runId: stamp,
    suffix,
  };

  return {
    ...tokens,
    ...renderDemoValue(templates, tokens),
  };
}

/**
 * Enables custom demo cursor on the page.
 *
 * Injects client-side script that creates a custom cursor element
 * and exposes global functions for cursor movement and click animation.
 * Must be called before page navigation.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @returns {Promise<void>}
 *
 * @example
 * await enableDemoCursor(page);
 * await page.goto('/eden/org/index');
 */
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

/**
 * Enables custom demo captions on the page.
 *
 * Injects client-side script that creates a caption element at the bottom
 * of the page and exposes global functions for showing/hiding captions.
 * Must be called before page navigation.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} [options] - Caption rendering options.
 * @param {boolean} [options.hidden] - Keep caption timing but render captions transparent.
 * @returns {Promise<void>}
 *
 * @example
 * await enableDemoCaptions(page);
 * await page.goto('/eden/org/index');
 */
async function enableDemoCaptions(page, options = {}) {
  const hidden = options.hidden ?? HIDE_DEMO_CAPTIONS;

  await page.addInitScript((captionOptions) => {
    const hiddenCaptions = Boolean(captionOptions.hidden);

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
          opacity: ${hiddenCaptions ? 0 : 1};
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
  }, { hidden });
}

/**
 * Moves demo cursor to a locator's position.
 *
 * Scrolls the element into view, calculates target position (slightly offset
 * from center for better visual effect), and animates cursor movement.
 *
 * @param {import('playwright').Locator} locator - Target element locator.
 * @returns {Promise<{x: number, y: number}|null>} Cursor position or null if element has no bounding box.
 *
 * @example
 * const position = await moveDemoCursor(page.locator('#submit-button'));
 * if (position) {
 *   await page.mouse.click(position.x, position.y);
 * }
 */
async function moveDemoCursor(locator) {
  const page = locator.page();
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) {
    return null;
  }

  const targetX = box.x + Math.min(box.width / 2, CURSOR_OFFSET_X);
  const targetY = box.y + Math.min(box.height / 2, CURSOR_OFFSET_Y);

  await page.mouse.move(targetX, targetY, { steps: CURSOR_MOVE_STEPS });
  await page.waitForTimeout(CURSOR_MOVE_SETTLE_MS);
  return { x: targetX, y: targetY };
}

/**
 * Calculates minimum caption display time based on word count.
 *
 * Counts words longer than MIN_WORD_LENGTH characters and multiplies
 * by SECONDS_PER_WORD to ensure captions stay visible long enough to read.
 *
 * @param {string} text - Caption text to analyze.
 * @param {number} [fallback=DEFAULT_CAPTION_DELAY_MS] - Minimum delay if no long words.
 * @returns {number} Calculated delay in milliseconds, capped at MAX_CAPTION_DELAY_MS.
 *
 * @example
 * const delay = getCaptionMinimumDelay('This is a test caption');
 * // Returns: calculated delay based on word count
 */
function getCaptionMinimumDelay(text, fallback = DEFAULT_CAPTION_DELAY_MS) {
  const longWords = text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > MIN_WORD_LENGTH);

  if (!longWords.length) {
    return fallback;
  }

  return Math.min(
    MAX_CAPTION_DELAY_MS,
    Math.max(fallback, longWords.length * SECONDS_PER_WORD * 1000)
  );
}

/**
 * Shows demo caption by calling injected client-side function.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string} text - Caption text to display.
 * @returns {Promise<void>}
 *
 * @example
 * await showDemoCaption(page, 'Creating new organization');
 */
async function showDemoCaption(page, text) {
  await page.evaluate((value) => {
    if (window.__edenDemoCaptionShow) {
      window.__edenDemoCaptionShow(value);
    }
  }, text);
}

/**
 * Begins caption timing state for a page.
 *
 * Stores caption state in WeakMap for later timing calculations.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string} text - Caption text.
 * @param {number} [delay=DEFAULT_CAPTION_DELAY_MS] - Base delay duration.
 * @returns {Object} Caption state object with text, delay, and startedAt timestamp.
 */
function beginCaption(page, text, delay = DEFAULT_CAPTION_DELAY_MS) {
  const state = {
    text,
    delay,
    startedAt: Date.now(),
  };
  captionState.set(page, state);
  return state;
}

/**
 * Waits for minimum caption display time to elapse.
 *
 * Calculates remaining time based on word count and elapsed time,
 * then waits if necessary to ensure caption is visible long enough.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object|string} captionOrText - Caption state object or text string.
 * @param {number} [delay=DEFAULT_CAPTION_DELAY_MS] - Base delay if captionOrText is string.
 * @param {number} [startedAt=Date.now()] - Start timestamp if captionOrText is string.
 * @returns {Promise<void>}
 */
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

/**
 * Shows caption and returns state for later timing control.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string} text - Caption text to display.
 * @param {number} [delay=DEFAULT_CAPTION_DELAY_MS] - Base delay duration.
 * @returns {Promise<Object>} Caption state object.
 */
async function showCaption(page, text, delay = DEFAULT_CAPTION_DELAY_MS) {
  const state = beginCaption(page, text, delay);
  await showDemoCaption(page, text);
  return state;
}

/**
 * Waits for caption minimum display time.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} caption - Caption state object from showCaption().
 * @returns {Promise<void>}
 */
async function holdCaption(page, caption) {
  await waitForCaptionMinimum(page, caption);
}

/**
 * Shows caption and waits for minimum display time.
 *
 * Convenience function that combines showCaption() and holdCaption().
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string} text - Caption text to display.
 * @param {number} [delay=DEFAULT_CAPTION_DELAY_MS] - Base delay duration.
 * @returns {Promise<void>}
 *
 * @example
 * await showStandaloneCaption(page, 'Welcome to Warehouses module', 3000);
 */
async function showStandaloneCaption(page, text, delay = DEFAULT_CAPTION_DELAY_MS) {
  const caption = await showCaption(page, text, delay);
  await holdCaption(page, caption);
}

/**
 * Shows caption after navigation and waits for minimum display time.
 *
 * Alias for showStandaloneCaption() for semantic clarity in navigation contexts.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string} text - Caption text to display.
 * @param {number} [delay=DEFAULT_CAPTION_DELAY_MS] - Base delay duration.
 * @returns {Promise<void>}
 */
async function showCaptionAfterNavigation(page, text, delay = DEFAULT_CAPTION_DELAY_MS) {
  const caption = await showCaption(page, text, delay);
  await holdCaption(page, caption);
}

/**
 * Normalizes navigation target URL for comparison.
 *
 * Removes trailing slashes from pathname and extracts pathname + search.
 * Used to match hrefs that may differ in trailing slash formatting.
 *
 * @param {string} value - URL or href to normalize.
 * @returns {string|null} Normalized pathname+search or null if invalid.
 *
 * @example
 * normalizeNavigationTarget('/eden/org/organisation/');
 * // Returns: '/eden/org/organisation'
 */
function normalizeNavigationTarget(value) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value, 'http://example.invalid');
    const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
    const normalizedSearch = url.search || '';
    return `${normalizedPath}${normalizedSearch}`;
  } catch (error) {
    return null;
  }
}

/**
 * Finds visible link element matching one of the provided hrefs.
 *
 * First tries exact href match, then falls back to normalized pathname+search
 * comparison to handle trailing slash differences.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string[]} hrefs - Array of href values to search for.
 * @returns {Promise<import('playwright').Locator|null>} Matching link locator or null.
 *
 * @example
 * const trigger = await findVisibleHrefTrigger(page, [
 *   '/eden/org/organisation',
 *   '/eden/org/organisation/'
 * ]);
 */
async function findVisibleHrefTrigger(page, hrefs) {
  for (const candidate of hrefs) {
    const exactTrigger = page.locator(`a[href="${candidate}"]:visible`).first();
    if (await exactTrigger.count()) {
      return exactTrigger;
    }
  }

  const normalizedTargets = hrefs
    .map(normalizeNavigationTarget)
    .filter((value) => value);

  if (!normalizedTargets.length) {
    return null;
  }

  const visibleLinks = page.locator('a[href]:visible');
  const matchIndex = await visibleLinks.evaluateAll((elements, targets) => {
    // Inline normalization function for browser context
    function normalizeHref(value) {
      if (!value) {
        return null;
      }
      try {
        const url = new URL(value, 'http://example.invalid');
        const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
        const normalizedSearch = url.search || '';
        return `${normalizedPath}${normalizedSearch}`;
      } catch (error) {
        return null;
      }
    }

    return elements.findIndex((element) => {
      const hrefValue = element.getAttribute('href');
      const normalizedHref = normalizeHref(hrefValue);
      return normalizedHref ? targets.includes(normalizedHref) : false;
    });
  }, normalizedTargets);

  if (matchIndex !== -1) {
    return visibleLinks.nth(matchIndex);
  }

  return null;
}

/**
 * Navigates directly to URL without clicking a trigger element.
 *
 * Used as fallback when no visible navigation trigger is found.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string} href - Target URL to navigate to.
 * @param {string} description - Caption text to display after navigation.
 * @param {Object} [options={}] - Navigation options.
 * @param {import('playwright').Locator} [options.destination] - Element to wait for after navigation.
 * @param {number} [options.delay] - Caption display duration.
 * @returns {Promise<void>}
 */
async function navigateDirectly(page, href, description, options = {}) {
  await page.goto(href, { waitUntil: 'domcontentloaded' });

  if (options.destination) {
    await options.destination.waitFor({ state: 'visible', timeout: NAVIGATION_DESTINATION_TIMEOUT_MS });
  }

  await page.waitForLoadState('networkidle');
  if (description) {
    await showCaptionAfterNavigation(page, description, options.delay ?? DEFAULT_CAPTION_DELAY_MS);
    return;
  }

  await page.waitForTimeout(options.delay ?? DEFAULT_CAPTION_DELAY_MS);
}

/**
 * Executes a navigation step with cursor animation and caption.
 *
 * Moves cursor to trigger, shows click animation, clicks, waits for destination,
 * and displays caption.
 *
 * @param {Object} params - Navigation parameters.
 * @param {import('playwright').Page} params.page - The Playwright page object.
 * @param {import('playwright').Locator} params.trigger - Element to click for navigation.
 * @param {import('playwright').Locator} params.destination - Element to wait for after navigation.
 * @param {string} params.description - Caption text to display.
 * @param {number} [params.delay=DEFAULT_CAPTION_DELAY_MS] - Caption display duration.
 * @returns {Promise<void>}
 */
async function runNavigationStep({ page, trigger, destination, description, delay = DEFAULT_CAPTION_DELAY_MS }) {
  await trigger.waitFor({ state: 'visible', timeout: NAVIGATION_WAIT_TIMEOUT_MS });
  const clickTarget = await moveDemoCursor(trigger);
  await page.waitForTimeout(NAVIGATION_CLICK_PAUSE_MS);
  if (clickTarget) {
    await triggerDemoCursorClick(page);
    await page.mouse.click(clickTarget.x, clickTarget.y);
  } else {
    await triggerDemoCursorClick(page);
    await trigger.click();
  }
  await page.waitForTimeout(NAVIGATION_POST_CLICK_MS);

  if (destination) {
    await destination.waitFor({ state: 'visible', timeout: NAVIGATION_DESTINATION_TIMEOUT_MS });
  }
  await page.waitForLoadState('networkidle');
  if (description) {
    await showCaptionAfterNavigation(page, description, delay);
    return;
  }

  await page.waitForTimeout(delay);
}

/**
 * Navigates via href with cursor animation and caption.
 *
 * Searches for visible link matching href(s), moves cursor, clicks with animation,
 * and shows caption. Falls back to direct navigation if no trigger found.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string|string[]} href - Single href or array of href alternatives.
 * @param {string} description - Caption text to display after navigation.
 * @param {Object} [options={}] - Navigation options.
 * @param {string} [options.triggerSelector] - Explicit CSS selector for trigger element.
 * @param {import('playwright').Locator} [options.destination] - Element to wait for after navigation.
 * @param {number} [options.delay] - Caption display duration.
 * @param {boolean} [options.allowDirectNavigation=true] - Whether to fall back to direct navigation.
 * @returns {Promise<void>}
 * @throws {Error} If no trigger found and allowDirectNavigation is false.
 *
 * @example
 * await navigateViaHref(page, '/eden/org/organisation', 'Opening Organizations');
 *
 * @example
 * // With multiple href alternatives
 * await navigateViaHref(
 *   page,
 *   ['/eden/supply/item/summary', '/eden/supply/item'],
 *   'Viewing items',
 *   { delay: 2000 }
 * );
 */
async function navigateViaHref(page, href, description, options = {}) {
  const hrefs = Array.isArray(href) ? href : [href];
  const directFallbackHref = hrefs[0];
  let trigger = null;

  if (options.triggerSelector) {
    const explicitTrigger = page.locator(`${options.triggerSelector}:visible`).first();
    if (await explicitTrigger.count()) {
      trigger = explicitTrigger;
    }
  }

  if (!trigger) {
    trigger = await findVisibleHrefTrigger(page, hrefs);
  }

  if (!trigger) {
    if (options.allowDirectNavigation === false) {
      throw new Error(
        `No visible navigation trigger found for ${hrefs.join(', ')} on ${page.url()}. Direct navigation is disabled.`
      );
    }
    
    if (!directFallbackHref) {
      throw new Error(
        `No visible navigation trigger found for ${hrefs.join(', ')} on ${page.url()} and no fallback href provided.`
      );
    }

    await navigateDirectly(page, directFallbackHref, description, options);
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

/**
 * Navigates via top menu item with cursor animation and caption.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string} name - Menu item accessible name.
 * @param {string} description - Caption text to display after navigation.
 * @param {Object} [options={}] - Navigation options.
 * @param {import('playwright').Locator} [options.destination] - Element to wait for after navigation.
 * @param {number} [options.delay] - Caption display duration.
 * @returns {Promise<void>}
 *
 * @example
 * await navigateViaTopMenu(page, 'Organizations', 'Opening Organizations module');
 */
async function navigateViaTopMenu(page, name, description, options = {}) {
  await runNavigationStep({
    page,
    trigger: page.getByRole('menuitem', { name }),
    destination: options.destination ?? page.locator('h1, h2').first(),
    description,
    delay: options.delay ?? DEFAULT_CAPTION_DELAY_MS,
  });
}

/**
 * Hovers cursor over element and shows description caption.
 *
 * Waits for element visibility, moves cursor, shows caption, and holds
 * for minimum display time.
 *
 * @param {import('playwright').Locator} locator - Target element locator.
 * @param {string} description - Caption text to display.
 * @param {number} [delay=DEFAULT_HOVER_DELAY_MS] - Base caption delay.
 * @param {number} [waitTimeout=FIELD_WAIT_TIMEOUT_MS] - Timeout for element visibility.
 * @returns {Promise<void>}
 * @throws {Error} If element not visible within timeout.
 *
 * @example
 * await runHoverDescription(
 *   page.locator('#org_logo'),
 *   'Organization logo upload field',
 *   2000
 * );
 */
async function runHoverDescription(locator, description, delay = DEFAULT_HOVER_DELAY_MS, waitTimeout = FIELD_WAIT_TIMEOUT_MS) {
  const page = locator.page();
  await locator.waitFor({ state: 'visible', timeout: waitTimeout });
  await moveDemoCursor(locator);
  const caption = await showCaption(page, description, delay);
  await holdCaption(page, caption);
}

/**
 * Tries to hover and describe element, returns false if not visible.
 *
 * Used for optional fields that may not be present in all configurations.
 * Only catches timeout errors; other errors are re-thrown.
 *
 * @param {import('playwright').Locator} locator - Target element locator.
 * @param {string} description - Caption text to display.
 * @param {number} [delay=OPTIONAL_HOVER_DELAY_MS] - Base caption delay.
 * @param {number} [waitTimeout=OPTIONAL_HOVER_WAIT_TIMEOUT_MS] - Timeout for element visibility.
 * @returns {Promise<boolean>} True if successful, false if element not visible.
 * @throws {Error} Re-throws non-timeout errors.
 *
 * @example
 * const shown = await tryRunHoverDescription(
 *   page.locator('#optional_field'),
 *   'Optional field description'
 * );
 * if (!shown) {
 *   console.log('Field not present, skipping');
 * }
 */
async function tryRunHoverDescription(locator, description, delay = OPTIONAL_HOVER_DELAY_MS, waitTimeout = OPTIONAL_HOVER_WAIT_TIMEOUT_MS) {
  try {
    await runHoverDescription(locator, description, delay, waitTimeout);
    return true;
  } catch (error) {
    // Only catch timeout errors, re-throw others
    if (error.message && error.message.includes('Timeout')) {
      return false;
    }
    throw error;
  }
}

/**
 * Clears demo caption from page.
 *
 * Removes caption state and hides caption element via injected function.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @returns {Promise<void>}
 *
 * @example
 * await clearDemoCaption(page);
 */
async function clearDemoCaption(page) {
  captionState.delete(page);
  await page.evaluate(() => {
    if (window.__edenDemoCaptionHide) {
      window.__edenDemoCaptionHide();
    }
  });
}

/**
 * Triggers demo cursor click animation.
 *
 * Calls injected client-side function to show click visual effect.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @returns {Promise<void>}
 */
async function triggerDemoCursorClick(page) {
  await page.evaluate(() => {
    if (window.__edenDemoCursorClick) {
      window.__edenDemoCursorClick();
    }
  });
}

/**
 * Builds unique user credentials for registration.
 *
 * Generates timestamp-based email to avoid conflicts.
 *
 * @returns {Object} User credentials object.
 * @returns {string} return.firstName - User first name.
 * @returns {string} return.lastName - User last name.
 * @returns {string} return.email - Unique email address.
 * @returns {string} return.password - User password from environment.
 *
 * @example
 * const user = buildUser();
 * await registerUser(page, user);
 */
function buildUser() {
  const stamp = Date.now();
  return {
    firstName: 'Demo',
    lastName: 'Automation',
    email: `codex+${stamp}@example.com`,
    password: USER_PASSWORD,
  };
}

/**
 * Loads existing user credentials from environment variables.
 *
 * Used for recording tests that need to login with pre-existing account.
 *
 * @returns {Object} User credentials object.
 * @returns {string} return.email - User email from EMAIL env var.
 * @returns {string} return.password - User password from PASSWORD env var.
 * @throws {Error} If EMAIL or PASSWORD environment variables are missing.
 *
 * @example
 * const user = loadEnvCredentials();
 * await loginUser(page, user);
 */
function loadEnvCredentials() {
  const email = getEnvValue('EMAIL');
  const password = getEnvValue('PASSWORD');

  if (!email || !password) {
    throw new Error('Missing EMAIL or PASSWORD in .env or environment variables');
  }

  return { email, password };
}

/**
 * Clicks element with cursor animation and paced timing.
 *
 * Moves cursor, shows click animation, waits, then performs actual click.
 * Used for non-narrated clicks where only timing matters.
 *
 * @param {import('playwright').Locator} locator - Element to click.
 * @returns {Promise<void>}
 *
 * @example
 * await pacedClick(page.locator('input[type="submit"]'));
 */
async function pacedClick(locator) {
  await locator.waitFor({ state: 'visible' });
  await moveDemoCursor(locator);
  await triggerDemoCursorClick(locator.page());
  await locator.page().waitForTimeout(POST_CURSOR_CLICK_DELAY_MS);
  await locator.click();
  await locator.page().waitForTimeout(ACTION_DELAY_MS);
}

/**
 * Fills input field with cursor animation and character-by-character typing.
 *
 * Moves cursor, shows click animation, clears existing value, then types
 * new value with delay between characters for realistic effect.
 *
 * @param {import('playwright').Locator} locator - Input element to fill.
 * @param {string} value - Text value to type.
 * @returns {Promise<void>}
 *
 * @example
 * await pacedFill(page.locator('#org_organisation_name'), 'Test Organization');
 */
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

/**
 * Selects option from dropdown with cursor animation and paced timing.
 *
 * Moves cursor, shows click animation, waits, then selects option.
 *
 * @param {import('playwright').Locator} locator - Select element.
 * @param {string|Object} value - Option value or selection object.
 * @returns {Promise<void>}
 *
 * @example
 * await pacedSelect(page.locator('#country'), { label: 'Poland' });
 */
async function pacedSelect(locator, value) {
  await locator.waitFor({ state: 'visible' });
  await moveDemoCursor(locator);
  await triggerDemoCursorClick(locator.page());
  await locator.page().waitForTimeout(POST_CURSOR_CLICK_DELAY_MS);
  await locator.click();
  await locator.selectOption(value);
  await locator.page().waitForTimeout(ACTION_DELAY_MS);
}

/**
 * Finds matching option value in a select element.
 *
 * Supports exact match, contains match, or object matcher with value/label/index.
 * Filters out placeholder options like "Select..." or "---".
 *
 * @param {import('playwright').Locator} locator - Select element locator.
 * @param {string|Object} matcher - Value to match or object with {value, label, index}.
 * @param {string} [matchMode='exact'] - Match mode: 'exact' or 'contains'.
 * @returns {Promise<string|null>} Matching option value or null if not found.
 *
 * @example
 * // Exact match
 * const value = await findMatchingOptionValue(select, 'Poland');
 *
 * @example
 * // Contains match
 * const value = await findMatchingOptionValue(select, 'Demo NGO', 'contains');
 *
 * @example
 * // Object matcher
 * const value = await findMatchingOptionValue(select, { label: 'Poland' });
 */
async function findMatchingOptionValue(locator, matcher, matchMode = 'exact') {
  return locator.evaluate((select, { requestedMatcher, requestedMatchMode }) => {
    function normalize(value) {
      return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
    }

    function isSelectableOption(entry) {
      const optionValue = entry.value ? entry.value.trim() : '';
      const optionText = normalize(entry.textContent);
      if (!optionValue || !optionText) {
        return false;
      }
      // More specific regex to avoid matching "selective", "selection", etc.
      if (/^select$/i.test(optionText) || /^select\s/i.test(optionText)) {
        return false;
      }
      if (/^-+$/.test(optionText)) {
        return false;
      }
      return true;
    }

    function matchesOption(entry) {
      if (!isSelectableOption(entry)) {
        return false;
      }

      const optionValue = entry.value ? entry.value.trim() : '';
      const optionText = normalize(entry.textContent);

      if (requestedMatchMode === 'contains') {
        const matchText = normalize(requestedMatcher);
        return matchText ? optionText.includes(matchText) : false;
      }

      if (requestedMatcher && typeof requestedMatcher === 'object') {
        if (typeof requestedMatcher.value === 'string' && optionValue === requestedMatcher.value.trim()) {
          return true;
        }

        if (typeof requestedMatcher.label === 'string' && optionText === normalize(requestedMatcher.label)) {
          return true;
        }

        if (typeof requestedMatcher.index === 'number') {
          const options = Array.from(select.options);
          return options[requestedMatcher.index] === entry;
        }

        return false;
      }

      const exactText = normalize(requestedMatcher);
      if (!exactText) {
        return false;
      }

      return optionValue === exactText || optionText === exactText;
    }

    const option = Array.from(select.options).find(matchesOption);
    return option ? option.value : null;
  }, { requestedMatcher: matcher, requestedMatchMode: matchMode });
}

/**
 * Selects option containing text, falls back to first available.
 *
 * @param {import('playwright').Locator} locator - Select element locator.
 * @param {string} text - Text to search for in option labels.
 * @returns {Promise<void>}
 *
 * @example
 * await selectOptionContainingText(page.locator('#org_id'), 'Demo NGO');
 */
async function selectOptionContainingText(locator, text) {
  const value = await findMatchingOptionValue(locator, text, 'contains');

  if (!value) {
    await selectFirstAvailableOption(locator);
    return;
  }

  await locator.selectOption(value);
}

/**
 * Selects first non-placeholder option in select element.
 *
 * Filters out options like "Select...", "---", or empty values.
 *
 * @param {import('playwright').Locator} locator - Select element locator.
 * @returns {Promise<void>}
 * @throws {Error} If no selectable option found.
 *
 * @example
 * await selectFirstAvailableOption(page.locator('#optional_select'));
 */
async function selectFirstAvailableOption(locator) {
  const value = await locator.evaluate((select) => {
    function normalize(optionText) {
      return typeof optionText === 'string' ? optionText.replace(/\s+/g, ' ').trim() : '';
    }

    const option = Array.from(select.options).find((entry) => {
      const optionValue = entry.value ? entry.value.trim() : '';
      const optionText = normalize(entry.textContent);
      if (!optionValue || !optionText) {
        return false;
      }
      if (/^select$/i.test(optionText) || /^select\s/i.test(optionText)) {
        return false;
      }
      if (/^-+$/.test(optionText)) {
        return false;
      }
      return true;
    });
    return option ? option.value : null;
  });

  if (!value) {
    throw new Error('Could not find a selectable fallback option');
  }

  await locator.selectOption(value);
}

async function clickFirstAvailableMultiselectOption(page) {
  const options = page.locator('.ui-multiselect-menu:visible label');
  const count = await options.count();

  for (let index = 0; index < count; index += 1) {
    const option = options.nth(index);
    const text = await option.textContent();
    const normalized = typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : '';

    if (!normalized) {
      continue;
    }
    if (/^select$/i.test(normalized) || /^select\s/i.test(normalized)) {
      continue;
    }
    if (/^-+$/.test(normalized)) {
      continue;
    }

    await option.click();
    return;
  }

  throw new Error('Could not find a selectable multiselect option');
}

function shouldSkipUnavailableSelect(step) {
  return step.fallbackSelect === 'skip' || step.fallbackSelect === 'firstAvailableOrSkip';
}

function isTimeoutError(error) {
  return error.message && error.message.includes('Timeout');
}

async function dismissVisibleAutocomplete(page) {
  const autocomplete = page.locator('ul.ui-autocomplete:visible').first();
  if (!await autocomplete.isVisible({ timeout: 500 }).catch(() => false)) {
    return;
  }

  const noneOfTheAbove = autocomplete
    .locator('.ui-menu-item-wrapper')
    .filter({ hasText: /^None of the above$/i })
    .first();

  if (await noneOfTheAbove.isVisible({ timeout: 500 }).catch(() => false)) {
    await noneOfTheAbove.click({ force: true });
  } else {
    await page.keyboard.press('Escape');
  }

  if (await autocomplete.isVisible({ timeout: 500 }).catch(() => false)) {
    await page.keyboard.press('Escape');
  }
  if (await autocomplete.isVisible({ timeout: 1000 }).catch(() => false)) {
    await autocomplete.evaluate((element) => {
      element.style.display = 'none';
    }).catch(() => {});
  }
  await autocomplete.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(300);
}

async function runFieldStep(locator, step) {
  const delay = step.captionDelay ?? DEFAULT_CAPTION_DELAY_MS;
  const page = locator.page();
  try {
    await locator.waitFor({ state: 'visible', timeout: step.waitTimeout ?? FIELD_WAIT_TIMEOUT_MS });
  } catch (error) {
    if (shouldSkipUnavailableSelect(step) && isTimeoutError(error)) {
      return;
    }
    throw error;
  }
  await dismissVisibleAutocomplete(page);
  await moveDemoCursor(locator);
  const caption = await showCaption(page, step.description, delay);

  if (step.action === 'hover') {
    await holdCaption(page, caption);
    return;
  }

  await triggerDemoCursorClick(locator.page());
  await dismissVisibleAutocomplete(page);
  await locator.page().waitForTimeout(POST_CURSOR_CLICK_DELAY_MS);
  await dismissVisibleAutocomplete(page);

  if (step.action === 'fill') {
    await locator.click();
    await locator.press('ControlOrMeta+A');
    await locator.press('Backspace');
    await locator.page().keyboard.type(step.value, { delay: TYPE_DELAY_MS });

    if (step.closeAutocomplete) {
      await page.waitForTimeout(1500);
      await dismissVisibleAutocomplete(page);
    }

    // Close calendar widget if this is a date field
    const fieldId = await locator.getAttribute('id').catch(() => null);
    if (fieldId && (fieldId.includes('date') || fieldId.includes('_date_'))) {
      await locator.press('Escape');
      await locator.page().waitForTimeout(300);
    }

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
    // Click to open the dropdown (important for visual recording)
    await locator.click();
    await locator.page().waitForTimeout(300); // Wait for dropdown to open

    if (step.match === 'contains') {
      try {
        await selectOptionContainingText(locator, step.value);
      } catch (error) {
        if (step.fallbackSelect !== 'firstAvailable' && step.fallbackSelect !== 'firstAvailableOrSkip') {
          if (shouldSkipUnavailableSelect(step)) {
            await holdCaption(page, caption);
            return;
          }
          throw error;
        }
        try {
          await selectFirstAvailableOption(locator);
        } catch (fallbackError) {
          if (shouldSkipUnavailableSelect(step)) {
            await holdCaption(page, caption);
            return;
          }
          throw fallbackError;
        }
      }
    } else {
      try {
        const exactValue = await findMatchingOptionValue(locator, step.value);
        if (!exactValue) {
          throw new Error(`Could not find option matching ${JSON.stringify(step.value)}`);
        }
        await locator.selectOption(exactValue);
      } catch (error) {
        if (step.fallbackSelect !== 'firstAvailable' && step.fallbackSelect !== 'firstAvailableOrSkip') {
          if (shouldSkipUnavailableSelect(step)) {
            await holdCaption(page, caption);
            return;
          }
          throw error;
        }
        try {
          await selectFirstAvailableOption(locator);
        } catch (fallbackError) {
          if (shouldSkipUnavailableSelect(step)) {
            await holdCaption(page, caption);
            return;
          }
          throw fallbackError;
        }
      }
    }
    await locator.page().waitForTimeout(ACTION_DELAY_MS);
    await holdCaption(page, caption);
    return;
  }

  throw new Error(`Unsupported field action: ${step.action}`);
}

async function describeAndFill(locator, description, value, options = {}) {
  await runFieldStep(locator, {
    action: 'fill',
    description,
    value,
    closeAutocomplete: options.closeAutocomplete,
  });
}

async function describeAndSelect(locator, description, value, match = 'exact', fallbackSelect) {
  await runFieldStep(locator, { action: 'select', description, value, match, fallbackSelect });
}

async function describeAndClick(locator, description) {
  await runFieldStep(locator, { action: 'click', description });
}

async function describeAndSelectFirstMultiselectOption(locator, description) {
  const page = locator.page();
  await runFieldStep(locator, { action: 'click', description });
  await clickFirstAvailableMultiselectOption(page);
  await page.waitForTimeout(ACTION_DELAY_MS);
}

async function describeOnly(locator, description, delay = DEFAULT_HOVER_DELAY_MS) {
  await runHoverDescription(locator, description, delay);
}

async function describeOnlyIfVisible(locator, description, delay = OPTIONAL_HOVER_DELAY_MS, waitTimeout = OPTIONAL_HOVER_WAIT_TIMEOUT_MS) {
  await tryRunHoverDescription(locator, description, delay, waitTimeout);
}

/**
 * Saves form by clicking Save button and waiting for completion.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @returns {Promise<void>}
 *
 * @example
 * await saveForm(page);
 */
async function saveForm(page) {
  await pacedClick(page.locator('input[type="submit"][value="Save"]').first());
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ACTION_DELAY_MS);
}

/**
 * Saves recorded video to target location with error handling.
 *
 * Closes browser context, retrieves video path, and moves file to
 * artifacts/demo-results directory. Overwrites existing file if present.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string} targetFileName - Target filename (e.g., 'organization-setup.webm').
 * @returns {Promise<string|null>} Path to saved video or null if no video or error.
 *
 * @example
 * const videoPath = await saveRecordedVideo(page, 'organization-setup.webm');
 * if (videoPath) {
 *   console.log(`Video saved to: ${videoPath}`);
 * }
 */
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

/**
 * Registers new user account.
 *
 * Navigates to registration page, fills form fields with paced timing,
 * and verifies successful registration.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} user - User credentials object.
 * @param {string} user.firstName - User first name.
 * @param {string} user.lastName - User last name.
 * @param {string} user.email - User email address.
 * @param {string} user.password - User password.
 * @returns {Promise<void>}
 *
 * @example
 * const user = buildUser();
 * await registerUser(page, user);
 */
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

/**
 * Logs in user with existing credentials.
 *
 * Navigates to login page, fills credentials, submits form, and verifies
 * successful login by checking for Organizations menu item.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {Object} user - User credentials object.
 * @param {string} user.email - User email address.
 * @param {string} user.password - User password.
 * @returns {Promise<void>}
 *
 * @example
 * const user = loadEnvCredentials();
 * await loginUser(page, user);
 */
async function loginUser(page, user) {
  await page.goto('/eden/default/user/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#auth_user_email').fill(user.email);
  await page.locator('#auth_user_password').fill(user.password);
  await Promise.all([
    page.waitForURL(/\/eden\/default\/index$/),
    page.locator('input[type="submit"][value="Login"]').click(),
  ]);

  await expect(page).toHaveURL(/\/eden\/default\/index$/);
  await expect(page.getByRole('menuitem', { name: 'Organizations' })).toBeVisible();
}

/**
 * Opens Organizations module from main menu.
 *
 * @param {import('playwright').Page} page - The Playwright page object.
 * @returns {Promise<void>}
 *
 * @example
 * await openOrganizations(page);
 */
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
  describeAndSelectFirstMultiselectOption,
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
