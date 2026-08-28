/**
 * POST /api/admin/auth  — Connexion (vérification du code, pose du cookie)
 * DELETE /api/admin/auth — Déconnexion (suppression du cookie)
 */
import type { APIRoute } from 'astro';
import {
  checkAdminCode,
  diagnostiquerCode,
  createSessionToken,
  buildSetCookieHeader,
} from '@/lib/admin-auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Corps de requête invalide' }, 400);
  }

  if (!body.code || !checkAdminCode(body.code)) {
    // DIAGNOSTIC TEMPORAIRE — à retirer une fois la connexion rétablie.
    const diag = diagnostiquerCode(body.code ?? '');
    console.error('[admin/auth] echec de connexion', diag);

    // Délai intentionnel pour limiter le brute-force
    await new Promise((r) => setTimeout(r, 500));
    return json({ error: 'Code incorrect', diag }, 401);
  }

  const token = createSessionToken();
  return json(
    { success: true },
    200,
    { 'Set-Cookie': buildSetCookieHeader(token) }
  );
};

export const DELETE: APIRoute = async () => {
  return json(
    { success: true },
    200,
    { 'Set-Cookie': buildSetCookieHeader('', true) }
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
