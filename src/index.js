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
import { initNumericValidation, handleNumericMultiValidation, observeNumericMultiSumValidation } from './validation/numeric-validation.js';
import { handleArrayValidation, handleSimpleQuestionValidation } from './validation/array-validation.js';
import { transformValidationMessages } from './validation/validation-messages.js';
import { fixDropdownArrayInlineStyles, setupStyleObserver } from './dropdowns/dropdown-array.js';
import {
    initConditionalQuestionsAria,
    setupConditionalQuestionsObserver,
    initConditionalVisibilityNotifier,
    excludeIrrelevantInputsFromTabOrder,
} from './a11y/conditional-aria.js';
import { initMultipleShortText } from './inputs/input-on-demand.js';
import { initBootstrapButtonsRadio, initRadioOtherField } from './inputs/radio-buttons.js';
import { initCaptchaReload, initCaptchaValidation } from './captcha/captcha.js';
import { initAllRankingQuestions } from './ranking/ranking.js';

// --- Contrat global : exposition sur window ---
window.DSFRSanitizeRTEContent = sanitizeRTEContent;
// Exposé temporairement pour que les appels encore présents dans legacy.js
// (fonctions non-encore-extraites) le trouvent via leur scope. À retirer
// quand tout le code l'importe via ES modules.
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
    initNumericValidation();
    handleArrayValidation();
    handleNumericMultiValidation();
    handleSimpleQuestionValidation();
    transformValidationMessages();
    // Laisser un petit délai aux messages d'Expression Manager pour se peupler
    setTimeout(transformValidationMessages, 100);
    // L'observer de somme des numeric-multi a besoin que le DOM soit stable
    setTimeout(observeNumericMultiSumValidation, 200);
    // Créer le récapitulatif si des erreurs sont déjà présentes au chargement
    setTimeout(createErrorSummary, 100);

    // Tableaux dropdown-array : nettoyage mobile + observer
    fixDropdownArrayInlineStyles();
    setupStyleObserver();

    // Questions conditionnelles (a11y)
    initConditionalQuestionsAria();
    setupConditionalQuestionsObserver();
    initConditionalVisibilityNotifier();
    excludeIrrelevantInputsFromTabOrder();

    // Inputs et captcha
    initMultipleShortText();
    initBootstrapButtonsRadio();
    initRadioOtherField();
    initCaptchaReload();
    initCaptchaValidation();

    // Ranking accessible (SortableJS + clavier + aria-live)
    initAllRankingQuestions();

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
    initNumericValidation();
    handleArrayValidation();
    handleNumericMultiValidation();
    handleSimpleQuestionValidation();
    transformValidationMessages();
    fixDropdownArrayInlineStyles();
    setupStyleObserver();
    // fixTableAccessibility a historiquement un délai de 200ms après
    // questionsLoaded pour laisser le DOM se stabiliser.
    setTimeout(fixTableAccessibility, 200);
    setTimeout(observeNumericMultiSumValidation, 200);
    setTimeout(createErrorSummary, 100);

    // Inputs et captcha — re-init après chargement AJAX
    initMultipleShortText();
    initBootstrapButtonsRadio();
    initRadioOtherField();
    initCaptchaReload();
    initCaptchaValidation();

    // Ranking — réexécuté avec un délai pour laisser SortableJS se peupler
    setTimeout(initAllRankingQuestions, 300);
});

// --- Re-initialisation sur navigation pjax ---
onPjax(() => {
    setTimeout(sanitizeRTEContent, 100);
    setTimeout(initAllRankingQuestions, 300);
});

// --- Redimensionnement : dropdown-array selon largeur de fenêtre ---
let dropdownResizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(dropdownResizeTimer);
    dropdownResizeTimer = setTimeout(() => {
        fixDropdownArrayInlineStyles();
        setupStyleObserver();
    }, 250);
});
