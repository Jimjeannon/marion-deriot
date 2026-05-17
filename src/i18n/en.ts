/**
 * Dictionnaire UI — English
 * Mirror of fr.ts — toutes les clés doivent être présentes.
 */
import type { UIDict } from './fr';

export const en: UIDict = {
  nav: {
    home: 'Home',
    projects: 'Projects',
    info: 'Info',
    skipToContent: 'Skip to main content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchLang: 'Français',
    switchLangLabel: 'Switch to French',
  },

  landing: {
    enter: 'Enter',
    enterLabel: 'Enter the site',
    tagline: 'Interior Architect',
    studio: 'Marion Dériot Studio',
  },

  home: {
    title: 'Marion Dériot — Interior Architect',
    metaDescription:
      'Marion Dériot Studio, interior architect based in Boulogne-Billancourt. Bespoke residential and professional projects in Paris and Île-de-France.',
    intro: '',
  },

  projects: {
    title: 'Projects',
    metaTitle: 'Projects — Marion Dériot Interior Architect',
    metaDescription:
      'Explore the interior architecture and design projects of Marion Dériot Studio — residential, commercial, hospitality.',
    viewProject: 'View project',
    openSlideshow: 'Open slideshow',
    closeSlideshow: 'Close slideshow',
    nextImage: 'Next image',
    prevImage: 'Previous image',
    imageOf: (current: number, total: number) => `Image ${current} of ${total}`,
    allProjects: 'All projects',
    imagesComingSoon: 'Photo gallery coming soon.',
  },

  info: {
    title: 'Info',
    metaTitle: 'Info & Contact — Marion Dériot Interior Architect',
    metaDescription:
      'Marion Dériot Studio, interior architect and graduate of École Camondo. Contact, studio address Boulogne-Billancourt.',
    contactTitle: 'Contact',
    form: {
      name: 'Name',
      email: 'Email address',
      projectType: 'Project type',
      projectTypes: {
        residential: 'Residential',
        commercial: 'Commercial',
        hospitality: 'Hospitality',
        other: 'Other',
      },
      message: 'Message',
      messagePlaceholder: 'Briefly describe your project…',
      submit: 'Send',
      submitting: 'Sending…',
      successTitle: 'Message sent',
      successMessage:
        'Thank you for your message. Marion will get back to you shortly.',
      errorTitle: 'An error occurred',
      errorMessage:
        'Your message could not be sent. Please try again or contact us directly by email.',
      required: 'Required field',
      invalidEmail: 'Invalid email address',
    },
    social: {
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      pinterest: 'Pinterest',
    },
  },

  legal: {
    mentions: 'Legal notice',
    privacy: 'Privacy policy',
    cookies: 'Cookies',
    copyright: (year: number) => `© ${year} Marion Dériot`,
  },

  errors: {
    notFound: 'Page not found',
    notFoundMessage: 'The page you are looking for does not exist or has been moved.',
    backHome: 'Back to home',
  },
};
