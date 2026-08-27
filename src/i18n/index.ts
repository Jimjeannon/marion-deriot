/**
 * Point d'entrée i18n — utilitaires pour accéder aux dictionnaires
 * ⚠️ Version FR uniquement (EN supprimée)
 */
import { fr } from './fr';

export type Locale = 'fr';

export const defaultLocale: Locale = 'fr';

export const dictionaries = { fr } as const;

/**
 * Retourne le dictionnaire UI pour la locale donnée.
 * Utilisation dans les composants Astro :
 *   const t = getDict('fr');
 */
export function getDict(locale: string): typeof fr {
  return dictionaries.fr;
}

/** URL pour une page donnée (toujours FR, pas de préfixe). */
export function getLangUrl(locale: Locale, path: string): string {
  return path;
}

/** URL d'une fiche projet. */
export function getProjectUrl(locale: Locale, slug: string): string {
  return `/projets/${slug}`;
}
