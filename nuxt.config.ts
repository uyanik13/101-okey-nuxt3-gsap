export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@kevinmarrec/nuxt-pwa',
    '@nuxtjs/tailwindcss',
    'nuxt-icon'
  ],
  pwa: {
    meta: {
      mobileAppIOS: true,
    },
    workbox: {
      enabled: false
    }
  },
  plugins: [

  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  css: [
    '@/assets/scss/tailwind.scss'
  ],
  vite: {
    optimizeDeps: {
      include: [
        'vue',
        'pinia',
      ],
      exclude: ['']
    },
  },
})