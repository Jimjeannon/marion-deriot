/**
 * Client Sanity avec droits d'écriture — serveur uniquement.
 *
 * Requiert SANITY_API_WRITE_TOKEN (token Editor ou supérieur, sans préfixe PUBLIC_).
 * Ne jamais importer ce module côté client.
 */
import { createClient, type SanityClient } from '@sanity/client';
import { getSanityProjectId, getSanityDataset } from '@/lib/sanity-config';

/** Vérifie si Sanity est correctement configuré pour les opérations d'écriture. */
export function isSanityWriteConfigured(): boolean {
  const token = getWriteToken();
  return !!(getSanityProjectId() && token && token !== 'your_write_token_here');
}

/*
 * Vite fige les `import.meta.env.X` au moment du build. Sur Netlify, une
 * variable ajoutée ou modifiée APRÈS le dernier déploiement n'y figure donc
 * pas — d'où le repli sur `process.env`, lu à l'exécution de la fonction.
 * L'accès statique est conservé en premier : c'est lui qui fonctionne en dev.
 */
/** Token d'écriture — seul secret réel, jamais écrit dans le dépôt. */
function getWriteToken(): string | undefined {
  return import.meta.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN;
}

/** Crée un client Sanity avec droits d'écriture (nouveau client à chaque appel pour garantir le bon token). */
export function getSanityWriteClient(): SanityClient {
  if (!isSanityWriteConfigured()) {
    throw new Error(
      "Sanity non configuré : la variable SANITY_API_WRITE_TOKEN est absente de l'environnement."
    );
  }
  return createClient({
    projectId: getSanityProjectId()!,
    dataset: getSanityDataset(),
    apiVersion: '2024-01-01',
    token: getWriteToken(),
    useCdn: false,
  });
}

/** GROQ : tous les champs nécessaires à l'interface admin. */
export const ADMIN_PROJECTS_QUERY = `
  *[_type == "project"] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    slug,
    category,
    year,
    location,
    surface,
    clientType,
    "gallery": gallery[] {
      _key,
      _type,
      "asset": asset { _type, _ref },
      hotspot,
      crop,
      alt,
      isPreview,
      "url": asset->url,
      "filename": asset->originalFilename
    }
  }
`;
