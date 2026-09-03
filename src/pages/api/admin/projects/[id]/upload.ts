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
// Netlify plafonne le corps d'une requete de fonction a 6 Mo base64 inclus,
// soit ~4,4 Mo de fichier reel. Annoncer 50 Mo faisait echouer l'envoi AVANT
// d'atteindre ce code : le navigateur recevait une erreur nue, sans message.
const MAX_SIZE_BYTES = 4.4 * 1024 * 1024; // ~4,4 Mo (limite hebergeur)

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
  if (!id) return json({ error: 'ID de projet manquant.', code: 'NO_PROJECT_ID' }, 400);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    console.warn('[upload] 400 NO_FORM_DATA : corps illisible (souvent = fichier trop lourd)');
    return json(
      {
        error:
          "Impossible de lire le fichier envoye. C'est presque toujours une image trop lourde : " +
          'exportez-la en moins de 4 Mo puis reessayez.',
        code: 'NO_FORM_DATA',
      },
      400
    );
  }

  const file = formData.get('image') as File | null;
  if (!file || typeof file === 'string' || !(file.size > 0)) {
    console.warn('[upload] 400 : aucun fichier exploitable');
    return json(
      {
        error:
          "Aucun fichier exploitable. Verifiez que l'image est bien telechargee sur " +
          "l'ordinateur (et pas seulement dans iCloud/OneDrive), puis reessayez.",
        code: 'EMPTY_FILE',
      },
      400
    );
  }

  const fallbackExt = (file.type && file.type.split('/')[1]) || 'jpg';
  const fileName = file.name && file.name.trim() ? file.name : 'image-' + Date.now() + '.' + fallbackExt;

  const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.heic', '.heif'];
  const nameLower = fileName.toLowerCase();
  const extOk = ALLOWED_EXT.some((e) => nameLower.endsWith(e));
  const typeOk = !file.type || ALLOWED_TYPES.includes(file.type);
  if (!extOk && !typeOk) {
    console.warn('[upload] 400 : format non supporte', fileName, file.type);
    return json(
      { error: `Format non supporte (${file.type || 'inconnu'}). Acceptes : JPEG, PNG, WebP, AVIF.`, code: 'BAD_FORMAT' },
      400
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    console.warn('[upload] 400 : trop volumineux', file.size);
    return json(
      {
        error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum 4 Mo.`,
        code: 'TOO_LARGE',
      },
      400
    );
  }

  // isPreview transmis depuis le formulaire (champ texte "true"/"false")
  const isPreviewRaw = formData.get('isPreview');
  let isPreview = isPreviewRaw === 'true';
  let downgraded = false;

  try {
    const client = getSanityWriteClient();

    // Vérification : max 3 images preview déjà présentes dans le projet
    if (isPreview) {
      const project = await client.fetch(
        `*[_type == "project" && _id == $id][0] { "previewCount": count(gallery[isPreview == true]) }`,
        { id }
      );
      if (project?.previewCount >= 2) {
        // Au-dela de 2 previews : on ajoute l'image en galerie au lieu de bloquer.
        isPreview = false;
        downgraded = true;
      }
    }

    // 1. Upload vers Sanity Assets
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await client.assets.upload('image', buffer, {
      filename: fileName,
      contentType: file.type || undefined,
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

    return json({ assetId: asset._id, url: asset.url, filename: asset.originalFilename, isPreview, downgraded }, 201);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[upload] Sanity error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    const isAuth = /unauthorized|permission|token|401|403/i.test(msg);
    return json(
      {
        error: isAuth
          ? "Sanity a refuse l'ecriture : le jeton d'acces est invalide ou expire. Previenez l'administrateur du site."
          : `Erreur Sanity : ${msg}`,
        code: isAuth ? 'SANITY_AUTH' : 'SANITY_ERROR',
      },
      500
    );
  }
};
