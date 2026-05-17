/**
 * Dictionnaire UI — Français (langue par défaut)
 * Toutes les chaînes UI du site doivent passer par ce fichier.
 * Ne jamais hardcoder du texte FR/EN dans les composants.
 */
export const fr = {
  // ─── Navigation ──────────────────────────────────────────────────────────
  nav: {
    home: 'Accueil',
    projects: 'Projets',
    info: 'Info',
    skipToContent: 'Aller au contenu principal',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    switchLang: 'English',
    switchLangLabel: 'Passer en anglais',
  },

  // ─── Landing ─────────────────────────────────────────────────────────────
  landing: {
    enter: 'Entrer',
    enterLabel: 'Entrer dans le site',
    tagline: 'Architecte d\'intérieur',
    studio: 'Agence Marion Dériot',
  },

  // ─── Homepage ────────────────────────────────────────────────────────────
  home: {
    title: 'Marion Dériot — Architecte d\'intérieur',
    metaDescription:
      'Agence Marion Dériot, architecte d\'intérieur à Boulogne-Billancourt. Projets résidentiels et professionnels sur mesure à Paris et en Île-de-France.',
    intro: '',
  },

  // ─── Projets ─────────────────────────────────────────────────────────────
  projects: {
    title: 'Projets',
    metaTitle: 'Projets — Marion Dériot Architecte d\'intérieur',
    metaDescription:
      'Découvrez les projets d\'architecture intérieure et de design de l\'agence Marion Dériot à Boulogne-Billancourt — résidentiel, commercial, hôtelier.',
    viewProject: 'Voir le projet',
    openSlideshow: 'Ouvrir le diaporama',
    closeSlideshow: 'Fermer le diaporama',
    nextImage: 'Image suivante',
    prevImage: 'Image précédente',
    imageOf: (current: number, total: number) => `Image ${current} sur ${total}`,
    allProjects: 'Tous les projets',
    imagesComingSoon: 'Galerie photographique à venir.',
  },

  // ─── Info / Contact ───────────────────────────────────────────────────────
  info: {
    title: 'Info',
    metaTitle: 'Info & Contact — Marion Dériot Architecte d\'intérieur',
    metaDescription:
      'Présentation de l\'agence Marion Dériot, architecte d\'intérieur diplômée de l\'École Camondo. Contact, adresse studio Boulogne-Billancourt.',
    contactTitle: 'Contact',
    form: {
      name: 'Nom',
      email: 'Adresse e-mail',
      projectType: 'Type de projet',
      projectTypes: {
        residential: 'Résidentiel',
        commercial: 'Commercial',
        hospitality: 'Hôtelier',
        other: 'Autre',
      },
      message: 'Message',
      messagePlaceholder: 'Décrivez brièvement votre projet…',
      submit: 'Envoyer',
      submitting: 'Envoi en cours…',
      successTitle: 'Message envoyé',
      successMessage:
        'Merci pour votre message. Marion vous répondra dans les meilleurs délais.',
      errorTitle: 'Une erreur est survenue',
      errorMessage:
        'Votre message n\'a pas pu être envoyé. Veuillez réessayer ou nous contacter directement par e-mail.',
      required: 'Champ obligatoire',
      invalidEmail: 'Adresse e-mail invalide',
    },
    social: {
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      pinterest: 'Pinterest',
    },
  },

  // ─── Footer légal ─────────────────────────────────────────────────────────
  legal: {
    mentions: 'Mentions légales',
    privacy: 'Politique de confidentialité',
    cookies: 'Cookies',
    copyright: (year: number) => `© ${year} Marion Dériot`,
  },

  // ─── Erreurs ──────────────────────────────────────────────────────────────
  errors: {
    notFound: 'Page introuvable',
    notFoundMessage: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
    backHome: 'Retour à l\'accueil',
  },
} as const;

export type UIDict = typeof fr;
