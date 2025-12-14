/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ['en', 'pt-BR'],
  sourceLocale: 'en',
  fallbackLocales: {
    default: 'pt-BR',
  },
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  format: 'po',
  compileNamespace: 'es',
}
