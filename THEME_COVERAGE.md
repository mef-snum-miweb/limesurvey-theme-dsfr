# Couverture fonctionnelle du thème

Liste exhaustive de ce que le thème DSFR prend en charge : types de questions, composants DSFR intégrés, comportements front, ressources embarquées.

---

## Types de questions LimeSurvey

Les **36 types** du noyau LimeSurvey ont un template Twig DSFR dédié dans [`views/survey/questions/answer/`](views/survey/questions/answer/).

### Questions simples

| Code | Type | Composant DSFR |
|---|---|---|
| `S` | Texte court | `fr-input` |
| `T` | Texte long | `fr-input` (textarea) |
| `U` | Texte très long | `fr-input` (textarea large) |
| `N` | Numérique | `fr-input` + `data-number` |
| `Y` | Oui / Non | `fr-radio-group` |
| `G` | Genre | `fr-radio-group` |
| `D` | Date | 3 `<select>` (jour / mois / année) |
| `*` | Équation | Affichage résultat |
| `X` | Texte d'information | `fr-callout` ou texte simple |

### Questions à choix multiples

| Code | Type | Composant DSFR |
|---|---|---|
| `M` | Choix multiples | `fr-checkbox-group` |
| `P` | Choix multiples + commentaires | Checkbox + textarea |
| `L` | Liste radio | `fr-radio-group` |
| `!` | Liste déroulante | `fr-select` |
| `O` | Liste + commentaire | Radio + textarea |
| `5` | Choix 5 points | `fr-radio-group` inline |
| `I` | Langue | `fr-select` |
| `R` | Classement (ranking) | SortableJS + boutons a11y |
| <code>&#124;</code> | Upload fichier | `fr-upload` |

### Questions tableaux

| Code | Type | Notes |
|---|---|---|
| `F` | Tableau 5 points | Likert responsive, linéarisation mobile |
| `B` | Tableau 10 points | 1-10 responsive |
| `C` | Tableau Oui/Non/Incertain | 3 colonnes |
| `E` | Tableau Augmenter/Stable/Diminuer | 3 colonnes |
| `H` | Tableau flexible par colonnes | |
| `A` | Tableau flexible par lignes | |
| `;` | Array multi-flexi (texte) | Grille texte |
| `:` | Array multi-flexi (nombres/dropdown) | Grille numérique |
| `1` | Dual scale | 2 échelles simultanées |
| `K` | Multiple numeric | Plusieurs champs numériques |
| `Q` | Multiple short text | Plusieurs champs texte |

### Questions avancées

- Ranking avec drag & drop (SortableJS) + navigation clavier complète via boutons Ajouter / Monter / Descendre / Retirer
- Multiplechoice avec option "Autre" (champ texte additionnel)
- Bootstrap button radio (radio stylé en boutons)

---

## Accessibilité & responsive

| | |
|---|---|
| **Linéarisation mobile** | < 768 px → tableaux en cartes verticales, `<thead>` masqué, labels inline dans chaque cellule (`.ls-label-xs-visibility`) |
| **Séparateurs dualscale** | En mobile, en-têtes de groupe "Échelle A / B" rendus en bandeau DSFR pour distinguer les deux scales |
| **Ranking clavier** | Tab entre les boutons + Enter, annonces SR via `[aria-live="polite"]` |
| **Résumé d'erreurs** | `role="alert"` + région `role="status" aria-live="polite"` pour annoncer les corrections à la volée (RGAA 11.10, WCAG 4.1.3) |
| **Conditional questions** | Mise à jour de `aria-hidden` / focus / `tabindex=-1` sur les questions masquées par relevance |
| **Skip links** | Nav Accès rapide DSFR (`.fr-skiplinks`) en tête de page |
| **aria-required / aria-invalid** | Posés automatiquement sur tous les champs obligatoires et en erreur |

Détail des critères et audit : [`DECLARATION_RGAA.md`](DECLARATION_RGAA.md).

---

## Composants DSFR intégrés

### Layout
- **Header** `fr-header` : logo Marianne, logo opérateur (conditionnel), titre, navigation, modale des paramètres d'affichage
- **Footer** `fr-footer` : liens légaux (accessibilité, mentions, données personnelles, cookies), texte éditeur, logos officiels
- **Stepper** `fr-stepper` : progression du questionnaire, étape courante et suivante

### Formulaires
- **Inputs** `fr-input` : texte, email, url, textarea, type="date"
- **Selects** `fr-select` : listes déroulantes, dropdowns de date
- **Radio** `fr-radio-group` + **Checkbox** `fr-checkbox-group`
- **Upload** `fr-upload`
- **Messages** `fr-message--error` / `fr-message--valid`

