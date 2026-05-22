const fs = require('fs');
const path = require('path');
const { getEnvValue } = require('./env');

const DEFAULT_RECORDING_LANGUAGE = 'en';
const RECORDING_LANGUAGE_ENV = 'EDEN_RECORDING_LANGUAGE';

/**
 * Retrieves localized text from a locale object.
 *
 * This helper safely extracts text values from locale JSON files,
 * returning a fallback value if the key doesn't exist or the value
 * is not a string.
 *
 * @param {Object} locale - The locale object containing translations.
 * @param {string} key - The key to look up in the locale object.
 * @param {string} [fallback=''] - Default value if key not found or value is not a string.
 * @returns {string} The localized text or fallback value.
 *
 * @example
 * const { captions: locale } = loadRecordingLocale('organizations');
 * const text = localeText(locale, 'org_name', 'Organization Name');
 * // Returns: 'Organization name' (from locale) or 'Organization Name' (fallback)
 *
 * @example
 * // With missing key
 * const text = localeText(locale, 'nonexistent_key', 'Default Text');
 * // Returns: 'Default Text'
 */
function localeText(locale, key, fallback = '') {
  const value = locale[key];
  return typeof value === 'string' ? value : fallback;
}

/**
 * Reads the language code used for recording captions and fixture values.
 *
 * @returns {string} Lowercase language code, e.g. "en" or "pl".
 */
function getRecordingLanguage() {
  const rawLanguage = getEnvValue(RECORDING_LANGUAGE_ENV) ?? DEFAULT_RECORDING_LANGUAGE;
  const language = rawLanguage.trim().toLowerCase();

  if (!/^[a-z]{2}$/.test(language)) {
    throw new Error(
      `Invalid ${RECORDING_LANGUAGE_ENV}: ${rawLanguage}. Use a two-letter code like "en" or "pl".`,
    );
  }

  return language;
}

function loadLocaleJson(moduleName, language, kind) {
  if (!/^[a-z0-9_-]+$/i.test(moduleName)) {
    throw new Error(`Invalid locale module name: ${moduleName}`);
  }

  const filePath = path.join(__dirname, '..', 'locale', moduleName, `${language}_${kind}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing recording locale file: ${filePath}`);
  }

  return require(filePath);
}

/**
 * Loads recording captions and values for a module based on .env language.
 *
 * Locale files must follow the {language}_captions.json and
 * {language}_values.json naming convention.
 *
 * @param {string} moduleName - Locale module directory name.
 * @returns {{language: string, captions: Object, values: Object}} Locale bundle.
 */
function loadRecordingLocale(moduleName) {
  const language = getRecordingLanguage();

  return {
    language,
    captions: loadLocaleJson(moduleName, language, 'captions'),
    values: loadLocaleJson(moduleName, language, 'values'),
  };
}

module.exports = {
  getRecordingLanguage,
  loadRecordingLocale,
  localeText,
};
