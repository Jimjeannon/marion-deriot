# Plan de Modifications — Homepage Marion Dériot

**Date :** 29 mai 2026  
**Objectifs :** Restructuration responsive, intégration Sanity, validation email contact

---

## 1. Modifications CSS — `src/pages/home.astro`

### 1.1 Breakpoint Tablette (640px — 1023px)

**Ajouter après la règle mobile `@media (max-width: 640px)` :**

```css
/* ── Tablette : 2 colonnes ────────────────────────────────────────────────── */
@media (min-width: 641px) and (max-width: 1023px) {
  .home-materials__grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    padding: clamp(12px, 2.5vw, 18px);
    gap: clamp(12px, 2.5vw, 18px);
  }

  .home-materials__cell--tall {
    grid-row: span 1;  /* Annuler le span de 2 en desktop */
  }

  .home-materials__cell--wide {
    grid-row: span 1;
  }

  /* Augmenter légèrement la hauteur pour meilleure présence */
  .home-materials {
    /* grid-auto-rows: 200px; */
  }
}
```

### 1.2 Augmenter Hauteur Mobile

**Modifier la règle `@media (max-width: 640px)` :**

```css
@media (max-width: 640px) {
  .home-materials__grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, minmax(160px, 1fr));  /* 160px min au lieu de flexible */
    padding: clamp(12px, 3vw, 16px);  /* Augmenté de 8px → 12px */
    gap: clamp(12px, 3vw, 16px);      /* Idem */
  }
  
  .home-materials__cell--tall {
    grid-row: span 1;
  }
}
```

### 1.3 Améliorer le Padding Global

**Modifier `home-content` et `home-materials__grid` pour padding plus généreux :**

```css
.home-materials__grid {
  flex: 1 1 0;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  background: #FFFFFF;
  padding: clamp(16px, 2.5vw, 28px);  /* Augmenté de 14px → 16px min */
  gap: clamp(16px, 2.5vw, 28px);      /* Idem */
}
```

---

## 2. Intégration des Images Sanity

### 2.1 Modifier le Front Matter — `src/pages/home.astro`

**Remplacer les imports et le code actuels :**

```astro
---
/**
 * Homepage FR — /home
 * Layout sidebar. Images dynamiques depuis Sanity (projets).
 */
import MainLayout from '@/layouts/MainLayout.astro';
import { getDict } from '@/i18n';
import { getAllProjects } from '@/lib/projects';
import { resolveImageUrl, type SanityImage } from '@/lib/sanity';
import { getPreviewImages, getLocalized } from '@/lib/projects';

const t = getDict('fr');

// Charger les 6 premiers projets — ou mélanger pour variation
const projects = await getAllProjects();
const featured = projects.slice(0, 6);

// Extraire 1 image par projet pour la homepage
const homeImages = featured.map(project => {
  const previewImages = getPreviewImages(project);
  const imageData = previewImages[0]; // Prendre la 1ère image de preview
  
  return {
    src: resolveImageUrl(imageData, 1200) ?? '/images/acceuil/placeholder.webp',
    alt: imageData.alt ? getLocalized(imageData.alt, 'fr') : project.title.fr,
    projectSlug: project.slug.fr.current,
    projectTitle: project.title.fr,
  };
});

const pageTitle = t.home.title;
const pageDescription = t.home.metaDescription;
---
```

### 2.2 Modifier le HTML — Images Dynamiques

**Remplacer la section `.home-materials__grid` :**

```astro
<section class="home-materials" aria-label="Réalisations Marion Dériot">
  <div class="home-materials__grid">
    {homeImages.map((image, index) => (
      <a
        href={`/projets/${image.projectSlug}`}
        class="home-materials__cell home-materials__cell--link"
        title={`Voir le projet ${image.projectTitle}`}
      >
        <img
          src={image.src}
          alt={image.alt}
          class="home-materials__img"
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={index === 0 ? 'high' : 'auto'}
        />
        <div class="home-materials__overlay">
          <span class="home-materials__project-title">{image.projectTitle}</span>
        </div>
      </a>
    ))}
  </div>
</section>
```

### 2.3 Ajouter Styles pour Overlay + Lien

**Ajouter au `<style is:global>` :**

```css
/* ── Lien cliquable + overlay au survol ───────────────────────────────────── */
.home-materials__cell--link {
  position: relative;
  text-decoration: none;
  display: block;
  cursor: pointer;
}

.home-materials__cell--link:focus-visible {
  outline: 2px solid #2A2926;
  outline-offset: 2px;
}

/* Overlay au survol — fond gradient + titre du projet */
.home-materials__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(30, 25, 20, 0.5) 0%,
    rgba(30, 25, 20, 0.2) 50%,
    transparent 100%
  );
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: clamp(12px, 2vw, 20px);
  opacity: 0;
  transition: opacity 400ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.home-materials__cell--link:hover .home-materials__overlay,
.home-materials__cell--link:focus-visible .home-materials__overlay {
  opacity: 1;
}

.home-materials__project-title {
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 252, 247, 0.95);
  line-height: 1.2;
}

/* Mobile : overlay visible au tap */
@media (max-width: 640px) {
  .home-materials__overlay {
    opacity: 0.8;
  }
}
```

---

## 3. Validation Formulaire Contact — Email

