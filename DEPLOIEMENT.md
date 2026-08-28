# Déploiement — Marion Dériot

Guide de mise en ligne : **preprod + production sur Netlify**, contenu géré par la
cliente via `/admin`.

---

## 1. Comment le site est architecturé

```
  Cliente ──▶ /admin  ──écrit──▶  Sanity (base de données hébergée, EU)
                                        │
  Visiteur ──▶ /projets ──lit à chaque requête──┘
```

**Il n'y a pas d'autre base de données à créer.** Sanity *est* la base de données.

- Le projet Sanity existe déjà : `t4wzgksq`, dataset `production`.
- L'interface `/admin` écrit dedans via `SANITY_API_WRITE_TOKEN`
  (`src/pages/api/admin/**`, `src/lib/sanity-write.ts`).
- `/projets` et `/projets/[slug]` sont en `prerender = false` : elles interrogent
  Sanity **à chaque visite**. Une modification faite dans `/admin` est donc
  visible immédiatement — **aucun redéploiement, aucun webhook nécessaire**.
- `src/data/projects-catalog.ts` reste la source de secours et définit l'**ordre
  éditorial** des projets. La fusion se fait dans `src/lib/projects.ts` : les
  champs saisis dans l'admin priment sur le catalogue local.
- La home (`/home`) est statique : ses 12 images vivent dans `src/assets/home/`
  et sont optimisées au build. Les changer demande une modification du code.

### Pourquoi Netlify et pas Vercel

Le plan **Vercel Hobby est réservé à un usage non commercial et personnel**
(fair use guidelines). Un site d'agence est un usage commercial : il faudrait
passer en Pro à 20 $/mois. Netlify autorise l'usage commercial sur son offre
gratuite, et le projet est déjà configuré pour lui (`@astrojs/netlify` +
`netlify.toml`). Cloudflare Pages serait la seule alternative gratuite
équivalente, mais demanderait de changer d'adaptateur.

---

## 2. À faire AVANT la première mise en ligne

- [ ] **Changer `ADMIN_ACCESS_CODE`.** Le code actuel commence par le nom de la
      cliente : devinable. Générer 16 caractères aléatoires :
      `node -e "console.log(require('crypto').randomBytes(12).toString('base64url'))"`
- [ ] **Formulaire de contact hors service.** `src/pages/api/_contact.ts` commence
      par un `_` : Astro **exclut du routage** tout fichier préfixé ainsi. La page
      `/info` poste vers `/api/contact`, qui renvoie donc un 404. Il faut renommer
      le fichier en `contact.ts` **et** renseigner une vraie `RESEND_API_KEY`
      (aujourd'hui c'est encore le texte d'exemple).
- [ ] **Vérifier que Sanity contient bien les 14 projets** : `npm run dev` puis
      ouvrir `/projets`. Si la liste est vide ou incomplète, le catalogue local
      prend le relais mais l'admin n'aura rien à modifier.
- [ ] **Tester le build en local** : `npm run build && npm run preview`.

### Point à savoir sur le plan gratuit Sanity

Les datasets du plan gratuit sont **publics** : n'importe qui connaissant l'ID
projet peut lire les données via l'API. Sans conséquence ici (un portfolio est
public par nature), mais ne jamais y stocker d'information confidentielle.
Limites incluses : 20 utilisateurs, 10 000 documents, 100 Go de bande passante,
100 Go d'assets. Très au-dessus des besoins du site.

---

## 3. Mise en production

### Étape 1 — Créer le site sur Netlify

1. https://app.netlify.com → **Add new site** → **Import an existing project**
2. Connecter GitHub, choisir `Jimjeannon/marion-deriot`
3. Netlify lit `netlify.toml` : la commande (`npm run build`), le dossier publié
   (`dist`) et Node 20 sont déjà configurés. Ne rien changer.
4. **Ne pas déployer tout de suite** — d'abord les variables d'environnement.

### Étape 2 — Variables d'environnement

