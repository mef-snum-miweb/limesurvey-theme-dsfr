# Changelog

Toutes les évolutions notables du thème DSFR pour LimeSurvey.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) ;
versionnage [SemVer](https://semver.org/lang/fr/). L'historique antérieur à
`1.4.0` est consultable via les tags Git (`git tag`) et les *releases* GitHub.

## [1.9.0] — 2026-06-10

Release de l'**épic P2 — dette CSS** (#39).

### Modifié

- **~420 lignes de CSS mort supprimées** (vérifiées sans usage) : modales
  Bootstrap, ranking legacy, .survey-footer*, .skip-link, .progress*,
  .question-yesno, checkbox-array… ; `dsfr-grid-helpers.css` vidé (classes
  natives DSFR dupliquées, gutters en conflit avec le système natif).
  Règle de propriété theme.css/custom.css documentée. _Closes #30._
- **Dark mode réparé localement** : hex en dur tokenisés (radios de
  matrices, en-têtes dual-scale, selects, hovers blancs). _Closes #31._
- **Breakpoints cohérents** : plus de chevauchement à 768px exactement ni
  de trou 576↔577 ; `html{font-size:100%}` respecte le réglage de police
  du navigateur (RGAA). _Closes #31._

### Notes

- La migration `@layer` + dépose des 777 `!important` restants est
  planifiée dans #41 (exige des snapshots visuels par type de question).

## [1.8.0] — 2026-06-10

Release de l'**épic P2 — dette JavaScript** (#38).

### Modifié

- **theme.js dégraissé** (1446 → 870 lignes) : suppression du handler qui
  avalait toute erreur « bootstrap », des stubs dupliqués, des fonctions
  enhance* legacy, de la double validation captcha et des ~320 lignes de
  validation morte. Chargement du JS DSFR robuste (mode debug, installation
  en sous-répertoire) ; combobox découplé de theme.js. _Closes #27._
- **i18n centralisée** : dictionnaire UI fr/en + `tUI()` pour toutes les
  chaînes de validation et annonces lecteur d'écran ; légendes des questions
  via `gT()` (traduites dans toutes les langues LS) ; warnings via `gT()` ;
  fichier mort `translations.twig` supprimé. _Closes #28._

### Corrigé

- **Cycle de vie** : `limesurvey:questionsLoaded` n'est émis par aucun code
  du core 6.16 — la ré-initialisation complète tourne désormais réellement
  (déclenchée sur pjax) ; `onPjax` attend jQuery au lieu d'abandonner ;
  messages EM transformés **sur place** (mises à jour dynamiques et
  aria-describedby préservés) ; correction du `{ once: true }` qui empêchait
  une question retombée en erreur de se re-nettoyer ; bornes de somme
  tolérantes aux décimaux/négatifs ; sélecteur de question conditionnelle
  exact (Q1 ne matche plus Q12). _Closes #29._

## [1.7.0] — 2026-06-10

Release de l'**épic P2 — conformité DSFR des composants** (#37).

### Modifié

- **Pattern d'erreur normatif** : `fr-fieldset--error` posé sur les fieldsets
  des questions radios/cases en erreur, `fr-input-group--error` cantonné au
  groupe du champ (plus jamais sur le conteneur de question), message
  obligatoire en `fr-error-text` + `gT()` (fini FontAwesome/`text-danger`/
  `role=alert` statique). _Closes #22._
- **Tableaux** : les 11 templates de matrices passent au markup fr-table
  1.12+ (`__wrapper`/`__container`/`__content`), caption sr-only généralisée,
  `data-fr-js-table*` et `role=radiogroup` sur `<tr>`/`<col>` retirés.
  _Closes #23._
- **Schéma de thème** : `data-fr-scheme` (light/dark/**system**, nouvelle
  option) au lieu de `data-fr-theme` calculé ; appliqué aussi aux 3 layouts
  autonomes (liste publique, erreurs, maintenance) qui n'avaient aucune
  variante sombre. _Closes #24._
- **Footer accessibilité** : mention de conformité paramétrable
  (`rgaa_conformity`), date de déclaration réelle (`rgaa_declaration_date`),
  lien vers une page dédiée possible (`accessibility_statement_url`).
  _Closes #24._
- **Purge Bootstrap/icônes-fontes** : gender/radio en fieldset DSFR,
  sélecteur de langue en `fr-select-group`, case « tout effacer » en
  `fr-checkbox-group`, évaluations en `fr-callout`, `fa-*`/`ri-*` →
  `fr-icon-*`, classes `fr-*` inventées renommées `lsd-*`, 6 fichiers
  morts supprimés. _Closes #25._
- **Landmark `<main>`** : déplacé dans mainrow.twig — le lien d'évitement
  fonctionne sur toutes les pages (welcome, submit, register…), plus
  seulement sur les pages de questions. _Closes #26._

## [1.6.0] — 2026-06-10

Release de l'**épic P1 — iso-fonctionnalité avec le thème vanilla** (#36).
Référence : core de la version réellement déployée (**LimeSurvey 6.16.16**,
extrait du conteneur — et non le master, dont les conventions divergent).

### Corrigé

- **Dual-scale (type 1)** : ids en `myfid` (le « # » de `myfname` cassait les
  sélecteurs de l'Expression Manager → relevance/validation/équations), hidden
  fields déplacés hors du `<tbody>` (HTML invalide), radios « Sans réponse »
  restaurées (un par échelle, visibles). _Closes #12._
- **Sliders (type K)** : sémantique « non répondu » restaurée (champ réponse
  séparé du range, vide tant que non touché), `slider_step` honoré (au lieu
  d'une variable inexistante → pas toujours 1), valeur par défaut, reset →
  état vide, prefix/suffix/séparateur. Logique extraite dans
  `src/inputs/slider-native.js` (fini les scripts inline dupliqués). _Closes #13._
- **Date (type D, selector)** : soumission au format du sondage
  (`dateformatdetails`) au lieu d'ISO brut, `datetime-local` quand le format
  contient l'heure, pré-remplissage générique par tokens (15 tests unitaires),
  min/max évalués par `processString` (expressions EM). _Closes #14._
- **Tableau (type F)** : `repeat_headings` réparé (`include aRow.template`
  comme le core), message « no answers » et colgroup `aColumns` restaurés.
  _Closes #15._
- **Boilerplate (type X)** : `sTimer` + input caché restaurés (`time_limit*`
  fonctionne), suppression du double rendu du texte de question. _Closes #16._
- **Listradio (type L)** : `display_columns` honoré (grille `ls-columns`),
  hooks EM de ligne (`javatbd`, `sDisplayStyle`) restaurés, choisir une autre
  option vide le champ « autre ». _Closes #18._
- **Compteur d'erreurs** (multi-textes + tableaux texte) : ré-inséré quand un
  champ est re-vidé après correction ; le récapitulatif sait ré-ajouter une
  erreur réactivée (annonce SR groupée). Reprend le chantier array-validation
  du 2026-04-16. _Closes #20._
- **Attributs backoffice** : `placeholder` (T/U), `label_input_columns` (K),
  `answerwidth`/`columnswidth` (array dropdown), classes d'erreur serveur
  `ls-error-mandatory`/`has-error` (multiflexi/texts). _Closes #21._

### Documentation

- Section README « Compatibilité LimeSurvey » : version testée 6.16.16,
  avertissement breaking change `_C*`/`_S*` du master, recommandation de pin
  du tag Docker. Le ranking (#17) est vérifié conforme au core 6.16.16 — les
  ids `_S{sqid}` n'existent que dans master. _Closes #17, #19._

## [1.5.0] — 2026-06-10

Release de l'**épic P0** de la [revue complète du 2026-06-09](docs/REVUE-2026-06-09.md)
(#35) : corrections critiques à fort impact.

### Corrigé

- **CSS** : les 10 variables DSFR fantômes (`--error-425`, `--warning-425`,
  `--blue-france`…) sont remplacées par des tokens 1.14 réels — les messages
  d'erreur et d'avertissement EM retrouvent leur couleur (RGAA). _Closes #6._
- **CSS** : `.ls-js-hidden` redéfinie (elle était fournie par
  `template-core.css`, retiré dans `config.xml`) — l'alerte RGPD
  `#datasecurity_error` n'est plus visible en permanence. _Closes #7._
- **Twig** : `fr-col-offset-2--lg` (classe inexistante) → `fr-col-offset-lg-2` ;
  les formulaires inscription / code d'accès / sauvegarde / chargement sont à
  nouveau centrés. _Closes #8._
- **JS** : suppression du handler legacy de `theme.js` qui retirait
  `fr-input-group--error` dès la première frappe même sur saisie invalide,
  en contradiction avec la validation de `src/`. Retrait des 8 `console.log`
  de debug du bundle. _Closes #9._
- **JS** : `:has()` éliminé de `required-fields.js` (SyntaxError sur
  Firefox ESR 115 / Safari < 15.4 qui interrompait toute l'initialisation) ;
  chaque init de `index.js` est isolée par `safeInit()` (try/catch). _Closes #10._
- **Twig** : `justsaved.twig` réécrit en alerte DSFR fermable
  (`fr-alert--success/error/info`) au lieu de Bootstrap (`alert fade in`)
  et d'API inventées (`data-fr-dismiss`). _Closes #11._

## [1.4.0] — 2026-06-01

Version centrée sur la **configurabilité** du thème et la **fiabilité des mises
à jour**, en réponse aux issues remontées sur le dépôt public.

### Ajouté

- **Page d'options globale du thème** (`options/options.twig` + `options.js` +
  `index.html`). Un thème autonome (sans `<extends>`) doit fournir physiquement
  `options/options.twig` pour que `TemplateConfiguration::getHasOptionPage()`
  renvoie `true` ; sans ce fichier le bouton **« Options »** global restait
  grisé et seules les options par sondage étaient accessibles. Le rendu reste
  délégué à la page core (`optionspage=core`). _Closes #5._
- **Option `baseline_text`** (textarea, catégorie « Header et footer ») :
  baseline DSFR éditable, affichée sous le titre du service dans l'en-tête
  (`fr-header__service-tagline`). _Closes #1._

### Modifié

- `nav_bar.twig` consomme désormais `baseline_text` au lieu de la variable
  `organization_name`, qui n'était **jamais déclarée** dans `config.xml` (code
  mort, toujours vide et inéditable).
- `apiVersion` `3` → `3.0` (alignement sur le format des thèmes standards).
- Bannière console : URL pointée vers le dépôt public `mef-snum-miweb/limesurvey-theme-dsfr`.

### Corrigé

- URL par défaut du site gouvernemental dans le sondage d'exemple :
  `gouvernement.fr` → `info.gouv.fr` (le premier redirige vers le second).
  Contribution de **Sébastien Malot** (PR #2).

### Documentation

- **Installation et mise à jour par filesystem** présentées comme méthode
  principale : l'upload web retire les SVG (liste blanche serveur, `.svg` exclu
  pour risque XSS) et **ne sait pas mettre à jour un thème de sondage existant**
  (`Themes::checkDestDir` refuse si le dossier existe). _Refs #4 — limite
  plateforme LimeSurvey, contournée et documentée, pas un correctif du thème._
- **Procédure de mise à jour non destructive** : remplacer les fichiers + purger
  `tmp/`, ne jamais désinstaller / « Réinitialiser » (`uninstall()` = `deleteAll`
  efface la config globale **et** les surcharges par sondage). Resync SQL ciblé
  sur la ligne globale (`sid IS NULL`) quand la liste des CSS/JS change.
- **Choix du répertoire** : installer dans `upload/themes/survey/`
  (`userthemerootdir`, préservé aux MAJ du core) et **non** `themes/survey/`
  (`standardthemerootdir`, écrasé aux MAJ du core).
- **Stratégie de configuration** à trois niveaux : défauts génériques dans
  `config.xml` (versionnés, restaurés au reset), réglages par instance dans les
  options globales, spécificités dans les options par sondage (reste en
  « Hériter »).

### Notes de migration

- Les installations existantes placées dans `themes/survey/dsfr/` doivent migrer
  vers `upload/themes/survey/dsfr/` pour ne pas être écrasées lors d'une mise à
  jour du core LimeSurvey.
- Mise à jour depuis la 1.3.x : **remplacer les fichiers** puis purger
  `tmp/assets/` et `tmp/runtime/`. Aucune action en base (la config par sondage
  est conservée). Ne pas désinstaller.
