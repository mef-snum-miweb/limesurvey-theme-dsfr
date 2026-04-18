# Guide du contributeur

Ce document s'adresse aux personnes qui **modifient le code** du thème DSFR. Pour juste **utiliser** le thème, voir [`README.md`](README.md) et [`THEME_OPTIONS.md`](THEME_OPTIONS.md).

---

## Arborescence

```
dsfr/
├── config.xml              # Config LimeSurvey : options, CSS/JS à charger
├── esbuild.config.mjs      # Bundling src/ → scripts/custom.js
│
├── src/                    # SOURCE du JavaScript (modules ES)
│   ├── index.js            # Point d'entrée : hooks + orchestration des inits
│   ├── banner.js           # console.log d'accueil
│   ├── core/               # i18n, dom-utils, runtime (onReady / onQuestionsLoaded / onPjax)
│   ├── rte/                # sanitize du HTML ajouté par l'éditeur de texte riche
│   ├── a11y/               # lazy-images, table-accessibility, conditional-aria
│   ├── validation/         # errors, mst, aria-invalid, error-summary, numeric,
│   │                       # array, required-fields, validation-messages, described-by
│   ├── inputs/             # input-on-demand, radio-buttons, numeric-inputmode,
│   │                       # listradio-no-answer
│   ├── dropdowns/          # dropdown-array (linéarisation mobile des arrays)
│   ├── captcha/            # captcha (rechargement + validation DSFR)
│   ├── ranking/            # ranking accessible (SortableJS + clavier + a11y)
│   └── relevance/          # relevance-jquery (handlers questions conditionnelles)
│
├── scripts/                # ARTEFACTS — ne pas éditer à la main
│   ├── theme.js            # Core DSFR (chargement framework, thème clair/sombre)
│   └── custom.js           # Bundle généré par esbuild depuis src/
│
├── views/                  # Templates Twig
│   ├── layout_*.twig       # Layouts globaux (survey, print, errors, maintenance)
│   ├── subviews/           # Header, footer, content, navigation, messages, privacy
│   ├── antibot/            # Défi anti-bot
│   ├── printanswers/       # Templates d'impression (32 types de questions)
│   └── survey/questions/   # 36 types de questions
│       └── answer/         # — chacun avec son template DSFR
│
├── css/                    # Styles (framework DSFR + custom + print)
├── fonts/                  # Marianne + Spectral en WOFF2
├── icons/                  # 400+ SVG (system / utility / business)
├── files/                  # Assets : preview, logo par défaut, Marianne SVG
└── installer/              # Scripts de mise à jour LimeSurvey
```

---

## Pipeline de build JS

`scripts/custom.js` est **généré** par esbuild depuis `src/index.js`. **Ne jamais éditer** `scripts/custom.js` directement : toute modification serait écrasée au prochain build.

Commandes (depuis la racine du repo parent `limesurvey-dsfr-suite/`) :

```bash
npm run build:theme           # build unique
npm run build:theme:watch     # rebuild à chaque sauvegarde dans src/
npm run build:theme:check     # build + git diff --exit-code (CI)
```

Config esbuild : [`esbuild.config.mjs`](esbuild.config.mjs) — format `iife`, target ES2017, `minify: false` (debuggabilité), banner en tête de bundle.

### Cache Yii

LimeSurvey copie `scripts/custom.js` dans `/var/www/html/tmp/assets/<hash>/` à la première requête et sert depuis là. Après un rebuild, le navigateur peut recevoir l'ancien bundle. Purger :

```bash
npm run dev:purge-cache       # rm -rf /var/www/html/tmp/assets/* dans le container
```

---

## Orchestration des initialisations

`src/index.js` expose les contrats globaux LimeSurvey (via `registerRelevanceGlobals(window)` et `window.DSFRSanitizeRTEContent`) **avant** `onReady`, puis câble trois hooks de cycle de vie (définis dans [`src/core/runtime.js`](src/core/runtime.js)) :

