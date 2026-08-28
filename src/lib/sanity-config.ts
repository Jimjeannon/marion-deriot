/**
 * Validation de la config Sanity — sans importer @sanity/client
 * (évite un crash au chargement si PUBLIC_SANITY_PROJECT_ID est un placeholder).
 */

const SANITY_PROJECT_ID_RE = /^[a-z0-9-]+$/;

/**
 * Projet et dataset Sanity du site.
 *
 * Ces deux valeurs ne sont pas des secrets : l'ID projet transite déjà dans
 * chaque URL d'image servie par le CDN Sanity, et le dataset est public sur
 * l'offre gratuite. Les inscrire ici évite deux variables d'environnement à
 * recopier sur chaque hébergeur. Seul le token d'écriture reste un secret.
 */
const PROJET_SANITY_PAR_DEFAUT = 't4wzgksq';
const DATASET_SANITY_PAR_DEFAUT = 'production';

/** Valeurs d'exemple .env — traitées comme « non configuré ». */
const PLACEHOLDER_PROJECT_IDS = new Set([
  'your_project_id_here',
  'your-project-id',
  'your_sanity_project_id',
  'xxx',
  'changeme',
]);

export function getSanityProjectId(): string | undefined {
  const raw = (import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? PROJET_SANITY_PAR_DEFAUT).trim();
  if (!raw || PLACEHOLDER_PROJECT_IDS.has(raw)) return undefined;
  if (!SANITY_PROJECT_ID_RE.test(raw)) return undefined;
  return raw;
}

export function getSanityDataset(): string {
  const dataset = (import.meta.env.PUBLIC_SANITY_DATASET ?? DATASET_SANITY_PAR_DEFAUT).trim();
  return /^[a-z0-9-]+$/.test(dataset) ? dataset : DATASET_SANITY_PAR_DEFAUT;
}

export function isSanityConfigured(): boolean {
  return getSanityProjectId() !== undefined;
}
