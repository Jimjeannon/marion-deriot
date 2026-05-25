/**
 * Schema Sanity — Page Info / À propos
 * Stocke la photo et infos de Marion Dériot
 */
import { defineType, defineField } from 'sanity';

export const infoSchema = defineType({
  name: 'info',
  title: 'À Propos',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      description: 'Ex: À propos de Marion Dériot',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'image',
      title: 'Photo Marion Dériot',
      type: 'image',
      description: 'Photo de profil pour la page info',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texte alternatif',
          type: 'object',
          fields: [
            defineField({
              name: 'fr',
              title: 'Français',
              type: 'string',
              initialValue: 'Marion Dériot',
            }),
            defineField({
              name: 'en',
              title: 'English',
              type: 'string',
              initialValue: 'Marion Dériot',
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
  },
});
