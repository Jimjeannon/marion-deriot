/**
 * Test rapide du token Sanity.
 * Usage : node scripts/test-sanity-token.mjs
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

// Lecture du .env
const env = {};
try {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
} catch (e) {
  console.error('Impossible de lire .env :', e.message);
  process.exit(1);
}

const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const token = env.SANITY_API_WRITE_TOKEN;
const dataset = env.PUBLIC_SANITY_DATASET || 'production';

console.log('Project ID :', projectId);
console.log('Token      :', token ? token.slice(0, 12) + '…' : 'MANQUANT');
console.log('Dataset    :', dataset);
console.log('');

if (!projectId || !token) {
  console.error('❌  Variables manquantes dans .env');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false });

// 1. Lecture — devrait toujours marcher
console.log('▶  Test lecture (fetch)…');
try {
  const count = await client.fetch('count(*[_type == "project"])');
  console.log(`✅  Lecture OK — ${count} projet(s) dans Sanity`);
} catch (e) {
  console.error('❌  Lecture échoue :', e.message);
  process.exit(1);
}

// 2. Écriture — crée puis supprime immédiatement un doc temporaire
console.log('▶  Test écriture (create + delete)…');
try {
  const doc = await client.create({
    _type: 'project',
    _id: 'test-token-check-delete-me',
    title: { fr: 'TEST SUPPRESSION AUTO', en: 'AUTO DELETE TEST' },
    slug: { fr: { _type: 'slug', current: 'test-auto' }, en: { _type: 'slug', current: 'test-auto' } },
    category: 'residential',
    gallery: [],
  });
  console.log('✅  Création OK — id :', doc._id);

  await client.delete(doc._id);
  console.log('✅  Suppression OK');
  console.log('');
  console.log('🎉  Token VALIDE avec droits Editor. Redémarre npm run dev et réessaie.');
} catch (e) {
  console.error('❌  Écriture refusée :', e.message);
  console.error('');
  console.error('👉  Vérifie sur https://www.sanity.io/manage → projet t4wzgksq → Settings → API → Tokens');
  console.error('    Le token doit avoir le rôle "Editor" (pas "Viewer", pas "Access Manager").');
  process.exit(1);
}
