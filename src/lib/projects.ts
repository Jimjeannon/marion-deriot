/**
 * Accès aux projets — catalogue local par défaut, Sanity si configuré.
 */
import { PROJECTS_CATALOG } from '@/data/projects-catalog';
import { isSanityConfigured } from '@/lib/sanity-config';
import {
  getAllProjects as getSanityProjects,
  getProjectBySlug as getSanityProjectBySlug,
  type SanityImage,
  type SanityProject,
} from '@/lib/sanity';
import type { Locale } from '@/i18n';

export type ProjectCategory = 'residential' | 'commercial' | 'hospitality' | 'other';

export interface LocalizedString {
  fr: string;
  en: string;
}

export interface SiteProject {
  id: string;
  title: LocalizedString;
  slug: { fr: { current: string }; en: { current: string } };
  category: ProjectCategory;
  surface?: string;
  location?: LocalizedString;
  description: LocalizedString;
  /** Courte mention affichée sur les cards et la page projet, ex. "Maîtrise d'ouvrage privée" */
  brief?: string;
  year?: number;
  imageCount?: number;
  gallery: SanityImage[];
  photographer?: string;
  seo?: SanityProject['seo'];
}

function isSanityProject(project: SanityProject | SiteProject): project is SanityProject {
  return '_id' in project;
}

/**
 * Ordre éditorial de référence, défini par l'ordre du catalogue local
 * (PROJECTS_CATALOG). Sanity ne garantit pas d'ordre stable (la plupart des
 * projets n'ont pas d'année), on force donc l'ordre voulu par la cliente.
 * Les projets absents du catalogue sont renvoyés en fin de liste.
 */
const CATALOG_ORDER = new Map(
  PROJECTS_CATALOG.map((p, index) => [p.slug.fr.current, index])
);

/**
 * Documents Sanity parasites (doublons / tests) à ne jamais afficher publiquement.
 * À retirer d'ici si les documents sont supprimés dans /admin.
 */
const EXCLUDED_SLUGS = new Set(['folie-mericourt', 'cdg-charles-de-gaulle']);

function catalogRank(project: SiteProject): number {
  const rank = CATALOG_ORDER.get(project.slug.fr.current);
  return rank === undefined ? Number.MAX_SAFE_INTEGER : rank;
}

function sortByCatalogOrder(projects: SiteProject[]): SiteProject[] {
  return [...projects].sort((a, b) => catalogRank(a) - catalogRank(b));
}

/** Fusionne un document Sanity avec les métadonnées du catalogue local (surface, lieu, descriptif). */
function mergeWithCatalog(sanityProject: SanityProject): SiteProject {
  const slugFr = sanityProject.slug.fr.current;
  const local = PROJECTS_CATALOG.find((p) => p.slug.fr.current === slugFr);

  // Les champs saisis dans l'admin (Sanity) priment sur le catalogue local.
  const sanityLocation = sanityProject.location
    ? { fr: sanityProject.location, en: sanityProject.location }
    : undefined;

  if (!local) {
    return {
      id: sanityProject._id,
      title: sanityProject.title,
      slug: sanityProject.slug,
      category: sanityProject.category,
      surface: sanityProject.surface,
      location: sanityLocation,
      brief: sanityProject.clientType,
      description: {
        fr: sanityProject.seo?.description?.fr ?? '',
        en: sanityProject.seo?.description?.en ?? '',
      },
      year: sanityProject.year,
      gallery: sanityProject.gallery ?? [],
      seo: sanityProject.seo,
    };
  }
  return {
    ...local,
    title: sanityProject.title,
    slug: sanityProject.slug,
    category: sanityProject.category,
    surface: sanityProject.surface ?? local.surface,
    location: sanityLocation ?? local.location,
    brief: sanityProject.clientType ?? local.brief,
    year: sanityProject.year ?? local.year,
    // Sanity ne prime que s'il a réellement des images : un projet créé dans
    // l'admin sans photo ne doit pas effacer la galerie du catalogue local.
    gallery: sanityProject.gallery?.length ? sanityProject.gallery : local.gallery,
    seo: sanityProject.seo,
  };
}

export async function getAllProjects(): Promise<SiteProject[]> {
  if (isSanityConfigured()) {
    try {
      // Sanity renvoie les projets du plus récent au plus ancien (order _createdAt desc).
      // On écarte les documents parasites connus (doublons / tests).
      const sanityProjects = (await getSanityProjects()).filter(
        (p) => !EXCLUDED_SLUGS.has(p.slug.fr.current)
      );

      const siteProjects = sanityProjects.map(mergeWithCatalog);

      // Projets Sanity ajoutés via l'admin (absents du catalogue) : affichés EN TÊTE,
      // du plus récent au plus ancien (ordre déjà fourni par la requête Sanity).
      const newFromAdmin = siteProjects.filter(
        (p) => !CATALOG_ORDER.has(p.slug.fr.current)
      );

      // Projets du catalogue (via Sanity ou locaux) : conservés dans l'ordre éditorial.
      const inCatalog = siteProjects.filter((p) => CATALOG_ORDER.has(p.slug.fr.current));
      const sanitySlugsFr = new Set(sanityProjects.map((p) => p.slug.fr.current));
      const catalogOnly = PROJECTS_CATALOG.filter(
        (p) => !sanitySlugsFr.has(p.slug.fr.current)
      );
      const catalogSorted = sortByCatalogOrder([...inCatalog, ...catalogOnly]);

      return [...newFromAdmin, ...catalogSorted];
    } catch {
      /* fallback catalogue local */
    }
  }
  return PROJECTS_CATALOG;
}

export async function getProjectBySlug(
  slug: string,
  lang: Locale = 'fr'
): Promise<SiteProject | null> {
  if (isSanityConfigured()) {
    try {
      const project = await getSanityProjectBySlug(slug, lang);
      if (project) return mergeWithCatalog(project);
    } catch {
      /* catalogue local */
    }
  }
  return (
    PROJECTS_CATALOG.find((p) =>
      lang === 'fr' ? p.slug.fr.current === slug : p.slug.en.current === slug
    ) ?? null
  );
}

export function getProjectSlug(project: SiteProject, lang: Locale): string {
  return lang === 'fr' ? project.slug.fr.current : project.slug.en.current;
}

export function getLocalized<T extends LocalizedString>(
  value: T | undefined,
  lang: Locale
): string {
  if (!value) return '';
  return value[lang] ?? value.fr;
}

export function getProjectMetaLine(project: SiteProject, lang: Locale): string | null {
  const parts: string[] = [];
  const location = getLocalized(project.location, lang);
  if (location) parts.push(location);
  if (project.surface) parts.push(project.surface);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function getPreviewImages(project: SiteProject): SanityImage[] {
  const preview = project.gallery.filter((img) => img.isPreview).slice(0, 3);
  if (preview.length > 0) return preview;
  return project.gallery.slice(0, 3);
}

export { isSanityProject };
