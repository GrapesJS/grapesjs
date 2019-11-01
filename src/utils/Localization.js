import { bindAll } from 'underscore';

class Localization {
  constructor(default_locale = 'en', locales = { en: {} }) {
    this.default_locale = default_locale;
    this.locales = locales;
    bindAll(this, 'get', 'setDefaultLocale', 'addLocale');
    return this;
  }

  get(key, fallback) {
    if (typeof this.locales[this.default_locale] === 'undefined') {
      return fallback;
    }
    return (
      key.split('.').reduce((o, i) => {
        if (typeof o === 'undefined') {
          return;
        }
        return o[i];
      }, this.locales[this.default_locale]) ||
      fallback ||
      fallback
    );
  }

  addLocale(locale, data = {}) {
    this.locales[locale] = data;
  }

  setDefaultLocale(locale) {
    if (
      (typeof this.locales[locale] === 'undefined' ||
        this.locales[locale] === null) &&
      locale !== 'en'
    ) {
      console.error(`Locale ${locale} not found`);
      return;
    }
    this.default_locale = locale;
  }
}

export default {
  init(default_locale = 'en', locales = { en: {} }) {
    return new Localization(default_locale, locales);
  }
};
