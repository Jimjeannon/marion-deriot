# CLAUDE.md — Site Marion Dériot, architecte d'intérieur (Boulogne-Billancourt / Paris)

## Contexte projet

Site web professionnel pour **Marion Dériot** — Agence Marion Dériot Architecture intérieure et Design, basée à Boulogne-Billancourt, projets principalement à Paris et en Île-de-France.

**Profil de la cliente** :
- Diplômée École Camondo en 1999 (mention) — architecture intérieure + design produit
- A collaboré avec Wilmotte & Associés, Bruno Moinard, Agence Ecart avant de fonder son agence
- Freelance depuis 2009, ~25 ans d'expérience cumulés, ~17 ans à son compte
- Clientèle : particuliers haut de gamme + professionnels
- Excellente réputation (Houzz 4.9/5)
- Site actuel à remplacer : `marionderiot.com` (à inspecter pour reprendre ce qui marche, identifier les ratés)
- Coordonnées pro : `marionderiot.archi@gmail.com` / `06 86 18 62 70` (exposition à valider — formulaire prioritaire vs lien direct)

**Public visé** : clients haut de gamme (résidentiel + commercial), niveau exigeant mais **sans tomber dans le clinquant "luxe"**.

**Objectifs du site** :
1. Mettre en valeur le portfolio en image-first (le travail parle de lui-même)
2. Asseoir l'autorité du studio (École Camondo, références Wilmotte / Moinard / Ecart, longévité)
3. Générer des leads qualifiés (particuliers + pro)

## Posture (à adopter à chaque session)

À chaque tâche, raisonne en croisant huit expertises :

- **UX/UI haut de gamme** — sobriété, espace, typographie, hiérarchie visuelle. Références mentales : galeries d'art, magazines type AD, studios Pierre Yovanovitch / Studio KO. **Pas** Versace.
- **Front-end senior Astro** — SSG par défaut, islands seulement si interactivité réelle, contenu via content collections ou Sanity.
- **SEO** — sémantique HTML stricte, schema.org (LocalBusiness, CreativeWork), Core Web Vitals verts, sitemap, hreflang.
- **Accessibilité RGAA 4.1 / WCAG 2.2 AA** — contraste, navigation clavier, lecteurs d'écran, ARIA pertinent.
- **RGPD** — minimisation des données, consentement explicite, hébergement EU, mentions légales obligatoires.
- **Performance** — images AVIF/WebP, LCP < 2.0s, CLS < 0.05, JS minimal.
- **Animation/fluidité** — View Transitions natives Astro, animations subtiles, jamais "showy". `prefers-reduced-motion` respecté.
- **Sécurité** — headers (CSP, HSTS, X-Frame-Options), zéro secret en clair, validation serveur pour formulaires et admin.

## Voix de marque & ton éditorial

Marion s'exprime en paragraphes structurés, avec un vocabulaire sensoriel et technique. Toute copy générée pour le site (UI strings, meta descriptions, contenu Sanity) doit s'aligner.

**Vocabulaire à privilégier** : sur-mesure, intemporel, harmonie, confort, sensible, esthétique, technique, détail, matériaux, textures, assemblage, métiers d'art, artisanat, savoir-faire, conception, réalisation.

**Univers d'inspiration assumé** : architecture, arts décoratifs, voyages, salons, musées.

**Ton** : posé, expert, précis, sensoriel. Phrases construites. Pas d'anglicismes inutiles.

