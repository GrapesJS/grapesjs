import en from './locale/en';
import it from './locale/it';
import tr from './locale/tr';
import zh from './locale/zh-cn';

let defaultLang = 'en';

let allLangs = [
  {
    locale: defaultLang,
    localeFallback: defaultLang,
    detectLocale: 1,
    debug: 0,
    messages: { en }
  },
  {
    locale: 'it',
    localeFallback: 'it',
    detectLocale: 1,
    debug: 0,
    messages: { it }
  },
  {
    locale: 'tr',
    localeFallback: 'tr',
    detectLocale: 1,
    debug: 0,
    messages: { tr }
  },
  {
    locale: 'zh',
    localeFallback: 'zh',
    detectLocale: 1,
    debug: 1,
    messages: { zh }
  }
];

let getLangConfig = locale => {
  if (!locale) {
    console.warn('the locale is null');
    return null;
  }

  let config = null;
  allLangs.forEach(item => {
    if (item.locale === locale) {
      config = item;
      return true;
    }
  });
  if (config == null)
    console.error('can not find config from [' + locale + ']');
  return config;
};
export { defaultLang, getLangConfig };
