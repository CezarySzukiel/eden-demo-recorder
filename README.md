# Eden Demo Automation

Playwright automation for recording Sahana Eden demo walkthroughs.

## Available Commands

- `npm test` - runs the full end-to-end flow with an organization, office, facility, and resource.
- `npm run organizations` - records the organization setup scenario.
- `npm run organizations_no_captions` - records the organization setup scenario with hidden captions.
- `npm run warehouse` - records the canonical Warehouse guide.
- `npm run warehouse_no_captions` - records the canonical Warehouse guide with hidden captions.
- `npm run volunteers` - records the Volunteers guide.
- `npm run volunteers_no_captions` - records the Volunteers guide with hidden captions.

Default application URL:

- `http://127.0.0.1:8000/eden`

## Recording Output

Recorded videos are saved under:

- `artifacts/demo-results/`

Playwright technical output is written under `artifacts/playwright-output/`,
which may be cleaned at the start of a test run.

## Settings

- `EDEN_BASE_URL` - Eden instance URL, defaulting to `http://127.0.0.1:8000/eden`.
- `EDEN_TEST_PASSWORD` - password for newly registered test accounts.
- `EMAIL` and `PASSWORD` - credentials for existing-user recording flows.
- `EDEN_RECORDING_WIDTH` - recording width, defaulting to `1600`.
- `EDEN_RECORDING_HEIGHT` - recording height, defaulting to `900`.
- `EDEN_RECORDING_LANGUAGE` - recording captions and fixture values language, for example `en` or `pl`; locale files are loaded as `{language}_captions.json` and `{language}_values.json`.
- `EDEN_ACTION_DELAY_MS` - delay after an action before continuing.
- `EDEN_TYPE_DELAY_MS` - delay per typed character.
- `EDEN_CURSOR_MOVE_STEPS` - number of cursor animation steps.
- `EDEN_CURSOR_MOVE_SETTLE_MS` - pause after the cursor reaches its target.
- `EDEN_NAVIGATION_CLICK_PAUSE_MS` - pause before clicking navigation links.
- `EDEN_NAVIGATION_POST_CLICK_MS` - pause after navigation click animation.
- `EDEN_CURSOR_CLICK_VISUAL_MS` - cursor click visual duration.
- `EDEN_POST_CURSOR_CLICK_DELAY_MS` - pause between click animation and input.
- `EDEN_DEFAULT_CAPTION_DELAY_MS` - default delay for standard captions.
- `EDEN_DEFAULT_HOVER_DELAY_MS` - default delay for hover descriptions.
- `EDEN_OPTIONAL_HOVER_DELAY_MS` - default delay for optional field descriptions.
- `EDEN_RECORDING_FINISH_DELAY_MS` - pause before saving the recording.
- `EDEN_HIDE_CAPTIONS` - set to `1` to hide caption text and background while preserving caption timing.
- `SECONDS_PER_WORD` - caption display time per word.
- `MAX_SECONDS_PER_WRITING` - maximum caption time from text length.
- `MAX_CAPTION_DELAY_MS` - hard maximum caption display time.

The default recording size is `1600x900` because non-headless recordings often
need to fit the Chromium window frame on screen. If your display can handle Full
HD, override the recording size:

```bash
EDEN_RECORDING_WIDTH=1920 EDEN_RECORDING_HEIGHT=1080 npm run warehouse
```

## Warehouse Guide

The canonical Warehouse recording is based on the former extended flow. It logs
in, prepares the required organization data, records the Warehouse module, and
walks through setup data, catalogs, suppliers, warehouses, receipts, shipments,
requests, commitments, distributions, stock counts, stock count items, reports,
and integration notes.

## Stable Output Files

Repeated runs overwrite only their own recording file:

- `artifacts/demo-results/organization-setup.webm`
- `artifacts/demo-results/warehouse.webm`
- `artifacts/demo-results/volunteers-guide.webm`