### Feedback
- **Alertes** `fr-alert` (error, warning, info, success)
- **Callouts** `fr-callout` pour les questions de type X (texte)
- **Badges** `fr-badge`
- **Modales** `fr-modal` (paramètres d'affichage, accessibilité, mentions, RGPD, cookies)

### Navigation
- **Boutons** `fr-btn` (primary, secondary, tertiary)
- **Skip links** `fr-skiplinks`
- **Icônes** Remix Icon via CSS `icons-system` / `icons-utility` (400+ SVG, pas de data-URI)

### Grille
- `fr-grid-row` + `fr-col-*`
- 20 helpers custom dans [`css/dsfr-grid-helpers.css`](css/dsfr-grid-helpers.css)

---

## Scripts front

Le JavaScript du thème est réparti entre `scripts/theme.js` (core DSFR — chargement framework, thème clair/sombre, changement de langue, fallback modales Bootstrap→DSFR) et `scripts/custom.js` (généré par esbuild depuis `src/`, voir [`CONTRIBUTING.md`](CONTRIBUTING.md)).

Comportements côté `custom.js` :

| Module `src/` | Rôle |
|---|---|
| `validation/errors-dsfr.js` | Conversion des erreurs LimeSurvey en `fr-message--error`, attachement des listeners de correction live |
| `validation/error-summary.js` | Résumé d'erreurs en haut de page (`role="alert"`) + région `role="status"` pour les annonces de correction |
| `validation/mst-errors.js` | Compteur de champs obligatoires pour les questions à sous-questions (Q, ;) |
| `validation/numeric-validation.js` | Contraintes `data-number`, min/max, somme des multiplenumeric |
| `validation/array-validation.js` | Validation des tableaux (simple + multi) |
| `validation/aria-invalid-sync.js` | Sync `aria-invalid` sur les champs en erreur |
| `validation/required-fields.js` | Marqueur visuel + `aria-required` sur les questions obligatoires |
| `a11y/conditional-aria.js` | `aria-hidden` / `tabindex` sur les questions masquées par relevance |
| `a11y/lazy-images.js` | `loading="lazy"` sur toutes les `<img>` |
| `a11y/table-accessibility.js` | Attributs `scope` et `headers` des tableaux de questions |
| `ranking/ranking.js` | Module ranking complet (drag + clavier + annonces SR + mise à jour des rangs) |
| `relevance/relevance-jquery.js` | Handlers `relevance:on` / `relevance:off` reproduisant le contrat LimeSurvey core |
| `inputs/input-on-demand.js` | Ajout dynamique de lignes pour `multipleshorttext` |
| `inputs/numeric-inputmode.js` | `inputmode="numeric"` pour clavier mobile optimisé |
| `dropdowns/dropdown-array.js` | Nettoyage styles inline + linéarisation mobile des `dropdown-array` |
| `rte/sanitize.js` | Scrub HTML des réponses RTE (anti-XSS) |
| `captcha/captcha.js` | Rechargement + validation du captcha textuel alternatif |

---

## Impression

**32 templates** dédiés dans [`views/printanswers/question_types/`](views/printanswers/question_types/) — un par type de question, avec layout A4 optimisé, polices noir & blanc, pas de fond de couleur, page-breaks automatiques.

Styles : [`css/print_theme.css`](css/print_theme.css).

---

## Ressources embarquées

Aucune ressource chargée via CDN externe : tout est servi depuis l'instance LimeSurvey (compatible CSP strict).

| Type | Taille | Contenu |
|---|---:|---|
| CSS | ~1,2 Mo | Framework DSFR, icônes, grille, theme principal, custom, print |
| Polices WOFF2 | ~300 Ko | Marianne (light/regular/medium/bold + italiques), Spectral |
| Icônes SVG | ~200 Ko | 400+ Remix Icon (system / utility / business) |
| JavaScript | ~155 Ko | `theme.js` (49 Ko) + `custom.js` (108 Ko bundlé) |
| Templates Twig | ~100 Ko | 50+ fichiers (layout + survey + printanswers + antibot) |

**Total** : ~2 Mo pour le thème complet.

---

## Internationalisation

- Langues interface : **français** (par défaut) et **anglais**
- Sélecteur de langue DSFR dans le header
- Traductions thème : [`src/core/i18n.js`](src/core/i18n.js) (messages mandatory / ranking / numeric)
- Le texte des questions est multilingue via LimeSurvey core (table `lime_questions_l10ns`)
