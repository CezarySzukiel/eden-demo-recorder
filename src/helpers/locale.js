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
 * const locale = require('./locale/organizations/en.json');
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

module.exports = {
  localeText,
};
