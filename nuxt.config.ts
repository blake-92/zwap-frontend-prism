import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/fonts',
  ],

  css: ['~/assets/css/globals.css'],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  i18n: {
    defaultLocale: 'es',
    strategy: 'no_prefix',
    // langDir is implicit in Nuxt 4: ./i18n/locales/
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'zwap-language',
      redirectOn: 'root',
    },
    compilation: {
      strictMessage: false,
    },
  },

  fonts: {
    families: [
      { name: 'Inter', weights: [400, 500, 600, 700], provider: 'google' },
      { name: 'JetBrains Mono', weights: [400, 700], provider: 'google' },
    ],
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    },
  },

  app: {
    head: {
      title: 'Zwap',
      titleTemplate: '%s · Zwap',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Zwap — Hotel payment platform' },
        { name: 'theme-color', content: '#7C3AED' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  nitro: {
    preset: 'cloudflare-pages',
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['@vuepic/vue-datepicker'],
    },
  },
})
