#!/usr/bin/env node
/**
 * Supprime les fichiers macOS parasites (._* et .DS_Store) du dossier public/.
 * Ces fichiers sont créés automatiquement par macOS sur des volumes
 * non-HFS (clés USB, disques réseau, etc.) et n'ont aucune utilité.
 *
 * Usage : node scripts/clean-macos-junk.mjs
 */
import { readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../public/', import.meta.url));

let deleted = 0;
let bytes = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full);
      continue;
    }
    const name = basename(full);
    if (name.startsWith('._') || name === '.DS_Store') {
      bytes += stat.size;
      unlinkSync(full);
      deleted++;
    }
  }
}

walk(ROOT);

const kb = (bytes / 1024).toFixed(1);
console.log('OK — ' + deleted + ' fichier(s) macOS supprime(s) (' + kb + ' KB liberes).');