**Site configuration → Environment variables.** Recopier depuis le `.env` local
(qui n'est pas — et ne doit jamais être — versionné) :

| Variable | Portée | Note |
| --- | --- | --- |
| `ADMIN_ACCESS_CODE` | secret | le **nouveau** code, pas l'ancien |
| `PUBLIC_SANITY_PROJECT_ID` | public | `t4wzgksq` |
| `PUBLIC_SANITY_DATASET` | public | `production` |
| `SANITY_API_WRITE_TOKEN` | secret | token Editor Sanity |
| `RESEND_API_KEY` | secret | à créer sur resend.com |
| `CONTACT_EMAIL_TO` | — | adresse de réception |
| `CONTACT_EMAIL_FROM` | — | domaine vérifié chez Resend |
| `PUBLIC_SITE_URL` | public | l'URL finale, **sans slash final** |

`PUBLIC_SITE_URL` alimente `site` dans `astro.config.mjs` : canoniques, Open
Graph et données structurées en dépendent. Une valeur erronée dégrade le SEO.

### Étape 3 — Domaine et HTTPS

**Domain management → Add a domain.** Netlify fournit le certificat Let's Encrypt
automatiquement. Chez le registrar, pointer :

- `marionderiot.com` → enregistrement A vers l'IP donnée par Netlify (ou ALIAS)
- `www` → CNAME vers `<nom-du-site>.netlify.app`

Compter jusqu'à 24 h de propagation DNS. Mettre à jour `PUBLIC_SITE_URL` ensuite
et relancer un déploiement.

### Étape 4 — La preprod

Créer une branche de travail :

```bash
git checkout -b staging
git push -u origin staging
```

Sur Netlify : **Site configuration → Build & deploy → Branches and deploy
contexts** → ajouter `staging` aux *branch deploys*. Elle sera servie sur
`https://staging--<nom-du-site>.netlify.app`.

Deux précautions :

- Protéger cette URL par mot de passe (**Access control**) pour qu'elle ne soit
  pas indexée ni visitée par erreur.
- Les variables d'environnement peuvent être définies par contexte. Garder le
  **même dataset Sanity** en preprod et en prod : la cliente n'a alors qu'un seul
  endroit où éditer, et la preprod montre le contenu réel. Ne créer un dataset
  `staging` séparé que le jour où vous voudrez tester une modification du modèle
  de données.

Workflow :

```
staging  ──▶  vous testez sur l'URL de preprod
   │
   └── merge ──▶  main  ──▶  production
```

### Étape 5 — Vérifications après mise en ligne

- [ ] `/` et `/home` s'affichent, les 12 images se chargent
- [ ] `/projets` liste bien les 14 projets
- [ ] `/projets/lavoisier` (et 2–3 autres fiches) s'ouvrent
- [ ] `/admin` demande le code, puis permet de modifier un titre → vérifier que
      le changement apparaît sur `/projets` après un simple rechargement
- [ ] Upload d'une image depuis `/admin` (route serverless, à tester en réel)
- [ ] Formulaire de contact : un mail arrive bien
- [ ] `/robots.txt` et `/sitemap.xml` répondent
- [ ] `/admin` renvoie bien `X-Robots-Tag: noindex` (configuré dans `netlify.toml`)
- [ ] Console navigateur sans erreur CSP (voir `src/middleware.ts`)

---

## 4. Au quotidien

**La cliente** ne touche qu'à `/admin` : titres, descriptions, ordre et images des
projets. Ses modifications sont en ligne immédiatement.

**Vous** modifiez le code, poussez sur `staging`, vérifiez, puis mergez dans
`main`. Chaque push déclenche un déploiement automatique.

Pour revenir en arrière : **Deploys → Published deploy → Publish deploy** sur une
version précédente. Instantané.

---

## 5. Points de vigilance

- **Ne jamais committer `.env`.** Il est dans `.gitignore` — vérifier avant chaque
  `git add .` que rien de sensible ne remonte.
- **`public/images/` pèse environ 100 Mo** (535 fichiers). Netlify l'accepte, mais
  ces images sont servies brutes, sans passer par le pipeline d'optimisation
  d'Astro. Si les Core Web Vitals se dégradent, les migrer vers Sanity (qui sert
  du WebP redimensionné à la volée) ou vers `src/assets/`.
- **Deux fichiers orphelins** dans `public/images/projets/Lavoisier/` : `1ère
  page.jpg` / `.webp`. Ils ne sont référencés nulle part et leur nom contient un
  accent en forme décomposée, source d'ennuis entre Windows et Linux. À supprimer.
- **Le token Sanity est un secret.** S'il fuite, quelqu'un peut écrire dans la
  base. Le régénérer depuis sanity.io/manage en cas de doute.
- **Sitemap** : la génération automatique est désactivée dans `astro.config.mjs`
  (conflit i18n). Le `public/sitemap.xml` est écrit à la main — le tenir à jour
  quand des pages sont ajoutées.
