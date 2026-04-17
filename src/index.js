/**
 * Point d'entrée du thème DSFR pour LimeSurvey.
 *
 * Construit par esbuild vers `scripts/custom.js` (qui reste l'artefact
 * référencé par `config.xml`). Au fil du refactoring, `src/legacy.js`
 * sera vidé progressivement au profit de modules `src/<domaine>/*.js`
 * orchestrés depuis ce fichier.
 */

import './legacy.js';
