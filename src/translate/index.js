import { locale_tr } from './locales/tr';

export const gjs_translate = {
  default_locale: 'tr',
  locales: {
    tr: locale_tr
  },
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
      }, this.locales[this.default_locale]) || fallback
    );
  },
  addLocale(locale, data = {}) {
    this.locales[locale] = data;
  },
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
};
