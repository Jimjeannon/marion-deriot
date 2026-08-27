/**
 * GET  /api/admin/projects -- Liste tous les projets (pour l'admin)
 * POST /api/admin/projects -- Cree un nouveau projet
 */
import type { APIRoute, AstroCookies } from 'astro';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth';
import {
  getSanityWriteClient,
  isSanityWriteConfigured,
  ADMIN_PROJECTS_QUERY,
} from '@/lib/sanity-write';

export const prerender = false;

function isAuthorized(cookies: AstroCookies): boolean {
  return verifySessionToken(cookies.get(SESSION_COOKIE_NAME)?.value);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET
export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Non autorise' }, 401);

  if (!isSanityWriteConfigured()) {
    return json({ error: 'Sanity non configure', sanityMissing: true }, 503);
  }

  try {
    const projects = await getSanityWriteClient().fetch(ADMIN_PROJECTS_QUERY);
    return json(projects);
  } catch (err) {
    console.error('[admin/projects GET] Sanity error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
};

// POST
export const POST: APIRoute = async ({ cookies, request }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Non autorise' }, 401);

  let body: {
    title?: { fr?: string; en?: string };
    category?: string;
    year?: number;
    location?: string;
    surface?: string;
    clientType?: string;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Corps invalide' }, 400);
  }

  if (!body.title?.fr?.trim() || !body.title?.en?.trim()) {
    return json({ error: 'Titre FR et EN requis' }, 400);
  }

  const slugify = (s: string) =>
    s.trim().toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const titleFr = body.title.fr.trim().toUpperCase();
  const titleEn = body.title.en.trim().toUpperCase();

  const extra: Record<string, unknown> = {};
  if (body.year) extra.year = body.year;
  if (body.location?.trim()) extra.location = body.location.trim();
  if (body.surface?.trim()) extra.surface = body.surface.trim();
  if (body.clientType?.trim()) extra.clientType = body.clientType.trim();

  try {
    const client = getSanityWriteClient();
    const doc = await client.create({
      _type: 'project',
      title: { fr: titleFr, en: titleEn },
      slug: {
        fr: { _type: 'slug', current: slugify(body.title.fr) },
        en: { _type: 'slug', current: slugify(body.title.en) },
      },
      category: body.category || 'residential',
      ...extra,
      gallery: [],
    });
    return json(doc, 201);
  } catch (err) {
    console.error('[admin/projects POST] Sanity error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
};
