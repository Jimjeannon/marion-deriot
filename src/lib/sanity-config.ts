/**
 * Validation de la config Sanity — sans importer @sanity/client
 * (évite un crash au chargement si PUBLIC_SANITY_PROJECT_ID est un placeholder).
 */

const SANITY_PROJECT_ID_RE = /^[a-z0-9-]+$/;

/** Valeurs d'exemple .env — traitées comme « non configuré ». */
const PLACEHOLDER_PROJECT_IDS = new Set([
  'your_project_id_here',
  'your-project-id',
  'your_sanity_project_id',
  'xxx',
  'changeme',
]);

export function getSanityProjectId(): string | undefined {
  const raw = import.meta.env.PUBLIC_SANITY_PROJECT_ID?.trim();
  if (!raw || PLACEHOLDER_PROJECT_IDS.has(raw)) return undefined;
  if (!SANITY_PROJECT_ID_RE.test(raw)) return undefined;
  return raw;
}

export function getSanityDataset(): string {
  const dataset = import.meta.env.PUBLIC_SANITY_DATASET?.trim();
  return dataset && /^[a-z0-9-]+$/.test(dataset) ? dataset : 'production';
}

export function isSanityConfigured(): boolean {
  return getSanityProjectId() !== undefined;
}
