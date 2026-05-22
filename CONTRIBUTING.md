# Contributing

This repository records Sahana Eden demo flows with Playwright. Keep changes
boring, explicit, and friendly to video recording: timing, cursor motion, and
captions are part of the product output.

## Code Style

- Use CommonJS (`require`/`module.exports`), not ES modules.
- Prefer async/await for Playwright work.
- Keep helper APIs small and named after the user-visible action they perform.
- Put narration text in `src/locale/{module}/{lang}.json`, not directly in specs.
- Add JSDoc to exported helpers when the call shape is not obvious.
- Avoid broad refactors while changing a recording scenario; small readable steps
  are easier to review and re-record.

## Environment And Timing

`src/helpers/eden-demo.js` uses the local `parseEnvFile()` helper on purpose.
Do not replace it with `dotenv` unless the timing/config semantics are reviewed
as a deliberate behavior change.

Timing settings are required and should be treated as recording configuration,
not code defaults. If a change affects any of these, call it out in review:

- `EDEN_ACTION_DELAY_MS`
- `EDEN_TYPE_DELAY_MS`
- `SECONDS_PER_WORD`
- `MAX_CAPTION_DELAY_MS`
- `EDEN_CURSOR_MOVE_STEPS`
- `EDEN_CURSOR_MOVE_SETTLE_MS`
- `EDEN_NAVIGATION_CLICK_PAUSE_MS`
- `EDEN_NAVIGATION_POST_CLICK_MS`
- `EDEN_CURSOR_CLICK_VISUAL_MS`
- `EDEN_POST_CURSOR_CLICK_DELAY_MS`
- `EDEN_DEFAULT_CAPTION_DELAY_MS`
- `EDEN_DEFAULT_HOVER_DELAY_MS`
- `EDEN_OPTIONAL_HOVER_DELAY_MS`
- `EDEN_OPTIONAL_HOVER_WAIT_TIMEOUT_MS`
- `EDEN_FIELD_WAIT_TIMEOUT_MS`
- `EDEN_NAVIGATION_WAIT_TIMEOUT_MS`
- `EDEN_NAVIGATION_DESTINATION_TIMEOUT_MS`
- `EDEN_RECORDING_FINISH_DELAY_MS`

`EDEN_HIDE_CAPTIONS=1` is optional and should only change caption visibility.
Caption functions must still run so word-count delays and scenario length stay
unchanged.

## Recording Commands

- Use `npm run warehouse` for the canonical Warehouse recording.
- Use `npm run warehouse_no_captions` for the same flow with hidden captions.
- Do not add separate basic, extended, or overview Warehouse recording variants.

## Recording Helpers

- Call `enableDemoCursor()` and `enableDemoCaptions()` before navigation in a
  recording context.
- Use `navigateViaHref()` when a visible link should be clicked on camera.
- Use explicit `fallbackSelect: 'firstAvailable'` or `fallbackSelect: 'skip'`
  for optional selects.
- Keep `saveRecordedVideo()` strict: if moving the recorded file fails, the test
  should fail instead of silently producing no artifact.

## Review Checklist

- The demo still follows the same user-visible flow.
- Timing values and caption timing semantics were not changed accidentally.
- New helpers preserve existing Playwright timeouts and fallback behavior.
- Generated videos are saved under `artifacts/demo-results/`.
- Documentation describes this repository, not a generic JavaScript template.
