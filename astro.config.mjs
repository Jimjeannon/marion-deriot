// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
// import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://marionderiot.com',
  // hybrid : toutes les pages sont statiques par défaut sauf celles qui
  // déclarent explicitement `export const prerender = false` (admin + API).
  output: 'hybrid',
  adapter: vercel({
    webAnalytics: {
      enabled: true, // Vercel Web Analytics — cookieless, pas de consentement
    },
    functionPerRoute: false,
  }),
  devToolbar: { enabled: false },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    // TODO: Réactiver sitemap après fix de la config i18n
    // sitemap({
    //   // Exclude admin routes
    //   filter: (page) => !page?.includes('/admin'),
    // }),
  ],
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    // Optimisation build
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  },
});
