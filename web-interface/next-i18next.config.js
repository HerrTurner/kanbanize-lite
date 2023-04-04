
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  },
  fallbackLng: {
    default: ['en'],
  },
  localePath:
  typeof window === 'undefined'
    ? require('path').resolve('./public/locales')
    : '/locales',

    reloadOnPrerender: process.env.NODE_ENV === 'development',

};