| Hook | Évènement | Usage |
|---|---|---|
| `onReady` | `DOMContentLoaded` | Init complète au chargement initial de la page |
| `onQuestionsLoaded` | Custom event LimeSurvey `limesurvey:questionsLoaded` | Ré-init après chargement AJAX de questions (format inline, all-in-one) |
| `onPjax` | jQuery `pjax:complete` | Ré-init après navigation AJAX pjax |

**Règle d'or** : toute fonction d'init doit être **idempotente** (pas d'empilement de handlers après plusieurs appels). Voir par exemple `relevance-jquery.js` qui utilise le namespace jQuery `.dsfrRelevance` + `.off().on()` pour garantir cela.

---

## Conventions Twig

Les templates de questions suivent l'arborescence de LimeSurvey core :

```
views/survey/questions/answer/<question_theme>/
├── answer.twig              # racine du template (wrapper, table, ul…)
└── rows/
    ├── answer_row.twig      # rang d'items (ligne de tableau, <li>…)
    └── cells/
        ├── answer_td.twig   # cellule individuelle
        └── answer_td_input.twig  # variante avec input (rating scales)
```

### A11y des tableaux — règles à respecter

1. Chaque `<input>` dans une cellule a un **`aria-labelledby` qui référence EN-TÊTE DE COLONNE ET DE LIGNE** — pas de `<label class="fr-sr-only">` redondant pour le lecteur d'écran.
2. En parallèle, un **`<label class="ls-label-xs-visibility" aria-hidden="true">` visuel** dans la cellule — il est caché sur desktop via media query, mais apparaît inline sur mobile (<768 px) quand `<thead>` est masqué par la linéarisation.
3. `aria-hidden="true"` sur ce label empêche le double-announce SR.
4. Le `<th scope="row">` porte `id="answertext<myfname>"` utilisé par tous les `aria-labelledby` de la ligne.

Exemple (simplifié) :

```twig
<td class="answer_cell_{{ ld }} radio-item">
    <input type="radio" name="{{ myfname }}" value="{{ ld }}"
           id="answer{{ myfname }}-{{ ld }}"
           aria-labelledby="answer{{ basename }}-{{ ld }} answertext{{ myfname }}" />
    <label for="answer{{ myfname }}-{{ ld }}"
           class="ls-label-xs-visibility" aria-hidden="true">
        {{ processString(label) }}
    </label>
</td>
```

---

## Ajouter un type de question

1. Créer le dossier `views/survey/questions/answer/<nouveau_type>/` avec `answer.twig` (+ `rows/`, `cells/` si tableau).
2. Utiliser les classes DSFR : `fr-input`, `fr-select`, `fr-radio-group`, `fr-checkbox-group`, `fr-input-group`, `fr-messages-group`.
3. Si validation spécifique, ajouter un handler dans `src/validation/` et l'importer dans `src/index.js`.
4. Si besoin de ré-init après navigation AJAX, l'ajouter au bloc `onQuestionsLoaded`.
5. Créer aussi le template d'impression dans `views/printanswers/question_types/<type>.twig`.
6. Ajouter une ligne dans la suite de tests `results.spec.ts` si le type est round-trippable (saisie ↔ DB) — voir [`../../TESTING.md`](../../TESTING.md).

---

## Workflow git

Le thème vit en **submodule** du repo parent [`limesurvey-dsfr-suite`](https://github.com/bmatge/limesurvey-dsfr-suite). Règle d'or : on édite **toujours** depuis `modules/theme-dsfr/`, jamais ailleurs.

### Commit dans le submodule

```bash
cd modules/theme-dsfr
# édition des fichiers...
npm --prefix ../.. run build:theme   # rebuild bundle si src/ a changé
git add -A
git commit -m "feat: ..."   # Conventional Commits : feat / fix / refactor / chore / test / docs
git push origin <branche>
```

### Remonter le pointeur dans le parent

```bash
cd ../..
git add modules/theme-dsfr
git commit -m "chore: bump theme-dsfr"
git push
```

### Conventions de commit

Format Conventional Commits avec scope optionnel :
- `feat(validation): …` — nouvelle fonctionnalité
- `fix(ranking): …` — correction de bug
- `refactor(js): …` — refacto sans changement fonctionnel
- `test(e2e): …` — ajout/modif de tests
- `chore(build): …` — build, tooling, dépendances
- `docs: …` — documentation

**Interdits** :
- Pas de commit direct sur `master` sans PR / revue
- Pas de `git push --force` sur `master`
- Pas de modification manuelle de `scripts/custom.js` (toujours passer par `build:theme`)

---

## Tests

La suite de tests vit dans le **repo parent** (`limesurvey-dsfr-suite/tests/`). Détail, couverture, commandes et rapport HTML : [`../../TESTING.md`](../../TESTING.md).

Règle : **tout nouveau comportement côté front doit être couvert**, au minimum par un test unitaire (Vitest) si c'est une fonction pure, ou par un test E2E (Playwright) si c'est du rendu DOM / de la navigation.

---

## Mettre à jour les ressources DSFR

Les fichiers CSS, JS, polices et icônes du framework DSFR sont **packagés** directement dans le thème (pas de CDN). Quand une nouvelle version est publiée sur [GouvernementFR/dsfr](https://github.com/GouvernementFR/dsfr/releases), deux mécanismes permettent de tirer la mise à jour :

### Script manuel

```bash
# depuis modules/theme-dsfr/
./scripts/update-dsfr.sh            # dernière release publique
./scripts/update-dsfr.sh v1.14.4    # version explicite
```

Le script télécharge l'archive de la release GitHub officielle, extrait uniquement les fichiers nécessaires au thème (`dsfr.min.css`, `icons.min.css`, `icons-system.min.css`, les 2 variantes du JS DSFR, les 20 polices Marianne/Spectral et les 4 catégories d'icônes utilisées : `business`, `editor`, `system`, `user`), puis met à jour le badge version dans `README.md`.

**N'écrase pas** : les scripts custom (`theme.js`, `custom.js`), les CSS custom (`theme.css`, `custom.css`, `print_theme.css`, `dsfr-grid-helpers.css`), ni les templates Twig.

Le script ne commit pas — il affiche la liste des étapes de validation (lancer les tests, vérifier visuellement, mettre à jour `DECLARATION_RGAA.md` si la version y est citée, puis commiter).

### Workflow GitHub Actions

[`.github/workflows/update-dsfr.yml`](.github/workflows/update-dsfr.yml) appelle ce même script :

- **Manuellement** : onglet **Actions** > workflow "Update DSFR" > **Run workflow**, avec input optionnel `version`.
- **Hebdomadaire** : chaque lundi 08:00 UTC, vérifie la dernière release DSFR publique et, si elle diffère de la version intégrée, ouvre une PR `dsfr-update/vX.Y.Z` avec le diff et une checklist de validation (tests, rendu visuel, déclaration RGAA).

La PR est étiquetée `deps` + `dsfr`. Elle doit être revue manuellement : il peut y avoir des nouveaux composants DSFR à intégrer dans les templates Twig, des classes CSS qui changent, des icônes ajoutées/retirées, etc. Le changelog DSFR (<https://github.com/GouvernementFR/dsfr/blob/main/CHANGELOG.md>) est le compagnon obligatoire de toute mise à jour.

---

## Dépendances

Aucune dépendance runtime (hors DSFR lui-même et jQuery/SortableJS fournis par LimeSurvey).

Dépendances de build (dans le `package.json` parent) :
- `esbuild` — bundling JS
- `vitest` + `jsdom` — tests unitaires
- `@playwright/test` + `@axe-core/playwright` — tests E2E et audit a11y

---

## Règle d'or DSFR

> Toute modification qui s'éloigne des classes/composants DSFR officiels **doit** avoir une justification a11y ou LimeSurvey documentée en commentaire. Le thème est un pont entre l'identité numérique de l'État et un moteur de sondage — on ne réinvente ni l'un ni l'autre.

Référence DSFR : <https://www.systeme-de-design.gouv.fr/>.
Conditions d'utilisation DSFR : <https://github.com/GouvernementFR/dsfr/blob/main/doc/legal/cgu.md>.
