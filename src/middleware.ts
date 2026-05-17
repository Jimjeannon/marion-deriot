/**
 * Middleware Astro — Headers de sécurité HTTP
 *
 * - En développement : CSP désactivée (évite les conflits avec les scripts
 *   inline de Vite/Astro HMR et les scripts de debug).
 * - En production : CSP stricte compatible avec les scripts Astro.
 *
 * Note sur 'strict-dynamic' : incompatible avec les scripts inline générés
 * par Astro (View Transitions, islands, <script> blocks). On utilise à la
 * place 'unsafe-inline' + sources explicites. En production avancée, générer
 * un nonce par requête et l'injecter dans chaque <script>.
 */
import { defineMiddleware } from 'astro:middleware';

// ─── Content Security Policy (production uniquement) ─────────────────────────

const buildCSP = (): string => {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],

    // Astro génère des <script type="module"> inline et des scripts inline
    // pour les View Transitions, islands, et blocs <script> de composants.
    // 'unsafe-inline' est nécessaire. En production avancée : passer aux nonces.
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      // Plausible Analytics (à décommenter quand actif)
      // 'https://plausible.io',
    ],

    'style-src': [
      "'self'",
      "'unsafe-inline'", // Tailwind génère des styles inline en dev
      'https://fonts.googleapis.com',
    ],

    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
    ],

    'img-src': [
      "'self'",
      'data:',
      'blob:',
      // Sanity CDN images
      'https://cdn.sanity.io',
    ],

    'connect-src': [
      "'self'",
      // Sanity API (région EU)
      'https://*.api.sanity.io',
      'https://*.apicdn.sanity.io',
      // Plausible (à décommenter quand actif)
      // 'https://plausible.io',
    ],

    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    // NE PAS mettre upgrade-insecure-requests — casse le localhost HTTP
  };

  return Object.entries(directives)
    .map(([key, values]) => (values.length ? `${key} ${values.join(' ')}` : key))
    .join('; ');
};

// ─── Headers appliqués en toutes circonstances ────────────────────────────────

const ALWAYS_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
};

// ─── Headers production uniquement ───────────────────────────────────────────

const PROD_ONLY_HEADERS: Record<string, string> = {
  // HSTS — seulement sur vrai HTTPS, jamais sur localhost
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': buildCSP(),
};

// ─── Middleware ───────────────────────────────────────────────────────────────

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const { pathname } = context.url;

  // /admin — Sanity Studio gère ses propres en-têtes
  if (pathname.startsWith('/admin')) {
    return response;
  }

  const headers = new Headers(response.headers);

  // Toujours appliquer les headers de base
  for (const [key, value] of Object.entries(ALWAYS_HEADERS)) {
    headers.set(key, value);
  }

  // CSP + HSTS uniquement en production
  if (import.meta.env.PROD) {
    for (const [key, value] of Object.entries(PROD_ONLY_HEADERS)) {
      headers.set(key, value);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
