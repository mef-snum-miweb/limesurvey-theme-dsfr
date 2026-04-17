/**
 * Point d'entrée du thème DSFR pour LimeSurvey.
 *
 * Construit par esbuild vers `scripts/custom.js` (qui reste l'artefact
 * référencé par `config.xml`). Au fil du refactoring, `src/legacy.js`
 * sera vidé progressivement au profit de modules `src/<domaine>/*.js`
 * orchestrés depuis ce fichier.
 */

import './legacy.js';
import { sanitizeRTEContent } from './rte/sanitize.js';

// --- Contrat global : exposition sur window ---
// window.DSFRSanitizeRTEContent permet à du code externe (autres plugins,
// callback twig) de redéclencher le nettoyage RTE sans attendre un event.
window.DSFRSanitizeRTEContent = sanitizeRTEContent;

// --- Orchestration du nettoyage RTE ---
// Exécution au chargement, puis re-déclenchement sur navigation AJAX (pjax).
// Sera migré vers un helper `core/runtime.js` en session 3.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sanitizeRTEContent);
} else {
    sanitizeRTEContent();
}

if (typeof window.$ !== 'undefined') {
    window.$(document).on('pjax:complete', function () {
        setTimeout(sanitizeRTEContent, 100);
    });
}
