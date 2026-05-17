/**
 * Point d'entrée i18n — utilitaires pour accéder aux dictionnaires
 */
import { fr } from './fr';
import { en } from './en';

export type Locale = 'fr' | 'en';

export const defaultLocale: Locale = 'fr';

export const dictionaries = { fr, en } as const;

/**
 * Retourne le dictionnaire UI pour la locale donnée.
 * Utilisation dans les composants Astro :
 *   const t = getDict(Astro.currentLocale ?? 'fr');
 */
export function getDict(locale: string) {
  const key = locale as Locale;
  return dictionaries[key] ?? dictionaries[defaultLocale];
}

/** Segments de route FR → EN (hors préfixe /en). */
const EN_ROUTE_SEGMENTS: Record<string, string> = {
  '/projets': '/projects',
};

function toEnglishPath(path: string): string {
  for (const [fr, en] of Object.entries(EN_ROUTE_SEGMENTS)) {
    if (path === fr) return en;
    if (path.startsWith(`${fr}/`)) return `${en}${path.slice(fr.length)}`;
  }
  return path;
}

/**
 * Retourne l'URL traduite pour une page donnée.
 * Ex : getLangUrl('fr', '/projets/cambaceres') → '/projets/cambaceres'
 *      getLangUrl('en', '/projets/cambaceres') → '/en/projects/cambaceres'
 */
export function getLangUrl(locale: Locale, path: string): string {
  if (locale === defaultLocale) return path;
  return `/en${toEnglishPath(path)}`;
}

/** URL d'une fiche projet selon la locale. */
export function getProjectUrl(locale: Locale, slug: string): string {
  return getLangUrl(locale, `/projets/${slug}`);
}
