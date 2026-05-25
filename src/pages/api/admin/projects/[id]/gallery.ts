/**
 * PATCH  /api/admin/projects/[id]/gallery — Remplace la galerie complète
 *        (réordonnancement + flags isPreview)
 * DELETE /api/admin/projects/[id]/gallery — Supprime une image par sa _key
 */
import type { APIRoute, AstroCookies } from 'astro';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth';
import { getSanityWriteClient } from '@/lib/sanity-write';

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

// ─── PATCH — remplacer la galerie ────────────────────────────────────────────

export const PATCH: APIRoute = async ({ cookies, request, params }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Non autorisé' }, 401);

  const { id } = params;
  if (!id) return json({ error: 'ID manquant' }, 400);

  let body: { gallery: unknown[] };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Corps invalide' }, 400);
  }

  if (!Array.isArray(body.gallery)) {
    return json({ error: 'gallery doit être un tableau' }, 400);
  }

  // Vérification : maximum 3 images marquées isPreview
  const previewCount = body.gallery.filter((img: unknown) => {
    return typeof img === 'object' && img !== null && (img as Record<string, unknown>).isPreview === true;
  }).length;

  if (previewCount > 3) {
    return json({ error: 'Maximum 3 images peuvent être marquées « Preview »' }, 400);
  }

  try {
    const result = await getSanityWriteClient()
      .patch(id)
      .set({ gallery: body.gallery })
      .commit();

    // ✨ Revalidation — invalider les pages projets après modification galerie
    if (typeof request.headers.get === 'function') {
      try {
        const projectData = result as { slug?: { fr?: { current?: string }; en?: { current?: string } } };
        const slugFr = projectData?.slug?.fr?.current;
        const slugEn = projectData?.slug?.en?.current;

        if (slugFr || slugEn) {
          const revalidatePaths = [];
          if (slugFr) revalidatePaths.push(`/projets/${slugFr}`);
          if (slugEn) revalidatePaths.push(`/en/projects/${slugEn}`);

          for (const path of revalidatePaths) {
            try {
              await fetch(new URL(path, new URL(request.url).origin), {
                method: 'HEAD',
              }).catch(() => {});
            } catch {}
          }
        }
      } catch {}
    }

    return json(result);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
};

// ─── DELETE — supprimer une image de la galerie ───────────────────────────────

export const DELETE: APIRoute = async ({ cookies, request, params }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Non autorisé' }, 401);

  const { id } = params;
  if (!id) return json({ error: 'ID manquant' }, 400);

  let body: { key: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Corps invalide' }, 400);
  }

  if (!body.key) return json({ error: 'key requis' }, 400);

  try {
    // Sanity : unset retire l'élément de tableau dont la _key correspond
    const result = await getSanityWriteClient()
      .patch(id)
      .unset([`gallery[_key=="${body.key}"]`])
      .commit();
    return json(result);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
};
