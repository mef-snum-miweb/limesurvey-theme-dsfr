# Thème DSFR pour LimeSurvey

[![DSFR](https://img.shields.io/badge/DSFR-v1.11-blue)](https://www.systeme-de-design.gouv.fr/)
[![LimeSurvey](https://img.shields.io/badge/LimeSurvey-6.0+-green)](https://www.limesurvey.org/)
[![RGAA](https://img.shields.io/badge/RGAA_4.1-100%25-brightgreen)](DECLARATION_RGAA.md)
[![Licence](https://img.shields.io/badge/Licence-Etalab_2.0-orange)](https://www.etalab.gouv.fr/licence-ouverte-open-licence/)

Thème LimeSurvey conforme au [Système de Design de l'État (DSFR)](https://www.systeme-de-design.gouv.fr/) et au [RGAA 4.1](https://accessibilite.numerique.gouv.fr/).

> **Utilisation réservée aux sites Internet de l'État.** Le DSFR représente l'identité numérique de l'État. Voir les [conditions générales d'utilisation](https://github.com/GouvernementFR/dsfr/blob/main/doc/legal/cgu.md).

---

## En bref

| | |
|---|---|
| **Accessibilité** | **100 %** RGAA 4.1 (hors CAPTCHA) — [audit Spécinov](DECLARATION_RGAA.md) + 20 corrections |
| **Design** | 100 % DSFR, zéro Bootstrap, mode clair/sombre natif |
| **Questions** | 36 types supportés avec templates DSFR |
| **Autonomie** | Ressources DSFR locales (polices, icônes, JS) — aucun CDN |
| **Responsive** | Mobile-first, linéarisation des tableaux |
| **Impression** | Layout dédié avec styles print |
| **i18n** | Français et anglais, sélecteur de langue DSFR |

---

## Accessibilité (RGAA)

Ce thème a fait l'objet d'un **audit RGAA 4.1 réalisé par [Spécinov](https://www.specinov.fr/)**. L'audit initial a révélé un taux de 70,49 %. Depuis, **toutes les non-conformités imputables au thème ont été corrigées** :

| Périmètre | Score |
|---|---|
| Hors page CAPTCHA | **100 %** |
| Incluant la page CAPTCHA | 95,08 % |

Les 3 critères résiduels (1.4, 1.5, 8.9) sont des *wontfix* non imputables au thème (CAPTCHA LimeSurvey + contenu éditorial TinyMCE).

Une **alternative anti-bot accessible** est fournie en remplacement du CAPTCHA.

Déclaration complète : [`DECLARATION_RGAA.md`](DECLARATION_RGAA.md)

---

## Installation

### Via Docker (recommandé)

Ce thème fait partie de la suite [limesurvey-dsfr-suite](https://github.com/bmatge/limesurvey-dsfr-suite) :

```bash
git clone --recurse-submodules https://github.com/bmatge/limesurvey-dsfr-suite.git
cd limesurvey-dsfr-suite
docker compose -f docker-compose.dev.yml up -d
# http://localhost:8081 (admin / admin)
```

Les fichiers du thème sont montés en direct : toute modification est visible après un refresh.

### Installation manuelle

1. Copier le dossier du thème dans `upload/themes/survey/` de votre instance LimeSurvey
2. Dans l'administration : **Configuration** > **Thèmes** > activer le thème **DSFR**

---

## Configuration

Le thème se configure depuis le back-office LimeSurvey (**Configuration** > **Thèmes** > **DSFR** > **Paramètres**), organisé en 6 onglets :

| Onglet | Paramètres |
|---|---|
| **Options générales** | Bouton "Tout effacer", correction numériques auto |
| **Images** | Logo opérateur (conditions DSFR) |
| **Header et footer** | Thème clair/sombre, Marianne, titre, liens légaux |
| **Accessibilité** | Contenu de la modale accessibilité |
| **Mentions légales** | Éditeur, directeur de publication, hébergeur |
| **Données personnelles** | Responsable RGPD, finalité, durée, contact DPO |

Guide complet : [`DOCUMENTATION.md`](DOCUMENTATION.md)

---

## Documentation technique

L'architecture du thème, l'intégration DSFR, la structure des fichiers et le détail des composants sont documentés dans [`DOCUMENTATION.md`](DOCUMENTATION.md).

---

## Développement

Le JavaScript du thème vit dans `src/` sous forme de modules ES, et `scripts/custom.js` est un artefact produit par **esbuild** — ne pas l'éditer à la main. Arborescence :

```
src/
├── banner.js          # console.log d'accueil
├── index.js           # point d'entrée + orchestration des inits
├── core/              # i18n, dom-utils, runtime (onReady/onQuestionsLoaded/onPjax)
├── rte/               # sanitize du HTML ajouté par l'éditeur de texte riche
├── a11y/              # lazy-images, table-accessibility, conditional-aria
├── validation/        # validation DSFR (errors, mst, aria-invalid, error-summary,
│                      # numeric, array, validation-messages, required-fields,
│                      # described-by)
├── inputs/            # input-on-demand, radio-buttons, numeric-inputmode,
│                      # listradio-no-answer
├── dropdowns/         # dropdown-array (linéarisation mobile)
├── captcha/           # captcha (rechargement + validation DSFR)
├── ranking/           # ranking accessible (17 fonctions, a11y SortableJS)
└── relevance/         # relevance-jquery (handlers questions conditionnelles)
```

Scripts (à exécuter depuis `limesurvey-dsfr-suite/`) :

```bash
npm run build:theme           # bundle scripts/custom.js une fois
npm run build:theme:watch     # rebuild à chaque sauvegarde
npm run build:theme:check     # rebuild + git diff --exit-code (CI)
npm run dev:purge-cache       # vide le cache assets Yii du container Docker
npm run test:unit             # Vitest
npm run test:e2e              # Playwright
```

**Note ops** : LimeSurvey met `custom.js` en cache dans `/tmp/assets/<hash>/`. Après un rebuild, si le navigateur reçoit toujours l'ancien bundle, lancer `npm run dev:purge-cache`.

---

## Licence

[Licence Ouverte v2.0 (Etalab)](https://www.etalab.gouv.fr/licence-ouverte-open-licence/)

---

## Auteur

**Mission Ingénierie du Web, Service du Numérique**
Ministère de l'Économie et des Finances

- Email : conseil.miweb@finances.gouv.fr
- GitHub : [@bmatge](https://github.com/bmatge)
