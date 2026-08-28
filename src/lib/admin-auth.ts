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

/**
 * Code d'accès par défaut à /admin.
 *
 * Il vit dans le code, pas dans une variable d'environnement : le site
 * fonctionne donc dès le déploiement, sans rien configurer sur l'hébergeur.
 * Contrepartie assumée : quiconque lit ce dépôt peut se connecter à /admin et
 * modifier les projets. Acceptable ici — le contenu est un portfolio public et
 * toute modification est réversible depuis Sanity.
 *
 * Pour changer le code : modifiez la constante ci-dessous, ou définissez
 * ADMIN_ACCESS_CODE sur l'hébergeur, qui reprend alors la main.
 */
const CODE_ADMIN_PAR_DEFAUT = 'marion2024';

/*
 * Vite fige les `import.meta.env.X` au moment du build. Sur Netlify, une
 * variable ajoutée ou modifiée APRÈS le dernier déploiement n'y figure donc
 * pas — d'où le repli sur `process.env`, lu à l'exécution de la fonction.
 * L'accès statique est conservé en premier : c'est lui qui fonctionne en dev.
 */
function getAdminCode(): string {
  return (
    import.meta.env.ADMIN_ACCESS_CODE ??
    process.env.ADMIN_ACCESS_CODE ??
    CODE_ADMIN_PAR_DEFAUT
  );
}

/**
 * DIAGNOSTIC TEMPORAIRE — à retirer une fois la connexion admin rétablie.
 *
 * Ne révèle jamais le code : uniquement d'où il est lu, sa longueur, et en quoi
 * il diffère de ce qui a été soumis. Suffisant pour distinguer les trois causes
 * habituelles d'un 401 en production : variable absente du build, valeur collée
 * avec des guillemets ou un espace, ou simple erreur de frappe.
 */
export function diagnostiquerCode(soumis: string): Record<string, unknown> {
  const parImportMeta = import.meta.env.ADMIN_ACCESS_CODE;
  const parProcess = process.env.ADMIN_ACCESS_CODE;
  const attendu = parImportMeta ?? parProcess;
  const encadre = (v: string | undefined) =>
    !!v && /^["'`]|["'`]$/.test(v.trim());
  return {
    source: parImportMeta ? 'import.meta.env' : parProcess ? 'process.env' : 'ABSENT',
    presentDansImportMeta: !!parImportMeta,
    presentDansProcessEnv: !!parProcess,
    longueurAttendue: attendu ? attendu.length : 0,
    longueurAttendueApresTrim: attendu ? attendu.trim().length : 0,
    longueurRecue: soumis.length,
    longueurRecueApresTrim: soumis.trim().length,
    valeurAttendueEncadreeDeGuillemets: encadre(attendu),
    identiqueApresTrim: !!attendu && attendu.trim() === soumis.trim(),
    premiersCaracteresAttendus: attendu ? attendu.trim().slice(0, 2) : null,
    premiersCaracteresRecus: soumis.trim().slice(0, 2),
  };
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
