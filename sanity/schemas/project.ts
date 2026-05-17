/**
 * Schema Sanity — Projet d'architecture intérieure
 * Version 1 minimaliste (voir CLAUDE.md § Modèle de données « Projet »)
 *
 * Ne pas anticiper sur le modèle v2 (lieu, surface, description longue,
 * témoignage client, plans, vidéo, crédits) sans demande explicite de Marion.
 */
import { defineType, defineField, defineArrayMember } from 'sanity';

export const projectSchema = defineType({
  name: 'project',
  title: 'Projet',
  type: 'document',
  fields: [
    // ─── Titre FR + EN ─────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'object',
      fields: [
        defineField({
          name: 'fr',
          title: 'Français',
          type: 'string',
          description: 'Ex : CAMBACERES — en MAJUSCULES dans l\'UI',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'en',
          title: 'English',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),

    // ─── Slug FR + EN (auto-généré) ────────────────────────────────────────
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'object',
      description: 'Généré automatiquement depuis le titre. Minuscules sans accents.',
      fields: [
        defineField({
          name: 'fr',
          title: 'Slug FR',
          type: 'slug',
          options: {
            source: 'title.fr',
            slugify: (input: string) =>
              input
                .toLowerCase()
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, ''),
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'en',
          title: 'Slug EN',
          type: 'slug',
          options: {
            source: 'title.en',
            slugify: (input: string) =>
              input
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, ''),
          },
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),

    // ─── Catégorie ─────────────────────────────────────────────────────────
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          { title: 'Résidentiel', value: 'residential' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Hôtelier', value: 'hospitality' },
          { title: 'Autre', value: 'other' },
        ],
        layout: 'radio',
      },
      initialValue: 'residential',
      validation: (Rule) => Rule.required(),
    }),

    // ─── Année (optionnel) ─────────────────────────────────────────────────
    defineField({
      name: 'year',
      title: 'Année',
      type: 'number',
      description: 'Optionnel — année de réalisation',
      validation: (Rule) =>
        Rule.min(1990).max(new Date().getFullYear() + 1).integer(),
    }),

    // ─── Galerie d'images ──────────────────────────────────────────────────
    defineField({
      name: 'gallery',
      title: 'Galerie',
      type: 'array',
      description:
        'Glissez-déposez pour réordonner. Marquez 2 à 3 images comme "Preview" pour les aperçus.',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true, // Sanity gère le point focal
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Texte alternatif',
              type: 'object',
              description: 'Obligatoire pour l\'accessibilité.',
              fields: [
                defineField({
                  name: 'fr',
                  title: 'Français',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'en',
                  title: 'English',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
              ],
            }),
            defineField({
              name: 'isPreview',
              title: 'Image de preview',
              type: 'boolean',
              description:
                'Cocher pour utiliser cette image sur la liste des projets et l\'entête du projet. Maximum 3.',
              initialValue: false,
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.min(1).error('Au moins une image est requise'),
    }),

    // ─── SEO ───────────────────────────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'title',
          title: 'Meta title (FR + EN)',
          type: 'object',
          fields: [
            defineField({ name: 'fr', type: 'string', title: 'FR', validation: (Rule) => Rule.max(60) }),
            defineField({ name: 'en', type: 'string', title: 'EN', validation: (Rule) => Rule.max(60) }),
          ],
        }),
        defineField({
          name: 'description',
          title: 'Meta description (FR + EN)',
          type: 'object',
          fields: [
            defineField({ name: 'fr', type: 'text', title: 'FR', rows: 2, validation: (Rule) => Rule.max(160) }),
            defineField({ name: 'en', type: 'text', title: 'EN', rows: 2, validation: (Rule) => Rule.max(160) }),
          ],
        }),
        defineField({
          name: 'ogImage',
          title: 'Image Open Graph',
          type: 'image',
          description: 'Optionnel — 1200×630px recommandé',
        }),
      ],
    }),
  ],

  // Prévisualisation dans Sanity Studio
  preview: {
    select: {
      titleFr: 'title.fr',
      category: 'category',
      year: 'year',
      image: 'gallery.0',
    },
    prepare({ titleFr, category, year, image }) {
      return {
        title: titleFr ?? 'Sans titre',
        subtitle: [category, year].filter(Boolean).join(' · '),
        media: image,
      };
    },
  },
});
