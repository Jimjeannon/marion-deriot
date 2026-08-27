// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';
// import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://marionderiot.com',
  // hybrid : pages statiques + routes API dynamiques (/admin/*, /api/*)
  output: 'hybrid',
  adapter: netlify(),
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
    locales: ['fr'],  // ⚠️ Anglais supprimé — site FR uniquement
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
  },
});
