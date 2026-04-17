/**
 * Point d'entrée du thème DSFR pour LimeSurvey.
 *
 * Construit par esbuild vers `scripts/custom.js` (qui reste l'artefact
 * référencé par `config.xml`). Orchestre les initialisations des modules
 * `src/<domaine>/*.js` via les hooks `onReady`, `onQuestionsLoaded` et
 * `onPjax` de `core/runtime.js`.
 *
 * `./legacy.js` contient encore le code non-encore-extrait ; il est
 * vidé progressivement au fil des sessions de refactoring et conserve
 * son propre auto-enregistrement sur `DOMContentLoaded` pour l'instant.
 */

import './legacy.js';

import { onReady, onQuestionsLoaded, onPjax } from './core/runtime.js';
import { sanitizeRTEContent } from './rte/sanitize.js';
import { enableImageLazyLoading } from './a11y/lazy-images.js';
import { fixTableAccessibility } from './a11y/table-accessibility.js';
import { addInputmodeNumericToNumericFields } from './inputs/numeric-inputmode.js';
import { reorderListRadioNoAnswer } from './inputs/listradio-no-answer.js';
import { extendDescribedByForValidationTips } from './validation/described-by.js';

// --- Contrat global : exposition sur window ---
window.DSFRSanitizeRTEContent = sanitizeRTEContent;

// --- Initialisation au chargement de la page ---
onReady(() => {
    sanitizeRTEContent();
    enableImageLazyLoading();
    extendDescribedByForValidationTips();
    addInputmodeNumericToNumericFields();
    reorderListRadioNoAnswer();
    fixTableAccessibility();
});

// --- Re-initialisation sur chargement AJAX de questions ---
onQuestionsLoaded(() => {
    enableImageLazyLoading();
    extendDescribedByForValidationTips();
    addInputmodeNumericToNumericFields();
    reorderListRadioNoAnswer();
    // fixTableAccessibility a historiquement un délai de 200ms après
    // questionsLoaded pour laisser le DOM se stabiliser.
    setTimeout(fixTableAccessibility, 200);
});

// --- Re-initialisation sur navigation pjax ---
onPjax(() => {
    setTimeout(sanitizeRTEContent, 100);
});
