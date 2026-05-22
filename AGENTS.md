# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project-Specific Patterns

**Dual Config System**: Two Playwright configs exist - `playwright.config.js` for regular tests (headless, 180s timeout) and `playwright.demo.config.js` for recordings (non-headless, 1800s timeout, custom viewport from `RECORDING_VIEWPORT`). Recording tests run from `src/recordings/`, regular tests from `src/`.

**Custom .env Parser**: Project uses custom `parseEnvFile()` in `eden-demo.js` instead of dotenv package. Environment variables are read via `getEnvValue()` which checks `process.env` first, then falls back to parsed `.env` file.

**Required Environment Variables**: All timing/animation variables are REQUIRED (throw errors if missing). Must be set in `.env` file:
- `EDEN_TEST_PASSWORD` - for user registration
- `EMAIL` and `PASSWORD` - for existing user login (used by `loadEnvCredentials()`)
- All `EDEN_*` timing variables (see README for full list)

**Caption Timing System**: Captions use word-count-based minimum display time via `getCaptionMinimumDelay()`. Splits text on whitespace, counts words >3 chars, multiplies by `SECONDS_PER_WORD`, capped at `MAX_CAPTION_DELAY_MS`. This ensures longer descriptions stay visible longer.

**Demo Cursor/Caption Injection**: `enableDemoCursor()` and `enableDemoCaptions()` inject client-side scripts via `page.addInitScript()` that install DOM elements and expose global functions (`window.__edenDemoCursorMove`, `window.__edenDemoCaptionShow`, etc.). These must be called before navigation.

**Select Option Matching**: `findMatchingOptionValue()` has complex logic - skips options with text starting with "select" or containing only dashes. Supports exact match, contains match, or object matcher with `{value, label, index}`. Always use `fallbackSelect: 'firstAvailable'` or `'skip'` for optional selects.

**Navigation Fallback**: `navigateViaHref()` searches for visible `<a>` tags with matching href, falls back to direct `page.goto()` if no trigger found (unless `allowDirectNavigation: false`). Normalizes URLs by removing trailing slashes and comparing pathname+search.

**Video Saving**: `saveRecordedVideo()` moves video from Playwright's temp location to `artifacts/demo-results/{filename}` and deletes existing file first. Must close context before accessing video path.

**Two-Phase Recording Setup**: Tests use two contexts - first for login/setup (saves `storageState`), second for actual recording with video enabled. This avoids recording login screens.

**Locale Files**: Narration text lives in `src/locale/{module}/{lang}.json` files, not in test code. Tests import locale and pass to story builders.

## Running Single Test

```bash
# Run specific recording test
npx playwright test -c playwright.demo.config.js organization-setup.spec.js

# Or use npm scripts
npm run organizations
npm run warehouse
```

## Code Style

- Use `require()` not `import` (CommonJS)
- Async/await for all Playwright operations
- Destructure commonly used functions from helpers
- Locators use CSS selectors or `getByRole()`/`getByText()`
- No TypeScript - plain JavaScript with JSDoc comments where helpful
