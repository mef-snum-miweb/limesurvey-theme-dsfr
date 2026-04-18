# Thème DSFR pour LimeSurvey

[![DSFR](https://img.shields.io/badge/DSFR-v1.11-blue)](https://www.systeme-de-design.gouv.fr/)
[![LimeSurvey](https://img.shields.io/badge/LimeSurvey-6.0+-green)](https://www.limesurvey.org/)
[![RGAA](https://img.shields.io/badge/RGAA_4.1-100%25-brightgreen)](DECLARATION_RGAA.md)
[![Licence](https://img.shields.io/badge/Licence-Etalab_2.0-orange)](https://www.etalab.gouv.fr/licence-ouverte-open-licence/)

Thème LimeSurvey conforme au [Système de Design de l'État (DSFR)](https://www.systeme-de-design.gouv.fr/) et au [RGAA 4.1](https://accessibilite.numerique.gouv.fr/).

> **Utilisation réservée aux sites Internet de l'État.** Le DSFR représente l'identité numérique de l'État. Voir les [conditions générales d'utilisation du DSFR](https://github.com/GouvernementFR/dsfr/blob/main/doc/legal/cgu.md).

---

## En bref

| | |
|---|---|
| **Accessibilité** | **100 %** RGAA 4.1 hors CAPTCHA — audit Spécinov |
| **Design** | 100 % DSFR, zéro Bootstrap résiduel, mode clair/sombre natif |
| **Questions** | 36 types supportés avec templates DSFR dédiés |
| **Autonomie** | Ressources locales (polices, icônes, JS) — aucun CDN |
| **Responsive** | Mobile-first, linéarisation des tableaux <768 px |
| **Impression** | Layout dédié, 32 templates print par type de question |
| **i18n** | Français et anglais, sélecteur de langue DSFR |

---

## Installation

Ce thème est fait pour être utilisé via la suite [`limesurvey-dsfr-suite`](https://github.com/bmatge/limesurvey-dsfr-suite) :

```bash
git clone --recurse-submodules https://github.com/bmatge/limesurvey-dsfr-suite.git
cd limesurvey-dsfr-suite
docker compose -f docker-compose.dev.yml up -d
# http://localhost:8081 (admin / admin)
```

Installation manuelle : copier le dossier dans `upload/themes/survey/` de l'instance LimeSurvey, puis activer le thème **DSFR** depuis **Configuration > Thèmes**.

---

## Documentation

| Document | Pour qui |
|---|---|
| **[`THEME_COVERAGE.md`](THEME_COVERAGE.md)** | Ce que le thème prend en charge : types de questions, composants DSFR, scripts front, ressources |
| **[`THEME_OPTIONS.md`](THEME_OPTIONS.md)** | Options configurables depuis le back-office LimeSurvey (6 onglets) |
| **[`DECLARATION_RGAA.md`](DECLARATION_RGAA.md)** | Déclaration d'accessibilité complète (audit Spécinov + corrections) |
| **[`DECLARATION_RGAA_AUDIT_INITIAL.md`](DECLARATION_RGAA_AUDIT_INITIAL.md)** | Résultat brut de l'audit Spécinov avant corrections |
| **[`CONTRIBUTING.md`](CONTRIBUTING.md)** | Guide développeur : arbo `src/`, pipeline esbuild, Twig, workflow git |
| [`../../TESTING.md`](../../TESTING.md) | Couverture, lancement et rapports des tests — dans le repo parent |

---

## Licence

[Licence Ouverte v2.0 (Etalab)](https://www.etalab.gouv.fr/licence-ouverte-open-licence/).

---

## Auteur

**Mission Ingénierie du Web, Service du Numérique** — Ministère de l'Économie et des Finances

- Email : conseil.miweb@finances.gouv.fr
- GitHub : [@bmatge](https://github.com/bmatge)
