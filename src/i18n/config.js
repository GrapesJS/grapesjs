import en from './locale/en';

export default {
  // Locale value
  locale: 'en',

  // Fallback locale
  localeFallback: 'en',

  // Detect locale by checking browser language
  detectLocale: true,

  // Show warnings when some of the i18n resources are missing
  debug: false,

  // Messages to translate
  messages: {
    en,
  },

  // Additional messages. This allows extending the default `messages` set directly from the configuration.
  messagesAdd: null,
};
