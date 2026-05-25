/**
 * scripts/migrate-catalog.mjs
 *
 * Migre les projets du catalogue local vers Sanity.
 * Lance avec : node scripts/migrate-catalog.mjs
 *
 * Pre-requis : PUBLIC_SANITY_PROJECT_ID et SANITY_API_WRITE_TOKEN dans .env
 */

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Lecture du .env ─────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) throw new Error('.env introuvable a la racine du projet.');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

const env = loadEnv();
const PROJECT_ID = env['PUBLIC_SANITY_PROJECT_ID'];
const DATASET    = env['PUBLIC_SANITY_DATASET'] || 'production';
const TOKEN      = env['SANITY_API_WRITE_TOKEN'];

if (!PROJECT_ID || PROJECT_ID === 'your_project_id_here') {
  console.error('ERREUR : PUBLIC_SANITY_PROJECT_ID manquant ou non configure dans .env');
  process.exit(1);
}
if (!TOKEN || TOKEN === 'your_write_token_here') {
  console.error('ERREUR : SANITY_API_WRITE_TOKEN manquant dans .env');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
});

// ── Catalogue des projets ────────────────────────────────────────────────────

const CATALOG = [
  {
    id: 'belleville',
    title: { fr: 'BELLEVILLE', en: 'BELLEVILLE' },
    slug:  { fr: 'belleville', en: 'belleville' },
    category: 'residential',
    images: [
      { src: 'belleville/01.jpg',  alt: { fr: 'Cuisine ouverte, ilot marbre, banquette chene', en: 'Open kitchen, marble island, oak bench' }, isPreview: true },
      { src: 'belleville/02.jpg',  alt: { fr: 'Cuisine vue frontale, credence marbre', en: 'Kitchen front view, marble splashback' } },
      { src: 'belleville/03.jpg',  alt: { fr: 'Couloir, placards vert celadon, parquet chene', en: 'Hallway, celadon cabinetry, oak parquet' } },
      { src: 'belleville/04.jpg',  alt: { fr: 'Cuisine, banquette chene et marbre', en: 'Kitchen, oak and marble bench' } },
      { src: 'belleville/05.jpg',  alt: { fr: 'Detail ilot marbre et menuiserie chene', en: 'Marble island and oak joinery detail' } },
      { src: 'belleville/06.jpg',  alt: { fr: 'Cuisine, facades hautes blanches, marbre', en: 'Kitchen, white upper cabinets, marble' } },
      { src: 'belleville/07.jpg',  alt: { fr: 'Detail, bocal verre souffle sur tablette marbre', en: 'Blown-glass jar on marble shelf' } },
      { src: 'belleville/08.jpg',  alt: { fr: 'Detail, poignee laiton sur facade chene', en: 'Brass handle on oak cabinetry' } },
      { src: 'belleville/09.jpg',  alt: { fr: 'Detail, rencontre marbre et bois', en: 'Marble and wood meeting on countertop' } },
      { src: 'belleville/10.jpg',  alt: { fr: 'Cuisine en enfilade, plan marbre, facade chene', en: 'Galley kitchen, marble counter, oak cabinetry' } },
      { src: 'belleville/11.jpg',  alt: { fr: 'Salle de bains, miroir rond, vasque, douche italienne', en: 'Bathroom, round mirror, basin, walk-in shower' } },
      { src: 'belleville/12.jpg',  alt: { fr: 'Salle d eau, vasque marbre, robinetterie laiton', en: 'Powder room, marble basin, brass tap' } },
      { src: 'belleville/13.jpg',  alt: { fr: 'Douche en pierre, robinetterie laiton', en: 'Stone shower, brass fittings' }, isPreview: true },
      { src: 'belleville/14.jpg',  alt: { fr: 'Salle d eau, vasque marbre suspendue, WC', en: 'Bathroom, floating marble basin, WC' } },
      { src: 'belleville/15.jpg',  alt: { fr: 'Chambre, lampadaire laiton, rideaux lin', en: 'Bedroom, brass floor lamp, linen curtains' } },
      { src: 'belleville/16.jpg',  alt: { fr: 'Chambre, tete de lit chene retro-eclairee', en: 'Bedroom, backlit oak headboard' } },
    ],
  },
  {
    id: 'square-de-valois',
    title: { fr: 'SQUARE DE VALOIS', en: 'SQUARE DE VALOIS' },
    slug:  { fr: 'square-de-valois', en: 'square-de-valois' },
    category: 'residential',
    images: [
      { src: 'Square de valois/0.jpg',   alt: { fr: 'Interieur Square de Valois', en: 'Interior Square de Valois' }, isPreview: true },
      { src: 'Square de valois/1.jpg',   alt: { fr: 'Sejour, volumes sur mesure', en: 'Living room, bespoke volumes' } },
      { src: 'Square de valois/2.jpg',   alt: { fr: 'Detail de menuiserie', en: 'Joinery detail' } },
      { src: 'Square de valois/3.jpg',   alt: { fr: 'Espace de vie, amenagement sur mesure', en: 'Living space, bespoke fittings' } },
      { src: 'Square de valois/3a.jpg',  alt: { fr: 'Detail, materiaux nobles', en: 'Noble materials detail' } },
      { src: 'Square de valois/4.jpg',   alt: { fr: 'Cuisine, conception Marion Deriot', en: 'Kitchen by Marion Deriot' } },
      { src: 'Square de valois/5.jpg',   alt: { fr: 'Interieur, harmonie des matieres', en: 'Interior, harmony of materials' } },
      { src: 'Square de valois/6.jpg',   alt: { fr: 'Detail, savoir-faire artisanal', en: 'Craftsmanship detail' } },
      { src: 'Square de valois/8.jpg',   alt: { fr: 'Salle de bains, finitions soignees', en: 'Bathroom, refined finishes' } },
      { src: 'Square de valois/10.jpg',  alt: { fr: 'Chambre, design intemporel', en: 'Bedroom, timeless design' }, isPreview: true },
      { src: 'Square de valois/11.jpg',  alt: { fr: 'Chambre, textiles et materiaux naturels', en: 'Bedroom, natural materials' } },
      { src: 'Square de valois/12.jpg',  alt: { fr: 'Dressing, menuiserie sur mesure', en: 'Dressing room, bespoke joinery' } },
      { src: 'Square de valois/13.jpg',  alt: { fr: 'Couloir, perspectives et lumiere', en: 'Hallway, perspectives and light' } },
      { src: 'Square de valois/14.jpg',  alt: { fr: 'Detail de finition', en: 'Finishing detail' } },
      { src: 'Square de valois/15.jpg',  alt: { fr: 'Espace de vie, amenagement interieur', en: 'Living space, interior design' } },
      { src: 'Square de valois/16.jpg',  alt: { fr: 'Materiaux, texture et assemblage', en: 'Materials, texture and assembly' } },
      { src: 'Square de valois/17.jpg',  alt: { fr: 'Detail, robinetterie et revetement', en: 'Tapware and wall covering detail' } },
      { src: 'Square de valois/18.jpg',  alt: { fr: 'Salle de bains, vasque et miroir', en: 'Bathroom, basin and mirror' } },
      { src: 'Square de valois/19.jpg',  alt: { fr: 'Interieur, lumiere naturelle', en: 'Interior, natural light' } },
      { src: 'Square de valois/20.jpg',  alt: { fr: 'Vue generale, appartement renove', en: 'General view, renovated apartment' } },
    ],
  },
  {
    id: 'hervieu',
    title: { fr: 'HERVIEU', en: 'HERVIEU' },
    slug:  { fr: 'hervieu', en: 'hervieu' },
    category: 'residential',
    images: [],
  },
  {
    id: 'vertbois',
    title: { fr: 'VERTBOIS', en: 'VERTBOIS' },
    slug:  { fr: 'vertbois', en: 'vertbois' },
    category: 'residential',
    year: 2013,
    images: [],
  },
  {
    id: 'vaucresson',
    title: { fr: 'VAUCRESSON', en: 'VAUCRESSON' },
    slug:  { fr: 'vaucresson', en: 'vaucresson' },
    category: 'residential',
    images: [
      { src: 'Vaucresson/1.jpg',        alt: { fr: 'Maison renovee, volumes et lumiere', en: 'Renovated house, volumes and light' }, isPreview: true },
      { src: 'Vaucresson/1BIS.jpg',     alt: { fr: 'Sejour, amenagement sur mesure', en: 'Living room, bespoke fittings' } },
      { src: 'Vaucresson/2.jpg',        alt: { fr: 'Cuisine, conception Marion Deriot', en: 'Kitchen by Marion Deriot' } },
      { src: 'Vaucresson/2 TER.jpg',    alt: { fr: 'Cuisine, detail de finition', en: 'Kitchen finishing detail' } },
      { src: 'Vaucresson/2bis.JPG',     alt: { fr: 'Plan de travail, materiaux nobles', en: 'Countertop, noble materials' } },
      { src: 'Vaucresson/3.jpg',        alt: { fr: 'Espace de vie, harmonie des matieres', en: 'Living space, harmony of materials' } },
      { src: 'Vaucresson/3bis.jpg',     alt: { fr: 'Detail, assemblage et savoir-faire', en: 'Assembly and craftsmanship detail' } },
      { src: 'Vaucresson/3ter.jpg',     alt: { fr: 'Interieur, finitions soignees', en: 'Interior, refined finishes' } },
      { src: 'Vaucresson/4.jpg',        alt: { fr: 'Chambre, serenite et confort', en: 'Bedroom, serenity and comfort' } },
      { src: 'Vaucresson/5.jpg',        alt: { fr: 'Salle de bains, marbre et laiton', en: 'Bathroom, marble and brass' } },
      { src: 'Vaucresson/7.jpg',        alt: { fr: 'Couloir, menuiserie sur mesure', en: 'Hallway, bespoke joinery' } },
      { src: 'Vaucresson/8.jpg',        alt: { fr: 'Detail, revetement mural et eclairage', en: 'Wall covering and lighting detail' } },
      { src: 'Vaucresson/10.jpg',       alt: { fr: 'Sejour, lumiere naturelle', en: 'Living room, natural light' }, isPreview: true },
      { src: 'Vaucresson/11.jpg',       alt: { fr: 'Vue generale, espace de reception', en: 'General view, reception space' } },
      { src: 'Vaucresson/12.jpg',       alt: { fr: 'Escalier, realisation sur mesure', en: 'Staircase, bespoke design' } },
      { src: 'Vaucresson/13.jpg',       alt: { fr: 'Interieur, detail de conception', en: 'Interior, design detail' } },
      { src: 'Vaucresson/A.jpg',        alt: { fr: 'Exterieur, facade et abords', en: 'Exterior, facade and surroundings' } },
      { src: 'Vaucresson/B.jpg',        alt: { fr: 'Jardin, amenagement exterieur', en: 'Garden, outdoor landscaping' } },
      { src: 'Vaucresson/C.jpg',        alt: { fr: 'Terrasse, espace exterieur', en: 'Terrace, outdoor space' } },
      { src: 'Vaucresson/D.jpg',        alt: { fr: 'Vue exterieure, maison renovee', en: 'Exterior view, renovated house' } },
      { src: 'Vaucresson/_DSC5477.jpg', alt: { fr: 'Detail architectural, Vaucresson', en: 'Architectural detail, Vaucresson' } },
    ],
  },
  {
    id: 'lavoisier',
    title: { fr: 'LAVOISIER', en: 'LAVOISIER' },
    slug:  { fr: 'lavoisier', en: 'lavoisier' },
    category: 'residential',
    images: [
      { src: 'Lavoisier/1.jpg',  alt: { fr: 'Duplex renove, sejour, Paris 8eme', en: 'Renovated duplex, living room, Paris 8th' }, isPreview: true },
      { src: 'Lavoisier/2.jpg',  alt: { fr: 'Cuisine, conception Marion Deriot', en: 'Kitchen by Marion Deriot' } },
      { src: 'Lavoisier/3.jpg',  alt: { fr: 'Espace de vie, volumes et lumiere', en: 'Living space, volumes and light' } },
      { src: 'Lavoisier/3A.jpg', alt: { fr: 'Detail, menuiserie sur mesure', en: 'Bespoke joinery detail' } },
      { src: 'Lavoisier/4.jpg',  alt: { fr: 'Interieur, harmonie des materiaux', en: 'Interior, harmony of materials' } },
      { src: 'Lavoisier/5.jpg',  alt: { fr: 'Sejour, amenagement sur mesure', en: 'Living room, bespoke fittings' } },
      { src: 'Lavoisier/6.jpg',  alt: { fr: 'Detail, assemblage artisanal', en: 'Craftsmanship and assembly detail' } },
      { src: 'Lavoisier/7.jpg',  alt: { fr: 'Chambre, serenite et confort', en: 'Bedroom, serenity and comfort' } },
      { src: 'Lavoisier/8.jpg',  alt: { fr: 'Salle de bains, finitions raffinees', en: 'Bathroom, refined finishes' } },
      { src: 'Lavoisier/9.jpg',  alt: { fr: 'Detail salle de bains, robinetterie', en: 'Bathroom detail, tapware' }, isPreview: true },
      { src: 'Lavoisier/10.jpg', alt: { fr: 'Vue generale, duplex renove', en: 'General view, renovated duplex' } },
      { src: 'Lavoisier/11.jpg', alt: { fr: 'Niveau superieur, circulation', en: 'Upper level, circulation' } },
      { src: 'Lavoisier/12.jpg', alt: { fr: 'Couloir, perspectives et lumiere', en: 'Hallway, perspectives and light' } },
      { src: 'Lavoisier/13.jpg', alt: { fr: 'Dressing, rangements sur mesure', en: 'Dressing room, bespoke storage' } },
      { src: 'Lavoisier/14.jpg', alt: { fr: 'Bureau, espace de travail sur mesure', en: 'Study, bespoke workspace' } },
      { src: 'Lavoisier/15.jpg', alt: { fr: 'Detail, materiaux et textures', en: 'Materials and textures detail' } },
      { src: 'Lavoisier/16.jpg', alt: { fr: 'Vue finale, appartement renove', en: 'Final view, renovated apartment' } },
    ],
  },
  {
    id: 'mignet',
    title: { fr: 'MIGNET', en: 'MIGNET' },
    slug:  { fr: 'mignet', en: 'mignet' },
    category: 'residential',
    images: [
      { src: 'MIGNET/1.jpg',    alt: { fr: 'Duplex renove, grand sejour, Paris 16eme', en: 'Renovated duplex, large living room, Paris 16th' }, isPreview: true },
      { src: 'MIGNET/2.jpg',    alt: { fr: 'Sejour, amenagement sur mesure', en: 'Living room, bespoke fittings' } },
      { src: 'MIGNET/3.jpg',    alt: { fr: 'Cuisine, conception Marion Deriot', en: 'Kitchen by Marion Deriot' } },
      { src: 'MIGNET/6.jpg',    alt: { fr: 'Detail cuisine, plan de travail', en: 'Kitchen detail, countertop' } },
      { src: 'MIGNET/7.jpg',    alt: { fr: 'Espace de vie, harmonie des matieres', en: 'Living space, harmony of materials' } },
      { src: 'MIGNET/7.1.jpg',  alt: { fr: 'Detail, assemblage et finitions', en: 'Assembly and finishes detail' } },
      { src: 'MIGNET/8.jpg',    alt: { fr: 'Bibliotheque, menuiserie sur mesure', en: 'Library, bespoke joinery' } },
      { src: 'MIGNET/9.jpg',    alt: { fr: 'Salon, luminosite et volumes genereux', en: 'Sitting room, brightness and generous volumes' } },
      { src: 'MIGNET/10.jpg',   alt: { fr: 'Vue generale, duplex Paris 16eme', en: 'General view, duplex Paris 16th' }, isPreview: true },
      { src: 'MIGNET/11.jpg',   alt: { fr: 'Chambre principale, confort et serenite', en: 'Master bedroom, comfort and serenity' } },
      { src: 'MIGNET/12.jpg',   alt: { fr: 'Chambre, tete de lit sur mesure', en: 'Bedroom, bespoke headboard' } },
      { src: 'MIGNET/13.jpg',   alt: { fr: 'Dressing, rangements architectures', en: 'Dressing room, architectural storage' } },
      { src: 'MIGNET/14.jpg',   alt: { fr: 'Salle de bains, marbre, vasque', en: 'Bathroom, marble, basin' } },
      { src: 'MIGNET/15.jpg',   alt: { fr: 'Salle d eau, douche italienne, laiton', en: 'Walk-in shower, brass fittings' } },
      { src: 'MIGNET/16.jpg',   alt: { fr: 'Couloir, menuiserie et perspectives', en: 'Hallway, joinery and perspectives' } },
      { src: 'MIGNET/17.jpg',   alt: { fr: 'Niveau superieur, circulation et lumiere', en: 'Upper level, circulation and light' } },
      { src: 'MIGNET/18.jpg',   alt: { fr: 'Detail, materiaux nobles', en: 'Noble materials detail' } },
      { src: 'MIGNET/19.jpg',   alt: { fr: 'Bureau, espace de travail sur mesure', en: 'Study, bespoke workspace' } },
      { src: 'MIGNET/20.jpg',   alt: { fr: 'Interieur, lumiere naturelle', en: 'Interior, natural light' } },
      { src: 'MIGNET/21.jpg',   alt: { fr: 'Vue de detail, finitions et assemblage', en: 'Detail view, finishes and assembly' } },
      { src: 'MIGNET/22.jpg',   alt: { fr: 'Terrasse, amenagement exterieur', en: 'Terrace, outdoor design' } },
      { src: 'MIGNET/23.jpg',   alt: { fr: 'Vue finale, duplex renove', en: 'Final view, renovated duplex' } },
    ],
  },
  {
    id: 'breteuil',
    title: { fr: 'BRETEUIL', en: 'BRETEUIL' },
    slug:  { fr: 'breteuil', en: 'breteuil' },
    category: 'residential',
    year: 2016,
    images: [],
  },
  {
    id: 'square-du-roule',
    title: { fr: 'SQUARE DU ROULE', en: 'SQUARE DU ROULE' },
    slug:  { fr: 'square-du-roule', en: 'square-du-roule' },
    category: 'residential',
    year: 2016,
    images: [],
  },
  {
    id: 'cambaceres',
    title: { fr: 'CAMBACERES', en: 'CAMBACERES' },
    slug:  { fr: 'cambaceres', en: 'cambaceres' },
    category: 'residential',
    images: [
      { src: 'CAMBACERES/1.jpg',          alt: { fr: 'Appartement renove, sejour lumineux', en: 'Renovated apartment, bright living room' }, isPreview: true },
      { src: 'CAMBACERES/2.jpg',          alt: { fr: 'Sejour, amenagement sur mesure', en: 'Living room, bespoke fittings' } },
      { src: 'CAMBACERES/3.jpg',          alt: { fr: 'Cuisine, conception Marion Deriot', en: 'Kitchen by Marion Deriot' } },
      { src: 'CAMBACERES/4.jpg',          alt: { fr: 'Detail cuisine, plan de travail', en: 'Kitchen detail, countertop' } },
      { src: 'CAMBACERES/5.jpg',          alt: { fr: 'Espace de vie, harmonie et confort', en: 'Living space, harmony and comfort' } },
      { src: 'CAMBACERES/6a.jpg',         alt: { fr: 'Salle a manger, table sur mesure', en: 'Dining room, bespoke table' } },
      { src: 'CAMBACERES/6b.JPG',         alt: { fr: 'Detail salle a manger, materiaux', en: 'Dining room detail, materials' } },
      { src: 'CAMBACERES/7.jpg',          alt: { fr: 'Couloir, menuiserie sur mesure', en: 'Hallway, bespoke joinery' } },
      { src: 'CAMBACERES/8.jpg',          alt: { fr: 'Bureau, espace de travail', en: 'Study, bespoke workspace' } },
      { src: 'CAMBACERES/9.jpg',          alt: { fr: 'Chambre, serenite et finitions', en: 'Bedroom, serenity and refined finishes' }, isPreview: true },
      { src: 'CAMBACERES/10.jpg',         alt: { fr: 'Chambre, tete de lit et textiles', en: 'Bedroom, headboard and textiles' } },
      { src: 'CAMBACERES/11.jpg',         alt: { fr: 'Dressing, rangements architectures', en: 'Dressing room, architectural storage' } },
      { src: 'CAMBACERES/12.jpg',         alt: { fr: 'Salle de bains, marbre et vasque', en: 'Bathroom, marble and basin' } },
      { src: 'CAMBACERES/13.jpg',         alt: { fr: 'Salle d eau, douche italienne', en: 'Walk-in shower' } },
      { src: 'CAMBACERES/14.jpg',         alt: { fr: 'Detail salle de bains, miroir', en: 'Bathroom detail, mirror' } },
      { src: 'CAMBACERES/15.jpg',         alt: { fr: 'Detail, materiaux nobles', en: 'Noble materials detail' } },
      { src: 'CAMBACERES/16.JPG',         alt: { fr: 'Interieur, lumiere naturelle', en: 'Interior, natural light' } },
      { src: 'CAMBACERES/17.jpg',         alt: { fr: 'Vue generale, appartement renove', en: 'General view, renovated apartment' } },
      { src: 'CAMBACERES/18.JPG',         alt: { fr: 'Detail architectural, Cambaceres', en: 'Architectural detail, Cambaceres' } },
      { src: 'CAMBACERES/DSCF2413.JPG',   alt: { fr: 'Vue finale, Cambaceres Paris 8eme', en: 'Final view, Cambaceres Paris 8th' } },
    ],
  },
  {
    id: 'malakoff',
    title: { fr: 'MALAKOFF', en: 'MALAKOFF' },
    slug:  { fr: 'malakoff', en: 'malakoff' },
    category: 'residential',
    images: [
      { src: 'Malakoff/1.jpg',    alt: { fr: 'Appartement renove, sejour', en: 'Renovated apartment, living room' }, isPreview: true },
      { src: 'Malakoff/2.jpg',    alt: { fr: 'Cuisine, conception Marion Deriot', en: 'Kitchen by Marion Deriot' } },
      { src: 'Malakoff/3.jpg',    alt: { fr: 'Espace de vie, amenagement sur mesure', en: 'Living space, bespoke fittings' } },
      { src: 'Malakoff/4-.jpg',   alt: { fr: 'Sejour, materiaux et lumiere', en: 'Living room, materials and light' } },
      { src: 'Malakoff/5-.jpg',   alt: { fr: 'Detail, savoir-faire artisanal', en: 'Craftsmanship detail' } },
      { src: 'Malakoff/6-.jpg',   alt: { fr: 'Interieur, harmonie des matieres', en: 'Interior, harmony of materials' } },
      { src: 'Malakoff/7-1.jpg',  alt: { fr: 'Chambre, confort et serenite', en: 'Bedroom, comfort and serenity' }, isPreview: true },
      { src: 'Malakoff/7-2.jpg',  alt: { fr: 'Detail chambre, tete de lit', en: 'Bedroom detail, headboard' } },
      { src: 'Malakoff/7-3.jpg',  alt: { fr: 'Chambre, materiaux nobles', en: 'Bedroom, noble materials' } },
      { src: 'Malakoff/11.jpg',   alt: { fr: 'Salle de bains, vasque et laiton', en: 'Bathroom, basin and brass tapware' } },
      { src: 'Malakoff/13.jpg',   alt: { fr: 'Detail, revetement et eclairage', en: 'Wall covering and lighting detail' } },
      { src: 'Malakoff/14.jpg',   alt: { fr: 'Vue finale, appartement renove', en: 'Final view, renovated apartment' } },
    ],
  },
  {
    id: 'alboni',
    title: { fr: 'ALBONI', en: 'ALBONI' },
    slug:  { fr: 'alboni', en: 'alboni' },
    category: 'residential',
    images: [
      { src: 'Alboni/1.jpg',   alt: { fr: 'Appartement renove, sejour, Paris 16eme', en: 'Renovated apartment, living room, Paris 16th' }, isPreview: true },
      { src: 'Alboni/2.jpg',   alt: { fr: 'Cuisine, conception Marion Deriot', en: 'Kitchen by Marion Deriot' } },
      { src: 'Alboni/3.jpg',   alt: { fr: 'Espace de vie, amenagement sur mesure', en: 'Living space, bespoke fittings' } },
      { src: 'Alboni/4.jpg',   alt: { fr: 'Sejour, volumes et lumiere naturelle', en: 'Living room, volumes and natural light' } },
      { src: 'Alboni/5.jpg',   alt: { fr: 'Detail, materiaux nobles', en: 'Noble materials detail' } },
      { src: 'Alboni/6.jpg',   alt: { fr: 'Interieur, harmonie des matieres', en: 'Interior, harmony of materials' } },
      { src: 'Alboni/7.JPG',   alt: { fr: 'Chambre, serenite et confort', en: 'Bedroom, serenity and comfort' }, isPreview: true },
      { src: 'Alboni/8.JPG',   alt: { fr: 'Chambre, tete de lit et textiles', en: 'Bedroom, headboard and textiles' } },
      { src: 'Alboni/9.JPG',   alt: { fr: 'Salle de bains, finitions raffinees', en: 'Bathroom, refined finishes' } },
      { src: 'Alboni/A.jpg',   alt: { fr: 'Detail architectural, Alboni', en: 'Architectural detail, Alboni' } },
      { src: 'Alboni/B.jpg',   alt: { fr: 'Vue generale, appartement renove', en: 'General view, renovated apartment' } },
      { src: 'Alboni/C.jpg',   alt: { fr: 'Vue finale, Alboni Paris 16eme', en: 'Final view, Alboni Paris 16th' } },
    ],
  },
  {
    id: 'bourdonnais',
    title: { fr: 'BOURDONNAIS', en: 'BOURDONNAIS' },
    slug:  { fr: 'bourdonnais', en: 'bourdonnais' },
    category: 'residential',
    images: [
      { src: 'BOURDONNAIS/1.jpg',         alt: { fr: 'Appartement renove, sejour, Paris 7eme', en: 'Renovated apartment, living room, Paris 7th' }, isPreview: true },
      { src: 'BOURDONNAIS/2.jpg',         alt: { fr: 'Cuisine, conception Marion Deriot', en: 'Kitchen by Marion Deriot' } },
      { src: 'BOURDONNAIS/3.jpg',         alt: { fr: 'Espace de vie, amenagement sur mesure', en: 'Living space, bespoke fittings' } },
      { src: 'BOURDONNAIS/4.jpg',         alt: { fr: 'Sejour, materiaux chaleureux', en: 'Living room, warm materials' } },
      { src: 'BOURDONNAIS/5.jpg',         alt: { fr: 'Detail, savoir-faire et assemblage', en: 'Craftsmanship and assembly detail' } },
      { src: 'BOURDONNAIS/6.jpg',         alt: { fr: 'Interieur, volumes et perspectives', en: 'Interior, volumes and perspectives' }, isPreview: true },
      { src: 'BOURDONNAIS/7.jpg',         alt: { fr: 'Chambre, serenite et confort', en: 'Bedroom, serenity and comfort' } },
      { src: 'BOURDONNAIS/8.jpg',         alt: { fr: 'Chambre, textiles et menuiserie', en: 'Bedroom, textiles and joinery' } },
      { src: 'BOURDONNAIS/9.jpg',         alt: { fr: 'Salle de bains, finitions raffinees', en: 'Bathroom, refined finishes' } },
      { src: 'BOURDONNAIS/0_0001.jpg',    alt: { fr: 'Vue architecturale, Bourdonnais', en: 'Architectural view, Bourdonnais' } },
      { src: 'BOURDONNAIS/0_0004.jpg',    alt: { fr: 'Detail architectural, Bourdonnais', en: 'Architectural detail, Bourdonnais' } },
      { src: 'BOURDONNAIS/0_0008.jpg',    alt: { fr: 'Interieur, lumiere et matieres', en: 'Interior, light and materials' } },
      { src: 'BOURDONNAIS/0_0012.jpg',    alt: { fr: 'Vue generale, appartement renove', en: 'General view, renovated apartment' } },
      { src: 'BOURDONNAIS/0_0013.jpg',    alt: { fr: 'Vue finale, Bourdonnais Paris 7eme', en: 'Final view, Bourdonnais Paris 7th' } },
      { src: 'BOURDONNAIS/_DSC2800.jpg',  alt: { fr: 'Detail de realisation, Bourdonnais', en: 'Execution detail, Bourdonnais' } },
    ],
  },
  {
    id: 'cdg',
    title: { fr: 'CHARLES DE GAULLE', en: 'CHARLES DE GAULLE' },
    slug:  { fr: 'charles-de-gaulle', en: 'charles-de-gaulle' },
    category: 'residential',
    images: [
      { src: 'CDG(Charles de Gaulle)/1 ..jpg',   alt: { fr: 'Appartement renove, sejour', en: 'Renovated apartment, living room' }, isPreview: true },
      { src: 'CDG(Charles de Gaulle)/2..jpg',    alt: { fr: 'Cuisine, conception Marion Deriot', en: 'Kitchen by Marion Deriot' } },
      { src: 'CDG(Charles de Gaulle)/2BIS.jpg',  alt: { fr: 'Cuisine, detail de finition', en: 'Kitchen finishing detail' } },
      { src: 'CDG(Charles de Gaulle)/3..jpg',    alt: { fr: 'Espace de vie, amenagement sur mesure', en: 'Living space, bespoke fittings' } },
      { src: 'CDG(Charles de Gaulle)/4..jpg',    alt: { fr: 'Sejour, materiaux et volumes', en: 'Living room, materials and volumes' } },
      { src: 'CDG(Charles de Gaulle)/5..jpg',    alt: { fr: 'Detail, savoir-faire et finitions', en: 'Craftsmanship and finishes detail' } },
      { src: 'CDG(Charles de Gaulle)/6..jpg',    alt: { fr: 'Interieur, harmonie des matieres', en: 'Interior, harmony of materials' } },
      { src: 'CDG(Charles de Gaulle)/6 BIS.jpg', alt: { fr: 'Detail architectural', en: 'Architectural detail' } },
      { src: 'CDG(Charles de Gaulle)/7..jpg',    alt: { fr: 'Chambre, serenite et confort', en: 'Bedroom, serenity and comfort' }, isPreview: true },
      { src: 'CDG(Charles de Gaulle)/7.bis.JPG', alt: { fr: 'Chambre, detail de finition', en: 'Bedroom finishing detail' } },
      { src: 'CDG(Charles de Gaulle)/8..jpg',    alt: { fr: 'Salle de bains, marbre et laiton', en: 'Bathroom, marble and brass' } },
      { src: 'CDG(Charles de Gaulle)/9..jpg',    alt: { fr: 'Salle d eau, douche italienne', en: 'Walk-in shower, refined finishes' } },
      { src: 'CDG(Charles de Gaulle)/10..jpg',   alt: { fr: 'Couloir, menuiserie sur mesure', en: 'Hallway, bespoke joinery' } },
      { src: 'CDG(Charles de Gaulle)/11..jpg',   alt: { fr: 'Vue generale, appartement renove', en: 'General view, renovated apartment' } },
      { src: 'CDG(Charles de Gaulle)/12..jpg',   alt: { fr: 'Vue finale, Charles de Gaulle', en: 'Final view, Charles de Gaulle' } },
    ],
  },
];

