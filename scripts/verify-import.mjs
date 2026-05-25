import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@sanity/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const envPath = path.join(projectRoot, '.env');
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

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function verify() {
  console.log('\n=== VERIFICATION IMPORT ===\n');

  const projects = await client.fetch(`*[_type == "project"] | order(title.fr asc) { _id, title, slug, "imageCount": length(gallery) }`);
  console.log(`OK: ${projects.length} projets\n`);
  
  projects.forEach(p => {
    console.log(`  * ${p.title.fr} — ${p.imageCount} images`);
  });

  console.log('\nChecking Info image...');
  const info = await client.fetch(`*[_type == "info" && _id == "info-main"][0]`);
  if (info) {
    console.log(`  OK: Info document found`);
  } else {
    console.log(`  MISSING: Info document not found`);
  }

  const totalImages = projects.reduce((sum, p) => sum + p.imageCount, 0);
  console.log(`\nTotal images in Sanity: ${totalImages}`);
  console.log('\n=== DONE ===\n');
}

verify().catch(console.error);
