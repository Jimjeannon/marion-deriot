#!/usr/bin/env node
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
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  });
}

const SANITY_PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || 't4wzgksq';
const SANITY_DATASET = process.env.PUBLIC_SANITY_DATASET || 'production';
const SANITY_API_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

if (!SANITY_API_TOKEN) {
  console.error('ERROR: SANITY_API_WRITE_TOKEN missing');
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const PROJECTS_DIR = path.join(projectRoot, 'public/images/projets');
const INFO_DIR = path.join(projectRoot, 'public/images/Info');

function slugify(str) {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function uploadImage(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const filename = path.basename(imagePath);
    const asset = await client.assets.upload('image', imageBuffer, { filename });
    return asset;
  } catch (err) {
    console.error(`  ERROR uploading ${imagePath}: ${err.message}`);
    return null;
  }
}

async function getOrCreateProject(projectName) {
  const slug = slugify(projectName);
  const existing = await client.fetch(
    `*[_type == "project" && slug.fr.current == $slug][0]`,
    { slug }
  );

  if (existing) {
    return existing;
  }

  const newProject = {
    _type: 'project',
    title: {
      fr: projectName,
      en: projectName,
    },
    slug: {
      fr: { _type: 'slug', current: slug },
      en: { _type: 'slug', current: slug },
    },
    category: 'residential',
    year: new Date().getFullYear(),
    gallery: [],
    seo: {
      title: { fr: projectName, en: projectName },
      description: { fr: '', en: '' },
    },
  };

  const created = await client.create(newProject);
  console.log(`  OK: Project created ${created._id}`);
  return created;
}

async function addImagesToProject(projectId, imagePaths) {
  const galleryImages = [];

  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i];
    const filename = path.basename(imagePath);
    process.stdout.write(`  UPLOAD ${filename}... `);

    const asset = await uploadImage(imagePath);
    if (!asset) {
      console.log('FAIL');
      continue;
    }

    const isPreview = i < 3;
    galleryImages.push({
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
      alt: {
        fr: filename,
        en: filename,
      },
      isPreview: isPreview,
    });

    console.log('OK ' + (isPreview ? '(preview)' : ''));
  }

  if (galleryImages.length > 0) {
    await client.patch(projectId).set({ gallery: galleryImages }).commit();
    console.log(`  OK: ${galleryImages.length} images added`);
  }
}

async function importProjectImages() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error(`ERROR: Projects folder not found: ${PROJECTS_DIR}`);
    process.exit(1);
  }

  console.log('\n=== IMPORT PROJECTS ===\n');
  console.log(`Sanity: ${SANITY_PROJECT_ID}/${SANITY_DATASET}\n`);

  const projectFolders = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => {
      const stat = fs.statSync(path.join(PROJECTS_DIR, f));
      return stat.isDirectory() && !f.startsWith('.');
    })
    .sort();

  for (const projectFolder of projectFolders) {
    const projectPath = path.join(PROJECTS_DIR, projectFolder);
    // Tri NATUREL : 1, 2, 3, … 10, 11 (et non 1, 10, 11, 2 — tri lexicographique)
    // L'ordre des images affichées sur le site doit suivre les noms de fichiers.
    const imageFiles = fs
      .readdirSync(projectPath)
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f) && !f.startsWith('._'))
      .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' }))
      .map((f) => path.join(projectPath, f));

    if (imageFiles.length === 0) {
      console.log(`SKIP: ${projectFolder} (no images)`);
      continue;
    }

    console.log(`\nPROJECT: ${projectFolder} (${imageFiles.length} images)`);

    try {
      const project = await getOrCreateProject(projectFolder);
      await addImagesToProject(project._id, imageFiles);
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }
  }

  console.log('\nDone!\n');
}

async function importInfoImage() {
  if (!fs.existsSync(INFO_DIR)) {
    console.log('SKIP: Info folder not found');
    return;
  }

  const infoFiles = fs
    .readdirSync(INFO_DIR)
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f) && !f.startsWith('._'))
    .map((f) => path.join(INFO_DIR, f));

  if (infoFiles.length === 0) {
    console.log('SKIP: No info images found');
    return;
  }

  console.log('\n=== IMPORT INFO IMAGE ===\n');

  const imagePath = infoFiles[0];
  const filename = path.basename(imagePath);

  process.stdout.write(`  UPLOAD ${filename}... `);
  const asset = await uploadImage(imagePath);

  if (!asset) {
    console.log('FAIL');
    return;
  }

  console.log('OK');

  const infoDoc = {
    _type: 'info',
    _id: 'info-main',
    title: 'A propos de Marion Deriot',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
      alt: {
        fr: 'Marion Deriot',
        en: 'Marion Deriot',
      },
    },
  };

  try {
    await client.createOrReplace(infoDoc);
    console.log('  OK: Info document created');
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
  }

  console.log('');
}

async function main() {
  console.log('\n=== Importing Images to Sanity ===');
  await importProjectImages();
  await importInfoImage();
  console.log('=== DONE ===\n');
}

main().catch((err) => {
  console.error('FATAL ERROR:', err.message);
  process.exit(1);
});
