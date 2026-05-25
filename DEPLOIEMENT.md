# Déploiement — diagnostic et solutions

## Causes probables des échecs Vercel/Netlify

### 1. Taille du dépôt (cause principale suspectée)

`public/images/projets/` pèse **963 MB**. Total déploiement : **~1 GB**.

Limites :

| Plateforme | Limite par déploiement | Limite par fichier |
| --- | --- | --- |
| **Vercel Hobby** | 100 MB (asset upload) | 50 MB |
| **Vercel Pro** | ~5 GB total | 250 MB |
| **Netlify** | Pas de limite stricte mais build timeout 15-30 min | 25 MB par fichier individuel |
| **Cloudflare Pages** | 25 GB total | 25 MB par fichier |

Tant que les images ne sont pas réduites ou hébergées ailleurs, **aucune plateforme gratuite** n'acceptera ce projet tel quel.

### 2. Fichiers parasites macOS

96 fichiers `._*` (métadonnées AppleDouble) dans `public/`. Inutiles, à supprimer.

Script ajouté :

```bash
npm run clean:macos
```

Il tourne aussi automatiquement avant chaque `npm run build` (hook `prebuild`).

### 3. Configurations corrigées dans ce passage

- **`vercel.json`** : retiré `outputDirectory` et le bloc `functions` (tous deux ignorés/redondants quand on utilise l'adaptateur `@astrojs/vercel` — la Build Output API gère ça nativement). Ajouté `framework: "astro"` et headers de sécurité.
- **`astro.config.mjs`** : `webAnalytics` n'est plus activé que si `process.env.VERCEL` existe (sinon Netlify/Cloudflare tentaient de charger `/_vercel/insights/*` qui n'existe pas). Ajouté `ssr.noExternal` pour Sanity (évite des warnings serverless).
- **`.vercelignore`** ajouté : exclut `.vercel/output` local (sinon Vercel ré-uploade le build d'1 GB déjà fait localement), `node_modules`, fichiers macOS, docs.

## Solutions rapides (par ordre d'effort croissant)

### Option A — Vercel CLI direct (rapide si la taille passe après nettoyage)

```bash
npm i -g vercel
npm run clean:macos        # supprime les 96 fichiers macOS
vercel --prod              # déploie le repo local en ignorant ce que git voit
```

Le `.vercelignore` empêche l'upload du build local et des `node_modules`. Si Vercel se plaint encore de la taille, passe à l'option B.

### Option B — Cloudflare Pages (le plus tolérant côté taille)

Recommandé si tu veux déployer **sans toucher aux images tout de suite**. Limites : 25 MB par fichier individuel uniquement (donc il faudra quand même compresser les rares fichiers > 25 MB — 41 fichiers > 10 MB chez toi, à vérifier combien > 25 MB).

Étapes :

```bash
# 1. Installer l'adaptateur Cloudflare
npm install @astrojs/cloudflare
npm uninstall @astrojs/vercel

# 2. Modifier astro.config.mjs : remplacer vercel() par cloudflare()
#    import cloudflare from '@astrojs/cloudflare';
#    adapter: cloudflare(),
#    output: 'hybrid'  (déjà bon)

# 3. Connecter le repo via dashboard Cloudflare → Pages → Create
#    Build command : npm run build
#    Output directory : dist
```

Cloudflare Pages :
- CDN mondial gratuit, EU par défaut
- Pas de timeout strict sur la durée du build
- Pages Functions pour le SSR (compat `output: hybrid`)
- Variables d'env à recopier depuis `.env` dans le dashboard

### Option C — Netlify (déconseillé en l'état)

Netlify nécessite l'adaptateur `@astrojs/netlify`. Migration plus lourde et la limite de 25 MB par fichier individuel est plus stricte qu'on ne pense — donc même problème que Cloudflare sur les gros JPG, sans le confort.

### Option D — Solution propre long-terme (conforme à CLAUDE.md)

Migrer toutes les images vers **Sanity** (CDN inclus, EU, ce qui était prévu d'origine) :
- Les images ne sont plus dans `public/`, mais référencées via `urlFor(image)` côté code
- Le repo passe sous 50 MB
- Vercel/Netlify/Cloudflare passent tous sans effort
- Bonus : transformations à la volée (WebP/AVIF, resize, focal point)

Effort estimé : ~2 h pour scripter l'upload des 356 fichiers + adapter le code (déjà à moitié prêt, voir `src/lib/sanity.ts` et le flag `isSanityConfigured`).

## Pour aller plus vite si tu gères les images toi-même

Une fois les images compressées sous 200 MB total, **tout fonctionnera sur Vercel Hobby**. Outils suggérés :

- **ImageOptim** (Mac, gratuit, drag-and-drop) — réduction sans perte visible
- **Squoosh CLI** : `npx @squoosh/cli --webp '{"quality":82}' public/images/projets/**/*.jpg`
- **sharp-cli** : `npx sharp-cli -i 'public/images/projets/**/*.jpg' -o public/images/projets/ resize 2400 --withoutEnlargement -f jpeg --quality 82`

Objectif : 2400 px max sur le grand côté, qualité 82, format AVIF si possible.

## Checklist avant push

- [ ] `npm run clean:macos` exécuté (ou trust le hook `prebuild`)
- [ ] Images compressées (`public/` < 200 MB idéalement)
- [ ] `.env` jamais commité (déjà dans `.gitignore`)
- [ ] Variables d'env recopiées dans le dashboard Vercel/Cloudflare
  - `ADMIN_ACCESS_CODE`
  - `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`
  - `SANITY_API_WRITE_TOKEN`
  - `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM`
  - `PUBLIC_SITE_URL`
- [ ] `npm run build` passe en local sans warning
