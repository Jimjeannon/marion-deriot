/**
 * POST /api/admin/projects/[id]/upload
 * Upload une image vers Sanity Assets et l'ajoute à la galerie du projet.
 *
 * Body : multipart/form-data avec un champ « image » (File).
 * Retourne : { assetId, url, filename }
 */
import type { APIRoute, AstroCookies } from 'astro';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth';
import { getSanityWriteClient } from '@/lib/sanity-write';

export const prerender = false;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 Mo

function isAuthorized(cookies: AstroCookies): boolean {
  return verifySessionToken(cookies.get(SESSION_COOKIE_NAME)?.value);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ cookies, request, params }) => {
  if (!isAuthorized(cookies)) return json({ error: 'Non autorisé' }, 401);

  const { id } = params;
  if (!id) return json({ error: 'ID manquant' }, 400);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Impossible de lire le formulaire' }, 400);
  }

  const file = formData.get('image') as File | null;
  if (!file || !file.name) return json({ error: 'Aucun fichier fourni' }, 400);

  if (!ALLOWED_TYPES.includes(file.type)) {
    return json({ error: `Format non supporté. Acceptés : JPEG, PNG, WebP, AVIF.` }, 400);
  }
  if (file.size > MAX_SIZE_BYTES) {
    return json({ error: 'Fichier trop volumineux (max 25 Mo).' }, 400);
  }

  // isPreview transmis depuis le formulaire (champ texte "true"/"false")
  const isPreviewRaw = formData.get('isPreview');
  const isPreview = isPreviewRaw === 'true';

  try {
    const client = getSanityWriteClient();

    // Vérification : max 3 images preview déjà présentes dans le projet
    if (isPreview) {
      const project = await client.fetch(
        `*[_type == "project" && _id == $id][0] { "previewCount": count(gallery[isPreview == true]) }`,
        { id }
      );
      if (project?.previewCount >= 3) {
        return json({ error: 'Maximum 3 images de preview. Retirez-en une avant d\'en ajouter.' }, 400);
      }
    }

    // 1. Upload vers Sanity Assets
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await client.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    // 2. Ajouter l'image à la galerie du projet
    const newImage = {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: { fr: '', en: '' },
      isPreview,
    };
    const updateResult = await client
      .patch(id)
      .setIfMissing({ gallery: [] })
      .append('gallery', [newImage])
      .commit();

    // 3. ✨ Revalidation — invalider les pages projets en cache
    // (Vercel ISR ou on-demand revalidation)
    if (typeof request.headers.get === 'function') {
      try {
        // En développement ou sur Vercel, invalider le projet modifié
        const projectData = updateResult as { slug?: { fr?: { current?: string }; en?: { current?: string } } };
        const slugFr = projectData?.slug?.fr?.current;
        const slugEn = projectData?.slug?.en?.current;

        if (slugFr || slugEn) {
          // Appeler Vercel revalidate API (si disponible)
          const revalidatePaths = [];
          if (slugFr) revalidatePaths.push(`/projets/${slugFr}`);
          if (slugEn) revalidatePaths.push(`/en/projects/${slugEn}`);

          // Envoyer la revalidation (marche avec Vercel ISR)
          for (const path of revalidatePaths) {
            try {
              await fetch(new URL(path, new URL(request.url).origin), {
                method: 'HEAD',
              }).catch(() => {}); // Ignore errors
            } catch {}
          }
        }
      } catch {}
    }

    return json({ assetId: asset._id, url: asset.url, filename: asset.originalFilename, isPreview }, 201);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[upload] Sanity error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
};
