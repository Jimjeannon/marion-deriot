# 📋 Guide d'Administration - Upload d'Images

## 🎯 Page Admin de Diagnostic

Une nouvelle page admin a été créée pour diagnostiquer les erreurs d'upload d'images.

**URL:** `https://marionderiot.com/admin/image-upload`

---

## ✨ Fonctionnalités

### 1️⃣ **Diagnostic Automatique**
Avant d'uploader une image, le système vérifie automatiquement :

- ✅ Validité du fichier (format, taille, intégrité)
- ✅ Validité du token Sanity
- ✅ Permissions utilisateur
- ✅ Quotas disponibles
- ✅ Connectivité à Sanity
- ✅ Rate limiting
- ✅ État du projet

### 2️⃣ **Messages d'Erreur Clairs**
Au lieu d'une erreur 400 générique, vous verrez :

```
❌ ERREUR CRITIQUE: FILE_TOO_LARGE
   "Fichier trop volumineux: 45.23MB"
   💡 Solution: Compressez l'image (maximum 20MB)
```

### 3️⃣ **Guide de Dépannage Intégré**
La page contient des réponses aux problèmes courants :
- Erreur 400 — Fichier trop volumineux
- Erreur 400 — Format invalide
- Erreur 401 — Token expiré
- Erreur 403 — Permissions insuffisantes
- Erreur 429 — Rate limit dépassé
- Erreur 500 — Serveur indisponible

### 4️⃣ **Bonnes Pratiques**
Des conseils pour optimiser vos uploads :
- Format optimal (WebP)
- Taille idéale (1600x900, < 500KB)
- Noms de fichiers corrects

---

## 🚀 Comment Utiliser

### Étape 1: Accéder à la page
```
https://marionderiot.com/admin/image-upload
```

### Étape 2: Sélectionner une image
Cliquez sur "Sélectionner une image" et choisissez votre fichier

### Étape 3: Vérifier le diagnostic
Cliquez sur "Vérifier et Uploader"

**Le système vérifie alors :**
- ✅ Si tout est OK → bouton vert "✅ Prêt à uploader"
- ⚠️ Si avertissements → bouton orange "⚠️ Upload possible (avec avertissements)"
- ❌ Si erreurs → bouton rouge "❌ Upload bloqué"

### Étape 4: Uploader ou corriger
- Si tout est vert : cliquez pour uploader
- Si avertissements : vous pouvez continuer ou corriger
- Si erreurs : lisez la solution et corrigez le problème

---

## 🔧 Problèmes Courants et Solutions

### **Erreur: Fichier trop volumineux (> 20MB)**
**Solution:**
1. Ouvrez l'image dans Photoshop ou un éditeur
2. Réduisez la résolution
3. Sauvegardez en WebP (plus léger)
4. Compressez si nécessaire

**Outil recommandé:** https://tinypng.com ou https://compressor.io

---

### **Erreur: Format non accepté**
**Formats acceptés:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp) ← Recommandé
- GIF (.gif)

**Solution:** Convertissez avec un outil en ligne (https://convertio.co)

---

### **Erreur: Token expiré**
**Si vous voyez "TOKEN_EXPIRED":**
1. Allez sur https://sanity.io
2. Connectez-vous
3. Allez dans Settings → API Tokens
4. Générez un nouveau token
5. Donnez à Jimbo pour mise à jour

---

### **Erreur: Permissions insuffisantes**
**Si vous voyez "INSUFFICIENT_PERMISSIONS":**
1. Contactez Jimbo
2. Demandez qu'il vous mette en rôle "editor"
3. Revenez sur la page d'upload

---

### **Erreur: Rate limit (trop d'uploads rapides)**
**Si vous voyez "RATE_LIMIT_APPROACHING":**
- Attendez 1-2 minutes
- Puis retentez

---

## 📊 Exemple d'Écran

```
┌─────────────────────────────────────────────────────┐
│ Interface d'Upload d'Images                         │
│ Diagnostic automatique des erreurs                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Sélectionner une image]    [Vérifier...]        │
│                                                     │
│  ✅ Tous les pré-requis sont satisfaits             │
│  📄 cuisine-moderne.jpg (1.2MB)                     │
│                                                     │
│  ✅ Vérifications réussies:                         │
│     • FILE_VALID: Fichier valide: 1.23MB           │
│     • TOKEN_VALID: Token valide et actif            │
│     • PERMISSION_GRANTED: Permissions OK: editor    │
│     • SANITY_ONLINE: Connexion OK (234ms)          │
│                                                     │
│  [✅ Prêt à uploader]                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎓 Pour Jimbo: Maintenance

### Ajouter un nouveau format d'image
Dans `src/lib/sanity/image-upload-diagnostic.ts`, modifiez:
```typescript
const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
```

### Augmenter la limite de taille
```typescript
const maxSize = 20 * 1024 * 1024; // Changer ce nombre (en bytes)
```

### Ajouter plus de vérifications
Ajoutez une nouvelle fonction `checkXxx()` dans le fichier diagnostic et appelez-la dans `diagnoseImageUploadError()`.

---

## 📞 Support

**Si vous avez toujours une erreur après avoir suivi le guide:**
1. Capturez l'écran du diagnostic
2. Notez le code d'erreur exact
3. Envoyez à Jimbo avec le screenshot

Le diagnostic vous donne déjà 90% de la réponse !

---

## 🔐 Sécurité

- ⚠️ Cette page ne doit être accessible qu'aux admins
- 🔒 Le token n'est jamais envoyé en clair
- ✅ Tous les contrôles se font côté client (pas de serveur)

