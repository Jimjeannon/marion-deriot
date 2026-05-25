// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
// import sitemap from '@astrojs/sitemap';

// Détection environnement Vercel — sinon on n'active pas l'analytics
// (évite des 404 sur /_vercel/insights/* si on déploie ailleurs)
const isVercel = !!process.env.VERCEL;

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://marionderiot.com',
  // hybrid : pages statiques + routes API dynamiques (/admin/*, /api/*)
  output: 'hybrid',
  adapter: vercel({
    webAnalytics: { enabled: isVercel },
    // Image service : on garde le default Astro (Sharp) côté serveur
    imageService: true,
    maxDuration: 30,
  }),
  devToolbar: { enabled: false },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    // TODO: Réactiver sitemap après fix de la config i18n
    // sitemap({
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
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
    // Évite des warnings de modules optionnels côté Sharp / Sanity en serverless
    ssr: {
      noExternal: ['@sanity/client', '@sanity/image-url'],
    },
  },
});
