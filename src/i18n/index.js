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
  let em;
  let config;
  const { language } = window.navigator || {};
  const localeDef = language ? language.split('-')[0] : 'en';
  const configDef = {
    locale: localeDef,
    localeFallback: 'en',
    counter: 'n',
    messages
  };

  return {
    name: 'I18n',

    /**
     * Get module configurations
     * @returns {Object} Configuration object
     */
    getConfig() {
      return config;
    },

    /**
     * Initialize module
     * @param {Object} config Configurations
     * @private
     */
    init(opts = {}) {
      config = { ...configDef, ...opts };
      em = opts.em;
      this.em = em;
      return this;
    }
  };
};
