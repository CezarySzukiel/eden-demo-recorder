const DEFAULT_RECORDING_WIDTH = 1600;
const DEFAULT_RECORDING_HEIGHT = 900;

function readPositiveIntegerEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const RECORDING_WIDTH = readPositiveIntegerEnv(
  'EDEN_RECORDING_WIDTH',
  DEFAULT_RECORDING_WIDTH,
);
const RECORDING_HEIGHT = readPositiveIntegerEnv(
  'EDEN_RECORDING_HEIGHT',
  DEFAULT_RECORDING_HEIGHT,
);
const RECORDING_VIEWPORT = { width: RECORDING_WIDTH, height: RECORDING_HEIGHT };

module.exports = {
  RECORDING_HEIGHT,
  RECORDING_VIEWPORT,
  RECORDING_WIDTH,
};
