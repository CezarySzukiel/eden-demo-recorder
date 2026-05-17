# Refactoring Summary

Date: 2026-05-17

This refactor improves readability and contributor guidance without changing
the recording timing model.

## Kept Intentionally

- The custom `.env` parser remains in `src/helpers/eden-demo.js`.
- `process.env` still takes precedence over values parsed from `.env`.
- Timing and animation values are still required environment settings.
- `saveRecordedVideo()` still fails loudly when the recorded file cannot be
  moved into `artifacts/demo-results/`.

## Code Quality Changes

- Added JSDoc and file overviews to the helper modules.
- Extracted cursor positioning and caption word-length literals into named
  constants.
- Clarified navigation error messages in `navigateViaHref()`.
- Made optional hover descriptions ignore only timeout failures, so unrelated
  errors are not hidden.
- Tightened select placeholder matching while preserving the existing fallback
  selection behavior.

## Documentation

- Added `CONTRIBUTING.md` with repository-specific guidance for CommonJS,
  recording helpers, locale files, timing settings, and review checks.
- Kept package metadata lightweight: description, keywords, author, and Node/npm
  engine expectations.

## Verification

- Imported all helper modules with Node successfully.
- Confirmed representative timing values still load from `.env`:
  `EDEN_ACTION_DELAY_MS=0`, `EDEN_TYPE_DELAY_MS=50`,
  `SECONDS_PER_WORD=0.1`, `MAX_CAPTION_DELAY_MS=10`,
  `EDEN_RECORDING_FINISH_DELAY_MS=250`.
