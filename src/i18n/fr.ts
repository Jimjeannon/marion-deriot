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
    tagline: 'Architecture intérieure & Design',
    studio: 'Agence Marion Dériot',
  },

  // ─── Homepage ────────────────────────────────────────────────────────────
  home: {
    /** Titre de la landing (/) — distinct de la home pour éviter les titres dupliqués. */
    title: 'Marion Dériot — Architecte d\'intérieur & Design',
    /** Titre de la home (/home) — 57 caractères, cible SEO locale. */
    metaTitle: 'Architecte d\'intérieur à Paris & Boulogne — Marion Dériot',
    /** 154 caractères — dans la fenêtre 150-160 recommandée. */
    metaDescription:
      'Marion Dériot, architecte d\'intérieur diplômée de l\'École Camondo. Rénovation et agencements sur mesure à Paris, Boulogne-Billancourt et en Île-de-France.',
    /** h1 de la home — lu par les lecteurs d'écran, non affiché. */
    h1: 'Marion Dériot, architecte d\'intérieur à Paris et Boulogne-Billancourt',
    /** Libellé du diaporama pour les technologies d'assistance. */
    slideshowLabel: 'Réalisations — matières et atmosphères',
    /** Lien de repli quand l'image ne renvoie pas vers une fiche projet. */
    seeAllProjects: 'Découvrir les projets',
    intro: '',
  },

  // ─── Projets ─────────────────────────────────────────────────────────────
  projects: {
    title: 'Projets',
    metaTitle: 'Projets — Marion Dériot Architecte d\'intérieur',
    metaDescription:
      'Projets de rénovation sur mesure, menuiseries sur mesure et aménagement intérieur — Agence Marion Dériot, architecte d\'intérieur diplômée Camondo, Paris et Île-de-France.',
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
      'Marion Renaudin Dériot, architecte d\'intérieur et designer diplômée de l\'École Camondo. Rénovation sur mesure, menuiseries sur mesure, 25 ans d\'expérience. Contact à Boulogne-Billancourt.',
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
