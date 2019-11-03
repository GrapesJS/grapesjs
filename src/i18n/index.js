/**
 * You can customize the initial state of the module from the editor initialization
 * ```js
 * const editor = grapesjs.init({
 *  i18n: {
 *    locale: 'en',
 *    localeFallback: 'en',
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
 * ### Events
 * * `i18n:add` - New set of messages is added
 * * `i18n:update` - The set of messages is updated
 * * `i18n:locale` - Locale changed
 *
 * @module I18n
 */
import { keys, isUndefined } from 'underscore';
import config from './config';

export default () => {
  return {
    name: 'I18n',

    config,

    /**
     * Initialize module
     * @param {Object} config Configurations
     * @private
     */
    init(opts = {}) {
      this.config = { ...config, ...opts };

      if (this.config.detectLocale) {
        this.config.locale = this._localLang();
      }

      this.em = opts.em;
      return this;
    },

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
      const { em, config } = this;
      const evObj = { value: locale, valuePrev: config.locale };
      em && em.trigger('i18n:locale', evObj);
      config.locale = locale;
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
     * Get all messages
     * @param {String} [lang] Specify the language of messages to return
     * @param {Object} [opts] Options
     * @param {Boolean} [opts.debug] Show warnings in case of missing language
     * @returns {Object}
     * @example
     * i18n.getMessages();
     * // -> { en: { hello: '...' }, ... }
     * i18n.getMessages('en');
     * // -> { hello: '...' }
     */
    getMessages(lang, opts = {}) {
      const { messages } = this.config;
      lang &&
        !messages[lang] &&
        this._debug(`'${lang}' i18n lang not found`, opts);
      return lang ? messages[lang] : messages;
    },

    /**
     * Set new set of messages
     * @param {Object} msg Set of messages
     * @returns {this}
     * @example
     * i18n.getMessages();
     * // -> { en: { msg1: 'Msg 1', msg2: 'Msg 2', } }
     * i18n.setMessages({ en: { msg2: 'Msg 2 up', msg3: 'Msg 3', } });
     * // Set replaced
     * i18n.getMessages();
     * // -> { en: { msg2: 'Msg 2 up', msg3: 'Msg 3', } }
     */
    setMessages(msg) {
      const { em, config } = this;
      config.messages = msg;
      em && em.trigger('i18n:update', msg);
      return this;
    },

    /**
     * Update messages
     * @param {Object} msg Set of messages to add
     * @returns {this}
     * @example
     * i18n.getMessages();
     * // -> { en: { msg1: 'Msg 1', msg2: 'Msg 2', } }
     * i18n.addMessages({ en: { msg2: 'Msg 2 up', msg3: 'Msg 3', } });
     * // Set updated
     * i18n.getMessages();
     * // -> { en: { msg1: 'Msg 1', msg2: 'Msg 2 up', msg3: 'Msg 3', } }
     */
    addMessages(msg) {
      const { em } = this;
      const { messages } = this.config;
      em && em.trigger('i18n:add', msg);

      keys(msg).forEach(lang => {
        const langSet = msg[lang];
        const currentSet = messages[lang];

        if (!currentSet) {
          messages[lang] = langSet;
        } else {
          keys(langSet).forEach(key => {
            currentSet[key] = langSet[key];
          });
        }
      });
      this.setMessages(messages); // Need this for the event

      return this;
    },

    /**
     * Translate the locale message
     * @param {String} key Label to translate
     * @param {Object} [opts] Options for the translation
     * @param {Object} [opts.params] Params for the translation
     * @param {Boolean} [opts.debug] Show warnings in case of missing resources
     * @returns {String}
     * @example
     * obj.setMessages({
     *  en: { msg: 'Msg', msg2: 'Msg {test}'},
     *  it: { msg2: 'Msg {test} it'},
     * });
     * obj.t('msg');
     * // -> outputs `Msg`
     * obj.t('msg2', { params: { test: 'hello' } });  // use params
     * // -> outputs `Msg hello`
     * obj.t('msg2', { l: 'it', params: { test: 'hello' } });  // custom local
     * // -> outputs `Msg hello it`
     */
    t(key, opts = {}) {
      const { config } = this;
      const param = opts.params || {};
      const locale = opts.l || this.getLocale();
      const localeFlb = opts.lFlb || config.localeFallback;
      let result = this._getMsg(key, locale, opts);

      // Try with fallback
      if (!result) result = this._getMsg(key, localeFlb, opts);

      !result &&
        this._debug(`'${key}' i18n key not found in '${locale}' lang`, opts);
      result = result ? this._addParams(result, param) : result;

      return result;
    },

    _localLang() {
      const nav = window.navigator || {};
      const lang = nav.language || nav.userLanguage;
      return lang ? lang.split('-')[0] : 'en';
    },

    _addParams(str, params) {
      const reg = new RegExp(`\{([\\w\\d-]*)\}`, 'g');
      return str.replace(reg, (m, val) => params[val] || '').trim();
    },

    _getMsg(key, locale, opts = {}) {
      const msgSet = this.getMessages(locale, opts);

      // Lang set is missing
      if (!msgSet) return;

      let result = msgSet[key];

      // Check for nested getter
      if (!result && key.indexOf('.') > 0) {
        result = key.split('.').reduce((lang, key) => {
          if (isUndefined(lang)) return;
          return lang[key];
        }, msgSet);
      }

      return result;
    },

    _debug(str, opts = {}) {
      const { em, config } = this;
      (opts.debug || config.debug) && em && em.logWarning(str);
    }
  };
};
