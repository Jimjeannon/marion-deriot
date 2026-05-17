/**
 * Endpoint formulaire de contact — POST /api/contact
 *
 * Sécurités :
 * - Validation Zod côté serveur (jamais faire confiance au client)
 * - Honeypot anti-spam
 * - Rate limiting basique par IP
 * - Envoi email via Resend
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';

// ─── Schéma de validation ─────────────────────────────────────────────────────

const ContactSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long')
    .trim(),
  email: z
    .string()
    .email('Adresse e-mail invalide')
    .max(254, 'Adresse e-mail trop longue')
    .toLowerCase()
    .trim(),
  projectType: z
    .enum(['residential', 'commercial', 'hospitality', 'other', ''])
    .optional(),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message est trop long')
    .trim(),
  // Honeypot — doit être vide
  website: z.string().max(0, 'Bot detected').optional(),
  // Langue — pour adapter l'email de confirmation
  lang: z.enum(['fr', 'en']).optional().default('fr'),
});

// ─── Rate limiting en mémoire (simple, sans Redis) ────────────────────────────
// Pour la production, utiliser Upstash Redis ou similar.

const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 5;        // 5 soumissions max
const RATE_WINDOW = 60_000;  // par minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count += 1;
  return true;
}

// ─── Envoi email via Resend ───────────────────────────────────────────────────

async function sendContactEmail(data: {
  name: string;
  email: string;
  projectType?: string;
  message: string;
  lang: 'fr' | 'en';
}): Promise<boolean> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const toEmail = import.meta.env.CONTACT_EMAIL_TO ?? 'marionderiot.archi@gmail.com';
  const fromEmail = import.meta.env.CONTACT_EMAIL_FROM ?? 'noreply@marionderiot.com';

  if (!apiKey) {
    // En développement sans clé Resend — log et retour OK
    console.warn('[contact] RESEND_API_KEY manquant — email non envoyé');
    console.info('[contact] Données reçues :', { ...data, message: data.message.slice(0, 50) + '…' });
    return true;
  }

  const projectLabels: Record<string, string> = {
    residential: 'Résidentiel',
    commercial: 'Commercial',
    hospitality: 'Hôtelier',
    other: 'Autre',
  };

  const projectLabel = data.projectType ? (projectLabels[data.projectType] ?? data.projectType) : '—';

  const htmlBody = `
    <div style="font-family: Georgia, serif; max-width: 600px; color: #2C2B29; padding: 40px;">
      <h2 style="font-size: 20px; font-weight: 300; margin-bottom: 24px; border-bottom: 1px solid #EAE6DE; padding-bottom: 16px;">
        Nouveau message via marionderiot.com
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #9E9489; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; width: 30%;">Nom</td><td style="padding: 8px 0; font-size: 14px;">${data.name}</td></tr>
        <tr><td style="padding: 8px 0; color: #9E9489; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;">E-mail</td><td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${data.email}" style="color: #8B7355;">${data.email}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #9E9489; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;">Projet</td><td style="padding: 8px 0; font-size: 14px;">${projectLabel}</td></tr>
      </table>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #EAE6DE;">
        <p style="font-size: 12px; color: #9E9489; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">Message</p>
        <p style="font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${data.message}</p>
      </div>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Agence Marion Dériot <${fromEmail}>`,
      to: [toEmail],
      reply_to: data.email,
      subject: `[marionderiot.com] Demande de ${data.name} — ${projectLabel}`,
      html: htmlBody,
    }),
  });

  return res.ok;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  const ip = clientAddress ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Trop de tentatives. Veuillez patienter.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parsing du body (FormData ou JSON)
  let rawData: Record<string, string> = {};
  const contentType = request.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      rawData = await request.json();
    } else {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        rawData[key] = value.toString();
      });
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Format de données invalide.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validation Zod
  const result = ContactSchema.safeParse(rawData);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return new Response(
      JSON.stringify({ error: 'Données invalides.', details: errors }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { name, email, projectType, message, lang } = result.data;

  // Envoi email
  const sent = await sendContactEmail({ name, email, projectType, message, lang });

  if (!sent) {
    return new Response(
      JSON.stringify({ error: 'Erreur lors de l\'envoi du message.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

// Bloquer les autres méthodes
export const GET: APIRoute = () =>
  new Response(null, { status: 405, headers: { Allow: 'POST' } });
