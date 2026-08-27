# 📋 Instructions — Mise à jour des projets Sanity

## ✅ Ce qui a été fait

1. **Schéma Sanity mis à jour** — Les champs suivants ont été ajoutés au schéma `project.ts` :
   - `location` — Lieu du projet
   - `postalCode` — Code postal
   - `clientType` — Type de maîtrise d'ouvrage
   - `surface` — Surface du projet

2. **Données de référence** — Fichier `scripts/projects-data.json` créé avec les 14 projets en ordre correct et toutes les infos.

## 📝 Comment mettre à jour les projets

### Option 1 : Via Sanity Studio (recommandé)

1. Ouvre `/admin` sur ton site (accès réservé)
2. Pour **chaque projet dans l'ordre** :
   - Clique sur le projet (ou crée-le s'il n'existe pas)
   - Remplis les champs :
     - **Titre** : en MAJUSCULES (ex : `CAMBACÉRÈS`)
     - **Lieu** : la ville/arrondissement
     - **Code postal** : si applicable (75008, 75007, etc.)
     - **Type maîtrise d'ouvrage** : ex `maîtrise d'ouvrage privée`
     - **Surface** : ex `90m2`, `duplex 125m2`
   - Sauvegarde

3. **Projets à supprimer** : Ceux qui ne sont **pas** dans la liste des 14

### Option 2 : Ligne de commande (CLI Sanity)

Si vous avez accès au CLI Sanity en local :

```bash
npm run sanity:export > projects-backup.ndjson
# Modifier les projets dans projects-backup.ndjson selon projects-data.json
npm run sanity:import projects-backup.ndjson
```

---

## 📋 Liste des 14 projets (ordre final)

| # | Nom | Lieu | CP | Type | Surface |
|---|-----|------|----|----|---------|
| 1 | CAMBACÉRÈS | Paris | 75008 | maîtrise d'ouvrage privée | 90m2 |
| 2 | VAUCRESSON | Vaucresson | — | maîtrise d'ouvrage privée | 220m2 |
| 3 | BOURDONNAIS | Paris | 75007 | maîtrise d'ouvrage privée | 115m2 |
| 4 | LAVOISIER | Paris | 75007 | maîtrise d'ouvrage privée | duplex 125m2 |
| 5 | HERVIEU | Paris | 75015 | maîtrise d'ouvrage privée | 115m2 |
| 6 | SQUARE DE VALOIS CHESNEY | — | — | maîtrise d'ouvrage privée | 165m2 |
| 7 | SQUARE DU ROULE NEUILLY | Neuilly | — | rénovation complète d'un hôtel particulier | 300m2 |
| 8 | CDG BOULOGNE BILLANCOURT | Boulogne-Billancourt | — | maîtrise d'ouvrage privée | 115m2 |
| 9 | MIGNET | Paris | 75016 | maîtrise d'ouvrage privée | duplex 220m2 |
| 10 | BRETEUIL | — | — | maîtrise d'ouvrage privée | 180m2 |
| 11 | VERTBOIS | — | — | maîtrise d'ouvrage privée | 80m2 |
| 12 | MALAKOFF | Paris | 75016 | maîtrise d'ouvrage privée | 150m2 |
| 13 | ALBONI | Paris | 75016 | maîtrise d'ouvrage privée | 140m2 |
| 14 | FLACHAT | — | — | extension d'une maison | — |

---

## 🗑️ Projets à supprimer

Supprime tout projet qui n'est **pas** dans la liste des 14 ci-dessus.

---

## 📌 Notes

- Les projets vont maintenant apparaître dans la navigation dans **l'ordre exact** de cette liste.
- Le champ "Surface" peut contenir des textes comme "duplex 125m2" ou simplement "90m2".
- Les champs vides (—) sont optionnels — ne pas remplir si vides.

