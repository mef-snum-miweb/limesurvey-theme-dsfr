# Changelog

Toutes les évolutions notables du thème DSFR pour LimeSurvey.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) ;
versionnage [SemVer](https://semver.org/lang/fr/). L'historique antérieur à
`1.4.0` est consultable via les tags Git (`git tag`) et les *releases* GitHub.

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
