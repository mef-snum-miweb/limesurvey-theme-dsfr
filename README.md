# Thème DSFR pour LimeSurvey

[![DSFR](https://img.shields.io/badge/DSFR-v1.14-blue)](https://www.systeme-de-design.gouv.fr/)
[![LimeSurvey](https://img.shields.io/badge/LimeSurvey-6.0+-green)](https://www.limesurvey.org/)
[![RGAA](https://img.shields.io/badge/RGAA_4.1-100%25-brightgreen)](DECLARATION_RGAA.md)
[![Licence](https://img.shields.io/badge/Licence-Etalab_2.0-orange)](https://www.etalab.gouv.fr/licence-ouverte-open-licence/)

Thème LimeSurvey conforme au [Système de Design de l'État (DSFR)](https://www.systeme-de-design.gouv.fr/) et au [RGAA 4.1](https://accessibilite.numerique.gouv.fr/).

> **Utilisation réservée aux sites Internet de l'État.** Le DSFR représente l'identité numérique de l'État. Voir les [conditions générales d'utilisation du DSFR](https://github.com/GouvernementFR/dsfr/blob/main/doc/legal/cgu.md).

---

## En bref

<table>
<tr>
<td valign="top">

- **Accessibilité** — **100 %** RGAA 4.1 hors CAPTCHA
- **Design** — 100 % DSFR, zéro Bootstrap résiduel, mode clair/sombre natif
- **Questions** — 36 types supportés avec templates DSFR dédiés
- **Autonomie** — ressources locales (polices, icônes, JS), aucun CDN
- **Responsive** — mobile-first, linéarisation des tableaux <768 px
- **Impression** — layout dédié, 32 templates print par type de question
- **i18n** — français et anglais, sélecteur de langue DSFR

</td>
<td valign="top" width="380">

<a href="limesurvey-dsfr-theme.png"><img src="limesurvey-dsfr-theme.png" alt="Aperçu du thème DSFR pour LimeSurvey" width="360"></a>

</td>
</tr>
</table>

---

## Installation

> **Méthode recommandée : dépôt des fichiers sur le serveur (filesystem).**
> L'import `.zip` via le back-office **n'est pas fiable pour ce thème** : LimeSurvey
> filtre les extensions autorisées à l'upload web (liste blanche `allowedthemeuploads` /
> `allowedthemeimageformats`) et **exclut volontairement le `.svg`** (risque XSS). Or le
> thème embarque ~48 SVG essentiels (`files/logos/*.svg`, `files/icons/inline/*.svg` pour
> la [conformité CSP](#conformité-csp)) : un import web les retire silencieusement et le
> thème s'affiche cassé (logos manquants, icônes absentes). Le référencement dans
> `config.xml` ne contourne pas le filtre (c'est une règle serveur).

### Installation filesystem (recommandée)

1. Copier le contenu du dépôt (ou de l'archive de [release](../../releases/latest)) dans `upload/themes/survey/dsfr/` de l'instance LimeSurvey.
2. S'assurer que les fichiers appartiennent à l'utilisateur du serveur web (ex. `chown -R www-data:www-data upload/themes/survey/dsfr`).
3. Depuis l'administration : **Configuration > Thèmes** → le thème **DSFR** apparaît, l'activer sur les sondages souhaités.

### Import `.zip` via le back-office (déconseillé)

Possible uniquement si l'instance autorise l'upload de SVG côté serveur. Pour cela, ajouter `svg` aux listes blanches dans `application/config/config.php` :

```php
'allowedthemeuploads'      => 'css,js,map,json,eot,otf,ttf,woff,woff2,svg,txt,md,xml,twig,lss,lsa,lsq,lsg',
'allowedthemeimageformats' => 'gif,ico,jpg,jpeg,png,svg',
```

> ⚠️ **Sécurité** : un SVG peut embarquer du JavaScript. N'autoriser le `.svg` à l'upload que sur une instance dont vous maîtrisez les contributeurs de thèmes. L'installation filesystem reste préférable : les fichiers sont déposés par l'administrateur système, hors du flux d'upload web.

### Pour tester ou contribuer

Le repo [`bmatge/limesurvey-dsfr-suite`](https://github.com/bmatge/limesurvey-dsfr-suite) fournit un environnement Docker prêt à l'emploi (LimeSurvey 6 + MySQL + questionnaire de test RGAA + suite de tests) qui monte ce thème en direct. Il sert au développement et à la validation a11y ; il n'est **pas** requis pour utiliser le thème en production.

---

## Mise à jour

> **Mettre à jour = remplacer les fichiers sur disque. Ne jamais désinstaller / réinstaller
> ni utiliser « Réinitialiser ce thème » sur la configuration globale.**

LimeSurvey met en cache la configuration du thème **en base** (`lime_template_configuration` :
`files_css`, `files_js`, `options`) et **ne resynchronise pas** automatiquement depuis `config.xml`
au remplacement des fichiers. Deux conséquences :

- **La désinstallation est destructrice.** `uninstall()` exécute `deleteAll('template_name = :name')`
  et efface **toutes** les lignes du thème : la ligne globale **et toutes les surcharges par sondage**.
  Sont concernés : le bouton *Désinstaller*, mais aussi le bouton **« Réinitialiser ce thème »**
  global (= `uninstall()` + ré-import du manifeste). Désinstaller pour « forcer » une mise à jour
  fait donc reconfigurer tous les sondages. **À proscrire.**
- **Un simple remplacement de fichiers ne touche aucune ligne en base** : les configurations
  globale et par sondage sont conservées. C'est la procédure normale de mise à jour.

### Procédure de mise à jour non destructive

1. Remplacer les fichiers du thème sur disque (filesystem) par la nouvelle version.
2. Purger les caches LimeSurvey : vider `tmp/assets/` (assets Yii publiés) et `tmp/runtime/` (Twig compilé).
3. Recharger un sondage utilisant le thème pour vérifier le rendu.

Les **nouvelles options** ajoutées au `config.xml` (ex. `baseline_text` en v1.3.x) apparaissent
automatiquement par héritage, sans aucune action en base.

### Resynchronisation SQL ciblée (seulement si la liste des CSS/JS change)

Quand une version **renomme ou supprime un fichier CSS/JS** référencé, la ligne en base continue de
pointer vers l'ancien nom → 404 et thème cassé. Corriger **uniquement la ligne globale** (les lignes
par sondage qui héritent suivent), sans rien désinstaller :

```sql
-- Exemple v1.3.0 : dsfr-no-datauri.min.css → dsfr.min.css
UPDATE lime_template_configuration
SET files_css = REPLACE(files_css, 'dsfr-no-datauri.min.css', 'dsfr.min.css')
WHERE template_name = 'dsfr' AND sid IS NULL;
```

Puis purger `tmp/assets/`. Aucune action n'est nécessaire pour une installation neuve.

> **Bonne pratique projet** : garder des **noms de fichiers CSS/JS stables** entre versions, pour
> qu'une mise à jour reste un simple remplacement de fichiers sans resynchronisation SQL.

---

## Conformité CSP

Le thème est compatible avec une CSP **`default-src 'self'`** stricte, sans nécessiter `img-src data:`. Les 74 occurrences d'icônes SVG du DSFR habituellement encodées en `data:image/svg+xml,…` dans les CSS (`dsfr.min.css`, `custom.css`, `theme.css`) sont automatiquement **externalisées** en 46 fichiers `files/icons/inline/<hash>.svg` au build par [`externalize-data-uris.mjs`](externalize-data-uris.mjs), pour rester servies en *same-origin*.

- À rejouer après tout bump DSFR (déjà branché dans `scripts/update-dsfr.sh` et `npm run build:theme`).
- Idempotent : on peut le rejouer sans risque sur des CSS déjà patchés.
- Décision et alternatives écartées : ADR-019 (notes internes).

---

## Documentation

| Document | Pour qui |
|---|---|
| **[`THEME_COVERAGE.md`](THEME_COVERAGE.md)** | Ce que le thème prend en charge : types de questions, composants DSFR, scripts front, ressources |
| **[`THEME_OPTIONS.md`](THEME_OPTIONS.md)** | Options configurables depuis le back-office LimeSurvey (6 onglets) |
| **[`DECLARATION_RGAA.md`](DECLARATION_RGAA.md)** | Déclaration d'accessibilité complète (audit + corrections) |
| **[`DECLARATION_RGAA_AUDIT_INITIAL.md`](DECLARATION_RGAA_AUDIT_INITIAL.md)** | Résultat brut de l'audit initial |
| **[`CONTRIBUTING.md`](CONTRIBUTING.md)** | Guide développeur : arbo `src/`, pipeline esbuild, Twig, workflow git |
| Tests (couverture, lancement, rapports) | Dans le repo [`bmatge/limesurvey-dsfr-suite`](https://github.com/bmatge/limesurvey-dsfr-suite) |

---

## Licence

[Licence Ouverte v2.0 (Etalab)](https://www.etalab.gouv.fr/licence-ouverte-open-licence/).

---

## Auteur

**Mission Ingénierie du Web, Service du Numérique** — Ministère de l'Économie et des Finances

- GitHub : [@bmatge](https://github.com/bmatge)
