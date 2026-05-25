/**
 * PATCH  /api/admin/projects/[id] — Met à jour les métadonnées d'un projet
 * DELETE /api/admin/projects/[id] — Supprime un projet
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

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ─── PATCH — mise à jour des métadonnées ─────────────────────────────────────

export const PATCH: APIRoute = async ({ cookies, request, params }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Non autorisé' }, 401);

  const { id } = params;
  if (!id) return json({ error: 'ID manquant' }, 400);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Corps invalide' }, 400);
  }

  try {
    const patch: Record<string, unknown> = {};

    if (body.title) {
      const t = body.title as { fr?: string; en?: string };
      patch.title = t;
      // Régénérer le slug à chaque renommage
      patch.slug = {
        fr: { _type: 'slug', current: t.fr ? slugify(t.fr) : '' },
        en: { _type: 'slug', current: t.en ? slugify(t.en) : '' },
      };
    }

    if (body.category) patch.category = body.category;
    // year peut être null (suppression)
    if ('year' in body) patch.year = body.year ?? null;

    const result = await getSanityWriteClient().patch(id).set(patch).commit();

    // ✨ Revalidation — invalider les pages projets après modification métadonnées
    if (typeof request.headers.get === 'function') {
      try {
        const projectData = result as { slug?: { fr?: { current?: string }; en?: { current?: string } } };
        const slugFr = projectData?.slug?.fr?.current;
        const slugEn = projectData?.slug?.en?.current;

        if (slugFr || slugEn) {
          const revalidatePaths = [];
          if (slugFr) revalidatePaths.push(`/projets/${slugFr}`);
          if (slugEn) revalidatePaths.push(`/en/projects/${slugEn}`);
          // Invalider aussi la liste des projets
          revalidatePaths.push('/projets', '/en/projects');

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

// ─── DELETE — suppression du projet ───────────────────────────────────────────

export const DELETE: APIRoute = async ({ cookies, request, params }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Non autorisé' }, 401);

  const { id } = params;
  if (!id) return json({ error: 'ID manquant' }, 400);

  try {
    const client = getSanityWriteClient();

    // Récupérer le projet avant suppression pour la revalidation
    const project = await client.fetch(
      `*[_type == "project" && _id == $id][0] { slug }`,
      { id }
    ) as { slug?: { fr?: { current?: string }; en?: { current?: string } } } | null;

    // Supprimer le projet
    await client.delete(id);

    // ✨ Revalidation — invalider les pages après suppression
    if (project && typeof request.headers.get === 'function') {
      try {
        const slugFr = project?.slug?.fr?.current;
        const slugEn = project?.slug?.en?.current;

        const revalidatePaths = [];
        if (slugFr) revalidatePaths.push(`/projets/${slugFr}`);
        if (slugEn) revalidatePaths.push(`/en/projects/${slugEn}`);
        // Toujours invalider les listes
        revalidatePaths.push('/projets', '/en/projects', '/projets/index', '/en/projects/index');

        for (const path of revalidatePaths) {
          try {
            await fetch(new URL(path, new URL(request.url).origin), {
              method: 'HEAD',
            }).catch(() => {});
          } catch {}
        }
      } catch {}
    }

    return json({ success: true, message: 'Projet supprimé' });
  } catch (err) {
    console.error('[delete] Sanity error:', err);
    return json({ error: String(err) }, 500);
  }
};
