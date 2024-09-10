import en from './locale/en';

export interface I18nConfig {
  /**
   * Locale value.
   * @default 'en'
   */
  locale?: string;

  /**
   * Fallback locale.
   * @default 'en'
   */
  localeFallback?: string;

  /**
   * Detect locale by checking browser language.
   * @default true
   */
  detectLocale?: boolean;

  /**
   * Show warnings when some of the i18n resources are missing.
   * @default false
   */
  debug?: boolean;

  /**
   * Messages to translate.
   * @default { en: {...} }
   */
  messages?: Record<string, any>;

  /**
   * Additional messages. This allows extending the default `messages` set directly from the configuration.
   */
  messagesAdd?: Record<string, any>;
}

const config: I18nConfig = {
  locale: 'en',
  localeFallback: 'en',
  detectLocale: true,
  debug: false,
  messages: { en },
  messagesAdd: undefined,
};

export default config;