### 3.1 Vérifier la Configuration

**Fichier :** `src/actions/contact.ts` ou équivalent

```typescript
// Vérifier que l'email destinataire est défini :
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'marionderiot.archi@gmail.com';

// S'assurer qu'il est :
// ✓ marionderiot.archi@gmail.com
// ✓ Défini dans .env (ne pas hardcoder en production)
```

### 3.2 Fichier `.env.example`

**Ajouter/confirmer :**

```
CONTACT_EMAIL=marionderiot.archi@gmail.com
CONTACT_SERVICE=resend  # ou postmark
CONTACT_API_KEY=<votre_clé_api>
```

### 3.3 Page `/info.astro` — Validation Sanity

**Vérifier que le formulaire POST est correctement configuré :**

```astro
<!-- Ligne ~121 : vérifier le endpoint -->
<form
  id="contact-form"
  method="POST"
  action="/api/contact"  <!-- ✓ Correct -->
  class="space-y-6"
  novalidate
>
```

---

## 4. Checklist de Déploiement

### Phase 1 : Modifications CSS
- [ ] Ajouter breakpoint tablette (640px — 1023px) → 2 colonnes
- [ ] Augmenter hauteur mobile (160px min)
- [ ] Augmenter padding/gap global (clamp updated)
- [ ] Ajouter styles overlay + liens

### Phase 2 : Intégration Sanity
- [ ] Importer `getAllProjects`, `getPreviewImages`, `resolveImageUrl`
- [ ] Remplacer hardcoding des 6 images
- [ ] Mapper les images vers les projets
- [ ] Ajouter `<a>` links vers pages projets

### Phase 3 : Contact Email
- [ ] Vérifier .env → CONTACT_EMAIL
- [ ] Confirmer service email (Resend/Postmark)
- [ ] Tester soumission formulaire /info

### Phase 4 : Tests
- [ ] Mobile 375px : défilement, hauteur images OK
- [ ] Tablette 768px : 2 colonnes visibles
- [ ] Desktop 1280px : 3 colonnes asymétriques
- [ ] Clic image → navigation vers page projet
- [ ] Overlay titre visible au survol (desktop) et au tap (mobile)
- [ ] Formulaire /info → email reçu à marionderiot.archi@gmail.com
- [ ] Web Vitals : LCP, CLS, FID

---

## 5. Fichiers à Modifier

```
src/
├── pages/
│   ├── home.astro              ← MODIFIER (intégration Sanity + CSS)
│   └── en/home.astro           ← MODIFIER (idem en anglais)
├── .env.example                ← VÉRIFIER (CONTACT_EMAIL)
└── actions/
    └── contact.ts ou index.ts   ← VÉRIFIER (endpoint email)
```

---

## 6. Notes de Performance

- **Images Sanity :** Utiliser `resolveImageUrl(image, 1200)` pour resize
- **Format :** AVIF prioritaire, WebP fallback (Astro Image + Sanity URL builder)
- **Preload :** 1ère image eager + high fetchpriority, reste lazy
- **LCP Target :** < 2.0s (4G simulé)

---

## 7. Notes d'Accessibilité

- ✓ Alt-text obligatoire sur chaque image
- ✓ Liens cliquables avec label clair (`title=`)
- ✓ Focus-visible sur liens (outline 2px)
- ✓ Overlay lisible (contraste blanc sur fond assombri)
- ✓ `prefers-reduced-motion` respecté sur animations
- ✓ Lien accessible au clavier et au toucher

---

## Roadmap Visuelle

```
Desktop (1280px)          Tablette (768px)          Mobile (375px)
┌─────────────────────┐  ┌─────────────────────┐  ┌──────────┐
│ ┌──────┬──┬──┐      │  │ ┌────────┬────────┐ │  │ ┌──────┐ │
│ │      │  │  │      │  │ │        │        │ │  │ │      │ │
│ │ BIG  │  │  │      │  │ │        │        │ │  │ │  IMG │ │
│ │ IMG  │  │  │      │  │ ├────────┼────────┤ │  │ ├──────┤ │
│ ├──────┼──┼──┤      │  │ │        │        │ │  │ │      │ │
│ │      │  │  │ BIG  │  │ │        │        │ │  │ │  IMG │ │
│ │      │  │  │      │  │ └────────┴────────┘ │  │ ├──────┤ │
│ │      │  │  │ IMG  │  │ ┌────────┬────────┐ │  │ │      │ │
│ └──────┴──┴──┘      │  │ │        │        │ │  │ │  IMG │ │
│                     │  │ │        │        │ │  │ └──────┘ │
└─────────────────────┘  │ └────────┴────────┘ │  └──────────┘
3 col × 2 rows          2 col × 3 rows         1 col × 6 rows
(asymétrique)           (régulier)             (empilé)

AVANT (Mobile mauvais)   APRÈS (Mobile bon)
┌────────┐              ┌────────┐
│ IMG ↕  │              │ IMG ↕  │
│ 120px  │  ❌          │ 160px  │  ✓
├────────┤              ├────────┤
gap: 8px               gap: 12px
```

---

## Document d'Analyse Détaillé

Voir : `ANALYSE_HOMEPAGE_RESPONSIVE.html` (pour visualisation interactive des breakpoints)
