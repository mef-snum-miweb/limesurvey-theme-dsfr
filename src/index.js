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
import { handleRequiredFields } from './validation/required-fields.js';
import { transformErrorsToDsfr, observeErrorChanges } from './validation/errors-dsfr.js';
import { handleMultipleShortTextErrors } from './validation/mst-errors.js';
import { initAriaInvalidSync } from './validation/aria-invalid-sync.js';
import { createErrorSummary, updateErrorSummary, initErrorSummaryObserver } from './validation/error-summary.js';

// --- Contrat global : exposition sur window ---
window.DSFRSanitizeRTEContent = sanitizeRTEContent;
// Exposé temporairement pour que les appels encore présents dans legacy.js
// (initNumericValidation, handleArrayValidation, etc. — sessions 5+) le
// trouvent via leur scope. À retirer quand ces modules seront extraits.
window.updateErrorSummary = updateErrorSummary;

// --- Initialisation au chargement de la page ---
onReady(() => {
    sanitizeRTEContent();
    enableImageLazyLoading();
    extendDescribedByForValidationTips();
    addInputmodeNumericToNumericFields();
    reorderListRadioNoAnswer();
    fixTableAccessibility();

    // Validation DSFR
    handleRequiredFields();
    transformErrorsToDsfr();
    handleMultipleShortTextErrors();
    observeErrorChanges();
    initAriaInvalidSync();
    initErrorSummaryObserver();
    // Créer le récapitulatif si des erreurs sont déjà présentes au chargement.
    setTimeout(createErrorSummary, 100);

    // Re-déclencher la transformation + le récapitulatif après soumission
    // LimeSurvey (cas de validation côté serveur qui ne passe pas par pjax).
    const forms = document.querySelectorAll('form#limesurvey, form[name="limesurvey"]');
    forms.forEach((form) => {
        form.addEventListener('submit', () => {
            setTimeout(() => {
                transformErrorsToDsfr();
                createErrorSummary();
            }, 500);
        });
    });
});

// --- Re-initialisation sur chargement AJAX de questions ---
onQuestionsLoaded(() => {
    enableImageLazyLoading();
    extendDescribedByForValidationTips();
    addInputmodeNumericToNumericFields();
    reorderListRadioNoAnswer();
    handleRequiredFields();
    transformErrorsToDsfr();
    handleMultipleShortTextErrors();
    // fixTableAccessibility a historiquement un délai de 200ms après
    // questionsLoaded pour laisser le DOM se stabiliser.
    setTimeout(fixTableAccessibility, 200);
    setTimeout(createErrorSummary, 100);
});

// --- Re-initialisation sur navigation pjax ---
onPjax(() => {
    setTimeout(sanitizeRTEContent, 100);
});
