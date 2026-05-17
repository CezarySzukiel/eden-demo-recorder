/**
 * @fileoverview Recording viewport configuration for demo videos.
 *
 * Provides viewport dimensions for Playwright video recording. Default size
 * is 1600x900 to fit within typical browser windows with chrome visible.
 * Can be overridden via environment variables for full HD recording.
 */

const DEFAULT_RECORDING_WIDTH = 1600;
const DEFAULT_RECORDING_HEIGHT = 900;

/**
 * Safely parses a positive integer from environment variable.
 *
 * @param {string} name - Environment variable name to read.
 * @param {number} fallback - Default value if parsing fails or value is invalid.
 * @returns {number} Parsed positive integer or fallback value.
 *
 * @example
 * const width = readPositiveIntegerEnv('EDEN_RECORDING_WIDTH', 1600);
 * // Returns: parsed value from env or 1600
 */
function readPositiveIntegerEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * Recording viewport width in pixels.
 * @type {number}
 * @default 1600
 */
const RECORDING_WIDTH = readPositiveIntegerEnv(
  'EDEN_RECORDING_WIDTH',
  DEFAULT_RECORDING_WIDTH,
);

/**
 * Recording viewport height in pixels.
 * @type {number}
 * @default 900
 */
const RECORDING_HEIGHT = readPositiveIntegerEnv(
  'EDEN_RECORDING_HEIGHT',
  DEFAULT_RECORDING_HEIGHT,
);

/**
 * Playwright viewport configuration object.
 * @type {{width: number, height: number}}
 */
const RECORDING_VIEWPORT = { width: RECORDING_WIDTH, height: RECORDING_HEIGHT };

module.exports = {
  RECORDING_HEIGHT,
  RECORDING_VIEWPORT,
  RECORDING_WIDTH,
};
