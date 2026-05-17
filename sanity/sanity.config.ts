/**
 * Configuration Sanity Studio — embarqué sur /admin
 *
 * IMPORTANT : Créer le projet Sanity avec la région EU (RGPD obligatoire).
 * Commande : npx sanity init --project <id> --dataset production
 */
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemas } from './schemas';
// @sanity/vision est optionnel (outil GROQ dev) — à ajouter si besoin :
// npm install @sanity/vision  puis décommenter ci-dessous
// import { visionTool } from '@sanity/vision';

export default defineConfig({
  // Rempli via variables d'env (voir .env.example)
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.PUBLIC_SANITY_DATASET ?? 'production',

  title: 'Marion Dériot — Studio',

  plugins: [
    structureTool({
      title: 'Contenu',
    }),
    // visionTool(), // décommenter après npm install @sanity/vision
  ],

  schema: {
    types: schemas,
  },
});
