#!/usr/bin/env node
/**
 * fix-gallery-order.mjs — Remet les galeries Sanity dans l'ordre des noms de fichiers.
 *
 * Problème corrigé : les imports historiques triaient les fichiers de manière
 * lexicographique (1, 10, 11, …, 2) au lieu du tri naturel (1, 2, 3, … 10, 11).
 * L'ordre d'affichage sur le site = l'ordre du tableau `gallery` dans Sanity.
 *
 * Usage :
 *   node scripts/fix-gallery-order.mjs           → aperçu (dry-run, aucune écriture)
 *   node scripts/fix-gallery-order.mjs --apply   → applique les corrections
 *
 * Requiert SANITY_API_WRITE_TOKEN dans .env (comme import-images-to-sanity.mjs).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@sanity/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Load .env
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) process.env[key.trim()] = value;
    }
  });
}

const SANITY_PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || 't4wzgksq';
const SANITY_DATASET = process.env.PUBLIC_SANITY_DATASET || 'production';
const SANITY_API_TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const APPLY = process.argv.includes('--apply');

if (!SANITY_API_TOKEN) {
  console.error('ERROR: SANITY_API_WRITE_TOKEN manquant dans .env');
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

/** Tri naturel insensible à la casse : 1 < 2 < 10, "6a" < "6b" < "7". */
function naturalCompare(a, b) {
  return String(a).localeCompare(String(b), 'fr', { numeric: true, sensitivity: 'base' });
}

async function main() {
  console.log(`\n=== ORDRE DES GALERIES — ${APPLY ? 'APPLICATION' : 'DRY-RUN (aucune écriture)'} ===`);
  console.log(`Sanity : ${SANITY_PROJECT_ID}/${SANITY_DATASET}\n`);

  const projects = await client.fetch(`
    *[_type == "project"] | order(title.fr asc) {
      _id,
      "title": title.fr,
      "gallery": gallery[] {
        _key,
        _type,
        asset,
        hotspot,
        crop,
        alt,
        isPreview,
        "filename": asset->originalFilename
      }
    }
  `);

  let fixed = 0;

  for (const p of projects) {
    const gallery = p.gallery ?? [];
    if (gallery.length < 2) {
      console.log(`—  ${p.title} : ${gallery.length} image(s), rien à faire`);
      continue;
    }

    const current = gallery.map((g) => g.filename ?? '');
    const sorted = [...gallery].sort((a, b) => naturalCompare(a.filename ?? '', b.filename ?? ''));
    const target = sorted.map((g) => g.filename ?? '');

    if (JSON.stringify(current) === JSON.stringify(target)) {
      console.log(`OK ${p.title} : déjà dans l'ordre (${gallery.length} images)`);
      continue;
    }

    console.log(`✗  ${p.title} : ordre à corriger`);
    console.log(`     actuel : ${current.join(', ')}`);
    console.log(`     cible  : ${target.join(', ')}`);

    if (APPLY) {
      // On réécrit le tableau gallery dans l'ordre cible, sans le champ "filename"
      // (champ projeté, pas stocké) et en conservant _key / flags / hotspots.
      const newGallery = sorted.map(({ filename, ...img }) => img);
      await client.patch(p._id).set({ gallery: newGallery }).commit();
      console.log('     → corrigé.');
      fixed++;
    }
  }

  console.log(
    APPLY
      ? `\nTerminé — ${fixed} projet(s) corrigé(s).\n`
      : '\nDry-run terminé. Relancez avec --apply pour corriger.\n'
  );
}

main().catch((err) => {
  console.error('ERREUR :', err.message);
  process.exit(1);
});
