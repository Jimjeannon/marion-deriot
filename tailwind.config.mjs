// @ts-check
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // ─── Palette restreinte Marion Dériot ───────────────────────────────
      // Neutre profonds + un accent terreux/métallique. Pas d'or brillant.
      colors: {
        // Blanc cassé / fond principal
        ivory: {
          DEFAULT: '#F5F3EF',
          50: '#FAFAF8',
          100: '#F5F3EF',
          200: '#EAE6DE',
        },
        // Grège / textes secondaires, séparateurs
        greige: {
          DEFAULT: '#B8B0A4',
          100: '#E8E4DE',
          200: '#D4CDC4',
          300: '#B8B0A4',
          400: '#9E9489',
          500: '#857A6E',
        },
        // Anthracite / texte principal, UI
        anthracite: {
          DEFAULT: '#2C2B29',
          50: '#6B6A68',
          100: '#4F4E4C',
          200: '#3D3C3A',
          300: '#2C2B29',
          400: '#1E1D1C',
          500: '#111110',
        },
        // Accent terreux (cuivre mat, sable profond) — utiliser avec parcimonie
        accent: {
          DEFAULT: '#8B7355',
          light: '#A68B6A',
          dark: '#6B5540',
        },
      },

      // ─── Typographie ─────────────────────────────────────────────────────
      // Deux polices max : une serif éditoriale + une sans-serif neutre
      fontFamily: {
        // Serif éditoriale — pour titres, éléments de marque
        // Cormorant Garamond ou similaire (à charger via Google Fonts ou self-hosted)
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        // Sans-serif neutre — pour navigation, UI, corps de texte
        // DM Sans ou Instrument Sans
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },

      // Tailles de police — échelle aérée
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.2' }],
        'sm': ['0.875rem', { lineHeight: '1.4' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '4xl': ['2.5rem', { lineHeight: '1.1' }],
        '5xl': ['3.5rem', { lineHeight: '1.05' }],
        '6xl': ['5rem', { lineHeight: '1' }],
      },

      // ─── Espacement ───────────────────────────────────────────────────────
      // Généreux — espace blanc, marges franches
      spacing: {
        'sidebar': '240px',
        'sidebar-sm': '220px',
      },

      // ─── Easings personnalisés ────────────────────────────────────────────
      // Animations subtiles, jamais de bounce/élastique
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'entrance': 'cubic-bezier(0.0, 0, 0.2, 1)',
        'exit': 'cubic-bezier(0.4, 0, 1, 1)',
        'reveal': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },

      // ─── Durées d'animation ───────────────────────────────────────────────
      // 400-800ms — jamais trop rapide ni trop lent
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },

      // ─── Breakpoints ──────────────────────────────────────────────────────
      screens: {
        // Sidebar visible à partir de lg
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