**À bannir absolument** :
- ❌ Adjectifs en surenchère : "incroyable", "fabuleux", "exceptionnel", "magnifique"
- ❌ Vocabulaire luxe-bling : "prestige", "exclusif", "VIP", "haut de gamme" (en texte client — c'est un positionnement interne, pas un argument à brandir)
- ❌ Formules marketing : "transformez votre espace", "vivez l'expérience", "donnez vie à vos rêves"
- ❌ Anglicismes décoratifs : "lifestyle", "showroom" (utiliser "studio"), "feature"
- ❌ Émojis, ponctuation expressive (!!!, ...)

## Stack technique

- **Framework** : Astro (latest stable), TypeScript strict
- **Style** : Tailwind CSS + design tokens custom dans `tailwind.config`
- **CMS** : Sanity (région EU obligatoire — paramètre à la création du projet), Sanity Studio embarqué sur `/admin`
- **i18n** : Astro i18n natif. FR par défaut (`/`), EN sur `/en/`
- **Animations** : CSS + Astro View Transitions. GSAP uniquement si cas justifié.
- **Forms** : Astro Actions + Resend ou Postmark pour les emails
- **Analytics** : Plausible (cloud EU) ou Matomo en mode anonymisé
- **Hosting** : Vercel (région CDG) ou Cloudflare Pages
- **Cookie consent** : tarteaucitron ou solution minimale custom

## Architecture du site

### Landing — `/` et `/en/`

Page d'entrée minimaliste et très sobre :
- Logo « Marion Dériot — architecte d'intérieur » centré
- Slideshow d'images de projets en fond, ordre **aléatoire à chaque visite**
- Élément d'accès à la homepage avec **animation évocatrice d'une ouverture de porte** : transition latérale, fondu progressif ou révélation — à designer subtilement, jamais cliché
- Aucune navigation, aucun footer

### Homepage `/home` et pages internes — layout sidebar

Toutes les pages après la landing partagent un **layout à sidebar gauche fixe** (voir section *Layout & navigation* plus bas).

### Projets — `/projets` et `/projets/[slug]`

- **`/projets`** : grille de tous les projets. Chaque carte affiche 2-3 images en **mosaïque asymétrique moderne** + titre. Pattern identique pour chaque projet (cohérence).
- **`/projets/[slug]`** : titre du projet + les 2-3 images de preview affichées en grand. **Aucune description, aucune métadonnée affichée pour le moment** — focus pur sur l'image.
- **Diaporama immersif** : clic sur une image → ouverture en plein écran. Navigation clavier (← → Esc), swipe mobile, fermeture au clic sur fond. **Gère les formats paysage ET portrait** : centrage adaptatif, jamais de crop ni de stretch, fond neutre profond.
- **Convention de nommage des projets** : par lieu, en MAJUSCULES dans l'UI (ex. CAMBACERES, VAUCRESSON, SQUARE DE VALOIS, BOURDONNAIS, LAVOISIER) — cohérent avec le site existant et l'esthétique éditoriale. Slug en minuscules sans accents (`cambaceres`, `square-de-valois`).

### Info — `/info`

Section unique combinant présentation et contact :
- Photo de l'architecte
- Texte de présentation : parcours École Camondo + collaborations (Wilmotte, Bruno Moinard, Ecart) + approche
- Adresse du studio à Boulogne-Billancourt
- Liens réseaux sociaux : LinkedIn, Instagram, Facebook, Pinterest
- **Formulaire de contact simple** : nom, email, type de projet, message libre. Pas de demande de devis détaillé — l'objectif est de démarrer une conversation.
- Email et téléphone pro affichés (à valider avec Marion : exposition directe vs derrière formulaire pour limiter le spam)

### Pages légales — `/mentions-legales`, `/politique-confidentialite`, `/cookies`

- Accessibles depuis le footer de la sidebar (liens discrets)
- Contenu strict RGPD + LCEN

### Admin — `/admin`

- **Sanity Studio embarqué** sur la route `/admin`
- **Invisible depuis le site public** : aucun lien, exclu du sitemap.xml, exclu via robots.txt
- Authentification Sanity native
- Permet l'upload d'un projet : titre (FR + EN), images (drag-drop, réordonnables), désignation des **2-3 images de preview** via flag dédié dans le schema
- Création d'un projet → nouvelle entrée dans la liste publique, slug auto-généré (FR + EN)

## Layout & navigation — règles transverses

- **Sidebar gauche fixe** (largeur ~280-320px) sur desktop ≥ 1024px
  - Logo en haut, cliquable → retour à `/home`
  - Nav verticale : Home / Projets (dropdown listant les titres) / Info
  - Réseaux sociaux : icônes uniquement, en bas, ouvrent en nouvel onglet avec `rel="noopener noreferrer"`
  - Switch FR/EN discret en bas
  - Liens légaux en très petit, en bas
- **Mobile/tablette < 1024px** : sidebar bascule en drawer overlay déclenché par bouton hamburger
- Indicateur visuel de la page active (souligné, point, ou changement de couleur subtil)
- Le dropdown « Projets » s'expand/collapse dans la sidebar elle-même

## Structure du projet (dossiers)

```
src/
  components/
    ui/              # Primitives (Button, Card, Input…)
    sections/        # Sections de page (Hero, Portfolio, Contact…)
    layout/          # Sidebar, Drawer, Footer légal
  content/           # Content collections, schemas
  layouts/           # Layouts Astro (avec/sans sidebar)
  pages/             # Routes (FR par défaut)
    en/              # Routes EN
    admin/           # Sanity Studio
  styles/            # Globals, tokens CSS
  lib/               # Utilitaires, client Sanity
  i18n/              # Dictionnaires UI (FR/EN)
public/              # Assets statiques
sanity/              # Schemas Sanity
```

## Modèle de données « Projet »

Un projet contient (v1, minimaliste) :
- titre (FR + EN), slug (FR + EN, généré auto)
- catégorie (résidentiel / commercial / hôtelier / autre)
- année (optionnel)
- galerie d'images (alt FR/EN, hotspot Sanity, ordre)
- **flag `isPreview` sur les images** : les 2-3 marquées s'affichent sur `/projets` et sur la page projet ; **toutes** s'affichent dans le diaporama
- SEO meta (title, description, OG image) FR + EN

> **Note v2** : lieu, surface, description longue, témoignage client, plans, vidéo, crédits photographe — à ajouter uniquement si l'architecte en exprime le besoin. Ne pas anticiper.

## Conventions de code

- Composants : PascalCase, un fichier = un composant
- Props typées, jamais de `any`
- Astro components > React islands (sauf interactivité réelle)
- Tailwind d'abord ; CSS modules pour cas complexes
- Pas de `console.log` en commit
- Imports : alias `@/` configuré dans `tsconfig.json`
- Commits : conventional commits (`feat:`, `fix:`, `chore:`…)

## Performance — budget non négociable

- LCP < 2.0s (4G simulé)
- CLS < 0.05
- JS initial < 100 kB gzip
- Images : toujours `<Image>` Astro ou Sanity URL builder. **Jamais** `<img>` brut. AVIF prioritaire, fallback WebP.
- Slideshow landing : preload uniquement la 1ère image, lazy le reste
- Pas de dépendance > 30 kB sans justification écrite

## SEO — exigences

- Un `<h1>` unique par page
- Meta title 50-60 chars, description 150-160 chars
- `hreflang` FR/EN sur toutes les pages bilingues
- Schema.org : `LocalBusiness` (home + info) avec adresse Boulogne-Billancourt, `CreativeWork` (projets), `BreadcrumbList`
- **SEO local** : cibler Boulogne-Billancourt + Paris (et arrondissements clés vu les références projets : 7e, 15e, 16e). Google Business Profile à connecter.
- Sitemap XML + robots.txt (`/admin` exclus des deux)
- URLs lisibles, slugs sans accents
- Open Graph + Twitter Card sur chaque page

## Accessibilité — exigences

- Conformité RGAA 4.1 niveau AA visée
- Contraste min 4.5:1 (texte normal), 3:1 (texte large)
- Navigation clavier complète, focus visible custom mais évident
- Skip link en début de page
- `prefers-reduced-motion` respecté sur **toutes** les animations (landing, View Transitions, diaporama)
- Diaporama : navigable clavier, annoncé aux lecteurs d'écran (ARIA), Esc pour fermer
- Alt text obligatoire sur toute image (`alt=""` si purement décorative)

## RGPD — règles

- Aucun cookie tiers avant consentement explicite
- Données formulaire contact : conservation 3 ans max, documentée dans politique de confidentialité
- Hébergement Sanity en région EU (vérifier au démarrage du projet)
- Analytics cookieless (Plausible) ou anonymisé (Matomo)
- Mentions légales, politique de confidentialité, politique cookies obligatoires, accessibles depuis le footer de la sidebar

## Sécurité

- Headers HTTP : CSP stricte, HSTS, X-Content-Type-Options, Referrer-Policy
- Variables d'env jamais committées ; `.env.example` documenté
- Admin Sanity protégé par auth Sanity native (jamais de bypass)
- Formulaires : rate limiting + validation Zod côté serveur
- `npm audit` en CI, dépendances revues mensuellement

## Design — esprit « haut de gamme, pas luxe »

- Palette restreinte : neutres profonds (off-white, grège, anthracite, un accent terreux ou métallique). **Pas d'or brillant.**
- Typo : une serif éditoriale + une sans-serif neutre. 2 polices max.
- Espace blanc généreux, grilles aérées, marges franches
- Photos en grand, mises en valeur — jamais en placement décoratif
- Animations : easings sur mesure (cubic-bezier doux), durées 400-800ms, jamais de bounce/élastique
- Transition « ouverture de porte » : doit rester subtile et élégante, pas littérale

## Commandes

- `npm run dev` — serveur local
- `npm run build` — build production (zéro warning attendu)
- `npm run preview` — preview du build
- `npm run lint` — ESLint + Prettier
- `npm run typecheck` — `tsc --noEmit`
- `npm run test` — (à mettre en place)

## Never do

- ❌ Installer une dépendance lourde sans justification (Framer Motion, Lottie, UI kits…)
- ❌ Utiliser `<img>` brut (toujours `<Image>` Astro ou Sanity)
- ❌ Hardcoder du texte FR/EN dans les composants (toujours via i18n dict)
- ❌ Hardcoder la liste des projets : tout passe par Sanity
- ❌ Cropper ou stretcher une image dans le diaporama (respect du format paysage/portrait)
- ❌ Lier `/admin` depuis le site public, l'inclure dans `sitemap.xml`, ou oublier de l'exclure via `robots.txt`
- ❌ Ajouter du tracking sans consent ni justification RGPD
- ❌ Committer des secrets, URLs admin, données clients
- ❌ Ajouter une animation sans `prefers-reduced-motion`
- ❌ Modifier un schema Sanity sans le documenter
- ❌ Repousser l'a11y à "plus tard"
- ❌ Anticiper sur le modèle de données v2 (lieu, surface, etc.) sans demande explicite

## Quand tu n'es pas sûr

- **Plan mode d'abord.** Toujours, pour tout changement multi-fichiers ou architectural.
- Choix qui impacte la stack ou le data model → pose la question avant.
- Feature qui peut compromettre RGPD / a11y / perf → flag-la avant d'implémenter.
- Tu peux toujours demander une référence visuelle ou un exemple existant si la consigne est ambiguë.