// ── Migration ────────────────────────────────────────────────────────────────

const PUBLIC_DIR = resolve(ROOT, 'public', 'images', 'projets');

function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };
  return map[ext] || 'image/jpeg';
}

async function migrateProject(project) {
  const slugFr = project.slug.fr;

  // Verifier si un document avec ce slug existe deja
  const existing = await client.fetch(
    `*[_type == "project" && slug.fr.current == $slug][0]._id`,
    { slug: slugFr }
  );
  if (existing) {
    console.log(`  [SKIP] ${project.title.fr} — existe deja (${existing})`);
    return;
  }

  console.log(`  [CREATE] ${project.title.fr}...`);

  // Creer le document vide d'abord pour obtenir l'_id
  const doc = await client.create({
    _type: 'project',
    title: { fr: project.title.fr, en: project.title.en },
    slug: {
      fr: { _type: 'slug', current: project.slug.fr },
      en: { _type: 'slug', current: project.slug.en },
    },
    category: project.category || 'residential',
    ...(project.year ? { year: project.year } : {}),
    gallery: [],
  });

  console.log(`  [OK] Cree : ${doc._id}`);

  if (!project.images || project.images.length === 0) {
    console.log(`  [INFO] Aucune image pour ce projet.`);
    return;
  }

  // Uploader les images une par une
  const galleryItems = [];
  for (let i = 0; i < project.images.length; i++) {
    const img = project.images[i];
    const filePath = resolve(PUBLIC_DIR, img.src);

    if (!existsSync(filePath)) {
      console.log(`  [SKIP IMAGE] Fichier introuvable : ${img.src}`);
      continue;
    }

    process.stdout.write(`    Image ${i + 1}/${project.images.length} : ${img.src.split('/').pop()}...`);
    try {
      const buffer = readFileSync(filePath);
      const filename = img.src.split('/').pop();
      const asset = await client.assets.upload('image', buffer, {
        filename,
        contentType: getMimeType(filename),
      });
      galleryItems.push({
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
        alt: { fr: img.alt.fr, en: img.alt.en },
        isPreview: img.isPreview === true,
      });
      process.stdout.write(' OK\n');
    } catch (err) {
      process.stdout.write(` ERREUR: ${err.message}\n`);
    }
  }

  if (galleryItems.length > 0) {
    await client.patch(doc._id).set({ gallery: galleryItems }).commit();
    console.log(`  [OK] ${galleryItems.length} image(s) associee(s).`);
  }
}

async function main() {
  console.log('\n=== Migration catalogue local → Sanity ===');
  console.log(`Projet : ${PROJECT_ID} / Dataset : ${DATASET}\n`);

  // Test de connexion
  try {
    await client.fetch('*[_type == "project"][0]._id');
    console.log('[OK] Connexion Sanity etablie.\n');
  } catch (err) {
    console.error('[ERREUR] Impossible de se connecter a Sanity :', err.message);
    console.error('\nVerifiez :');
    console.error('  - PUBLIC_SANITY_PROJECT_ID dans .env');
    console.error('  - SANITY_API_WRITE_TOKEN dans .env (role Editor minimum)');
    process.exit(1);
  }

  for (const project of CATALOG) {
    await migrateProject(project);
  }

  console.log('\n=== Migration terminee ===\n');
}

main().catch((err) => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
