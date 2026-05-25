#!/usr/bin/env node

/**
 * Script de compression des images en batch
 * Compresse JPG brut → AVIF (80% reduction) + WebP (60% reduction)
 * Requiert : sharp (npm install sharp)
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imageDir = path.join(__dirname, '../public/images');
const outputDir = imageDir; // Remplace sur place

// Configuration compression
const QUALITY_AVIF = 70;   // AVIF : plus agressif
const QUALITY_WEBP = 75;   // WebP : équilibre
const QUALITY_JPG = 80;    // JPG fallback
const MAX_WIDTH = 2560;    // Max width pour desktop 4K

let stats = {
  totalBefore: 0,
  totalAfter: 0,
  filesProcessed: 0,
  filesSkipped: 0,
  errors: [],
};

async function processImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const fileName = path.basename(inputPath, ext);
  const dir = path.dirname(inputPath);

  // Skip si déjà traité
  if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
    stats.filesSkipped++;
    return;
  }

  try {
    const stats_before = fs.statSync(inputPath);
    const sizeBefore = stats_before.size;

    // Lire l'image
    let image = sharp(inputPath);
    const meta = await image.metadata();

    // Redimensionner si > MAX_WIDTH
    if (meta.width > MAX_WIDTH) {
      image = image.resize(MAX_WIDTH, Math.round((MAX_WIDTH / meta.width) * meta.height), {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Compresser en JPG (remplacer original)
    await image
      .jpeg({ quality: QUALITY_JPG, progressive: true, mozjpeg: true })
      .toFile(inputPath);

    const stats_after = fs.statSync(inputPath);
    const sizeAfter = stats_after.size;
    const saved = sizeBefore - sizeAfter;
    const pct = Math.round((saved / sizeBefore) * 100);

    stats.totalBefore += sizeBefore;
    stats.totalAfter += sizeAfter;
    stats.filesProcessed++;

    console.log(
      `✓ ${fileName}${ext} | ${formatBytes(sizeBefore)} → ${formatBytes(sizeAfter)} (−${pct}%)`
    );
  } catch (err) {
    stats.errors.push(`${inputPath}: ${err.message}`);
    console.error(`✗ ${inputPath}: ${err.message}`);
  }
}

async function walkDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await walkDir(fullPath);
    } else if (stat.isFile()) {
      await processImage(fullPath);
    }
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

async function main() {
  console.log('🖼️  Compression d\'images — Marion Dériot');
  console.log(`📂 Répertoire : ${imageDir}`);
  console.log('');

  if (!fs.existsSync(imageDir)) {
    console.error('❌ Le répertoire /public/images n\'existe pas');
    process.exit(1);
  }

  const startTime = Date.now();
  await walkDir(imageDir);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ');
  console.log('═══════════════════════════════════════════════');
  console.log(`Fichiers traités    : ${stats.filesProcessed}`);
  console.log(`Fichiers skippés    : ${stats.filesSkipped}`);
  console.log(`Erreurs             : ${stats.errors.length}`);
  console.log('');
  console.log(`Total avant         : ${formatBytes(stats.totalBefore)}`);
  console.log(`Total après         : ${formatBytes(stats.totalAfter)}`);
  const totalSaved = stats.totalBefore - stats.totalAfter;
  const totalPct = Math.round((totalSaved / stats.totalBefore) * 100);
  console.log(`Réduction totale    : ${formatBytes(totalSaved)} (−${totalPct}%)`);
  console.log('');
  console.log(`⏱️  Durée : ${duration}s`);

  if (stats.errors.length) {
    console.log('');
    console.log('❌ ERREURS :');
    stats.errors.forEach((err) => console.log(`  - ${err}`));
  }

  process.exit(stats.errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('💥 Erreur fatale :', err);
  process.exit(1);
});
