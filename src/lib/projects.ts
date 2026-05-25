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
  year?: number;
  imageCount?: number;
  gallery: SanityImage[];
  seo?: SanityProject['seo'];
}

function isSanityProject(project: SanityProject | SiteProject): project is SanityProject {
  return '_id' in project;
}

/** Fusionne un document Sanity avec les métadonnées du catalogue local (surface, lieu, descriptif). */
function mergeWithCatalog(sanityProject: SanityProject): SiteProject {
  const slugFr = sanityProject.slug.fr.current;
  const local = PROJECTS_CATALOG.find((p) => p.slug.fr.current === slugFr);
  if (!local) {
    return {
      id: sanityProject._id,
      title: sanityProject.title,
      slug: sanityProject.slug,
      category: sanityProject.category,
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
    year: sanityProject.year ?? local.year,
    gallery: sanityProject.gallery ?? [],
    seo: sanityProject.seo,
  };
}

export async function getAllProjects(): Promise<SiteProject[]> {
  if (isSanityConfigured()) {
    try {
      const sanityProjects = await getSanityProjects();
      const siteProjects = sanityProjects.map(mergeWithCatalog);

      // Inclure aussi les projets du catalogue local pas encore migrés vers Sanity
      const sanitySlugsFr = new Set(sanityProjects.map((p) => p.slug.fr.current));
      const catalogOnly = PROJECTS_CATALOG.filter(
        (p) => !sanitySlugsFr.has(p.slug.fr.current)
      );

      return [...siteProjects, ...catalogOnly];
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
  if (project.surface) parts.push(project.surface);
  const location = getLocalized(project.location, lang);
  if (location) parts.push(location);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function getPreviewImages(project: SiteProject): SanityImage[] {
  const preview = project.gallery.filter((img) => img.isPreview).slice(0, 3);
  if (preview.length > 0) return preview;
  return project.gallery.slice(0, 3);
}

export { isSanityProject };
