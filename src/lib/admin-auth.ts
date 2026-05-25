/**
 * Helpers d'authentification admin — serveur uniquement.
 *
 * Le code d'accès est stocké en variable d'env serveur (ADMIN_ACCESS_CODE,
 * sans préfixe PUBLIC_). La session est un token base64url encodé contenant
 * le code et la date d'émission, stocké dans un cookie HttpOnly.
 *
 * Ne jamais importer ce module côté client.
 */

export const SESSION_COOKIE_NAME = 'admin_session';

/** Durée de validité du token de session (jours). */
const SESSION_DURATION_DAYS = 2;

function getAdminCode(): string {
  const code = import.meta.env.ADMIN_ACCESS_CODE;
  if (!code) throw new Error('ADMIN_ACCESS_CODE non défini dans .env');
  return code;
}

/**
 * Vérifie si le code soumis correspond au code admin.
 */
export function checkAdminCode(submitted: string): boolean {
  try {
    return submitted.trim() === getAdminCode().trim();
  } catch {
    return false;
  }
}

/**
 * Crée un token de session : base64url(code:YYYY-MM-DD)
 */
export function createSessionToken(): string {
  const code = getAdminCode();
  const date = new Date().toISOString().slice(0, 10);
  return Buffer.from(`${code}:${date}`).toString('base64url');
}

/**
 * Vérifie un token de session.
 * Valide pendant SESSION_DURATION_DAYS jours après émission.
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const code = getAdminCode();
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon === -1) return false;
    const tokenCode = decoded.slice(0, lastColon);
    const tokenDate = decoded.slice(lastColon + 1);
    if (tokenCode !== code) return false;
    const issued = new Date(tokenDate).getTime();
    if (isNaN(issued)) return false;
    const diffDays = (Date.now() - issued) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < SESSION_DURATION_DAYS;
  } catch {
    return false;
  }
}

/**
 * Génère la valeur du header Set-Cookie.
 */
export function buildSetCookieHeader(token: string, isLogout = false): string {
  const isProd = import.meta.env.PROD;
  const maxAge = isLogout ? 0 : SESSION_DURATION_DAYS * 24 * 60 * 60;
  const secure = isProd ? '; Secure' : '';
  const value = isLogout ? '' : token;
  return `${SESSION_COOKIE_NAME}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`;
}
