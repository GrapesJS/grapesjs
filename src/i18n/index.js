/**
 * You can customize the initial state of the module from the editor initialization
 * ```js
 * const editor = grapesjs.init({
 *  i18n: {
 *    locale: 'en',
 *    messages: {
 *      en: {
 *       hello: 'Hello',
 *      },
 *      ...
 *    }
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const i18n = editor.I18n;
 * ```
 *
 * @module I18n
 */
import messages from './messages';

export default () => {
  const { language } = window.navigator || {};
  const localeDef = language ? language.split('-')[0] : 'en';
  const config = {
    locale: localeDef,
    localeFallback: 'en',
    counter: 'n',
    messages
  };

  return {
    name: 'I18n',

    config,

    /**
     * Get module configurations
     * @returns {Object} Configuration object
     */
    getConfig() {
      return this.config;
    },

    /**
     * Update current locale
     * @param {String} locale Locale value
     * @returns {this}
     * @example
     * i18n.setLocale('it');
     */
    setLocale(locale) {
      this.config.locale = locale;
      return this;
    },

    /**
     * Get current locale
     * @returns {String} Current locale value
     */
    getLocale() {
      return this.config.locale;
    },

    /**
     * Initialize module
     * @param {Object} config Configurations
     * @private
     */
    init(opts = {}) {
      this.em = opts.em;
      return this;
    }
  };
};
