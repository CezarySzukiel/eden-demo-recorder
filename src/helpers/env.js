const fs = require('fs');
const path = require('path');

/**
 * Parses the repository .env file using the project's intentionally small
 * key=value format.
 *
 * Environment variables from process.env still win; this parser only provides
 * local fallback values for demo scripts without introducing dotenv semantics.
 *
 * @returns {Object<string, string>} Parsed environment values.
 */
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

/**
 * Retrieves environment variable value.
 *
 * @param {string} name - Environment variable name.
 * @returns {string|undefined} Environment variable value or undefined.
 */
function getEnvValue(name) {
  if (process.env[name] !== undefined) {
    return process.env[name];
  }
  return ENV_VALUES[name];
}

/**
 * Gets required numeric environment variable.
 *
 * @param {string} name - Environment variable name.
 * @returns {number} Parsed numeric value.
 * @throws {Error} If variable is missing or not a valid number.
 */
function getRequiredNumberEnv(name) {
  const rawValue = getEnvValue(name);
  const parsed = Number(rawValue);

  if (rawValue === undefined || Number.isNaN(parsed)) {
    throw new Error(`Missing numeric environment setting: ${name}`);
  }

  return parsed;
}

/**
 * Gets required string environment variable.
 *
 * @param {string} name - Environment variable name.
 * @returns {string} Environment variable value.
 * @throws {Error} If variable is missing or empty.
 */
function getRequiredStringEnv(name) {
  const value = getEnvValue(name);
  if (!value) {
    throw new Error(`Missing environment setting: ${name}`);
  }
  return value;
}

/**
 * Reads an optional boolean environment flag.
 *
 * @param {string} name - Environment variable name.
 * @returns {boolean} True when the value is a common truthy string.
 */
function getOptionalBooleanEnv(name) {
  const value = getEnvValue(name);
  if (value === undefined) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

module.exports = {
  getEnvValue,
  getOptionalBooleanEnv,
  getRequiredNumberEnv,
  getRequiredStringEnv,
  parseEnvFile,
};
