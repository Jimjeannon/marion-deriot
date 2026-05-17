// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // URL du site — nécessaire pour le sitemap et les hreflang
  site: 'https://marionderiot.com',

  // Rendu hybride : SSG par défaut, SSR pour l'API contact et /admin
  output: 'hybrid',

  // Désactiver la barre de dev Astro (gêne la landing page)
  devToolbar: { enabled: false },

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      // Exclure /admin du sitemap — OBLIGATOIRE (CLAUDE.md)
      filter: (page) => !page.includes('/admin'),
      // i18n : générer les entrées alternates FR/EN
      i18n: {
        defaultLocale: 'fr',
        locales: {
          fr: 'fr-FR',
          en: 'en-US',
        },
      },
      // Priorités par type de page
      customPages: [
        'https://marionderiot.com/',
        'https://marionderiot.com/home',
        'https://marionderiot.com/projets',
        'https://marionderiot.com/info',
      ],
    }),
  ],

  // i18n — FR par défaut, EN sur /en/
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  // View Transitions activées par défaut via le layout
  // (activées composant par composant avec <ViewTransitions />)

  // Alias d'imports configurés dans tsconfig.json
  vite: {
    // Variables d'env : uniquement via import.meta.env, jamais committées
  },
});
