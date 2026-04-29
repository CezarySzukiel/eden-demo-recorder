function localeText(locale, key, fallback = '') {
  const value = locale[key];
  return typeof value === 'string' ? value : fallback;
}

module.exports = {
  localeText,
};
