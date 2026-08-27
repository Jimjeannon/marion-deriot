/**
 * Client Sanity — configuration et helpers de requête.
 * La région EU est obligatoire (RGPD).
 *
 * Le client n'est créé que si PUBLIC_SANITY_PROJECT_ID est un ID Sanity valide.
 */
import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import {
  getSanityDataset,
  getSanityProjectId,
  isSanityConfigured,
} from '@/lib/sanity-config';

export { isSanityConfigured, getSanityProjectId, getSanityDataset } from '@/lib/sanity-config';

let client: SanityClient | null = null;

function getSanityClient(): SanityClient {
  const projectId = getSanityProjectId();
  if (!projectId) {
    throw new Error(
      'Sanity non configuré : définissez PUBLIC_SANITY_PROJECT_ID dans .env (ID alphanumérique, ex. abc12xyz).'
    );
  }
  if (!client) {
    client = createClient({
      projectId,
      dataset: getSanityDataset(),
      apiVersion: '2024-01-01',
      useCdn: import.meta.env.PROD,
    });
  }
  return client;
}

// ─── Image URL builder ────────────────────────────────────────────────────────

/**
 * Génère une URL d'image Sanity avec paramètres de transformation.
 * Toujours utiliser cette fonction — jamais <img> brut.
 */
export function urlFor(source: SanityImageSource) {
  return imageUrlBuilder(getSanityClient()).image(source);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SanityImage {
  _type: 'image';
  /**
   * Référence Sanity (obligatoire si l'image vient du CMS).
   * Optionnelle pour les images locales servies depuis /public.
   */
  asset?: { _ref: string; _type: 'reference' };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: { fr: string; en: string };
  isPreview?: boolean;
  /**
   * Source locale — chemin public (ex. /images/projets/belleville/01.jpg).
   * Quand cette propriété est définie, on l'utilise prioritairement
   * sur la résolution Sanity (urlFor). Utile tant que Sanity n'est pas branché.
   */
  src?: string;
  /** Largeur intrinsèque en pixels (optionnel — pour CLS). */
  width?: number;
  /** Hauteur intrinsèque en pixels (optionnel — pour CLS). */
  height?: number;
  /** Format intrinsèque pour le layout : 'portrait' | 'landscape' | 'square'. */
  orientation?: 'portrait' | 'landscape' | 'square';
}

export interface SanityProject {
  _id: string;
  _type: 'project';
  title: { fr: string; en: string };
  slug: { fr: { current: string }; en: { current: string } };
  category: 'residential' | 'commercial' | 'hospitality' | 'other';
  year?: number;
  /** Lieu saisi dans l'admin (ex : "Paris 8ᵉ") */
  location?: string;
  /** Surface saisie dans l'admin (ex : "90 m²") */
  surface?: string;
  /** Maîtrise d'ouvrage saisie dans l'admin (ex : "maîtrise d'ouvrage privée") */
  clientType?: string;
  gallery: SanityImage[];
  seo?: {
    title?: { fr: string; en: string };
    description?: { fr: string; en: string };
    ogImage?: SanityImage;
  };
}

// ─── Requêtes GROQ ────────────────────────────────────────────────────────────

const PROJECT_FIELDS = `
  _id,
  title,
  slug,
  category,
  year,
  location,
  surface,
  clientType,
  "gallery": gallery[] {
    _type,
    asset,
    hotspot,
    crop,
    alt,
    isPreview
  },
  seo
`;

/**
 * Récupère tous les projets publiés, du plus récemment créé au plus ancien.
 * L'ordre de création permet d'afficher en tête les projets ajoutés via l'admin.
 */
export async function getAllProjects(): Promise<SanityProject[]> {
  if (!isSanityConfigured()) return [];
  return getSanityClient().fetch(
    `*[_type == "project"] | order(_createdAt desc) { ${PROJECT_FIELDS} }`
  );
}

/**
 * Récupère un projet par son slug (FR ou EN).
 */
export async function getProjectBySlug(
  slug: string,
  lang: 'fr' | 'en' = 'fr'
): Promise<SanityProject | null> {
  if (!isSanityConfigured()) return null;
  const field = lang === 'fr' ? 'slug.fr.current' : 'slug.en.current';
  return getSanityClient().fetch(
    `*[_type == "project" && ${field} == $slug][0] { ${PROJECT_FIELDS} }`,
    { slug }
  );
}

/**
 * Retourne les images de preview d'un projet (isPreview === true).
 * Maximum 3 images.
 */
export function getPreviewImages(project: SanityProject): SanityImage[] {
  return project.gallery.filter((img) => img.isPreview).slice(0, 3);
}

/**
 * Résout l'URL publique d'une image — source locale (src) en priorité,
 * sinon résolution Sanity. Retourne null si l'image n'a aucune source utilisable.
 *
 * Paramètre `width` : largeur cible en pixels pour la transformation Sanity
 * (ignoré pour les sources locales — l'image est servie telle quelle).
 * Paramètre `height` : si fourni avec `width`, recadre au format demandé
 * (fit crop) en respectant le hotspot défini dans Sanity Studio.
 */
export function resolveImageUrl(
  image: SanityImage | undefined | null,
  width?: number,
  height?: number
): string | null {
  if (!image) return null;
  if (image.src) return image.src;
  if (image.asset && isSanityConfigured()) {
    try {
      let builder = urlFor(image);
      if (width) builder = builder.width(width);
      if (width && height) builder = builder.height(height).fit('crop');
      return builder.auto('format').url();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Récupère le document "info" (photo + infos Marion Dériot)
 */
export async function getInfoDocument(): Promise<{
  title?: string;
  image?: SanityImage;
} | null> {
  if (!isSanityConfigured()) return null;
  return getSanityClient().fetch(
    `*[_type == "info" && _id == "info-main"][0] { title, image }`
  );
}
