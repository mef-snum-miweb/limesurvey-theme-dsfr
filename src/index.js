/**
 * Point d'entrée du thème DSFR pour LimeSurvey.
 *
 * Construit par esbuild vers `scripts/custom.js` (qui reste l'artefact
 * référencé par `config.xml`). Orchestre les initialisations des modules
 * `src/<domaine>/*.js` via les hooks `onReady`, `onQuestionsLoaded` et
 * `onPjax` de `core/runtime.js`.
 *
 * Les contrats globaux LimeSurvey (fonctions attendues sur `window`) sont
 * exposés ici via `registerRelevanceGlobals` et `window.DSFRSanitizeRTEContent`.
 */

import './banner.js';

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
import { createErrorSummary } from './validation/error-summary.js';
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
import { initRelevanceHandlers, registerRelevanceGlobals } from './relevance/relevance-jquery.js';

// --- Contrats globaux LimeSurvey ---
// Le core et d'éventuels plugins tiers peuvent appeler ces fonctions via
// `window.<fn>()`. On les expose AVANT onReady pour couvrir le cas où le
// core les invoque tôt dans le cycle de vie de la page.
registerRelevanceGlobals(window);
window.DSFRSanitizeRTEContent = sanitizeRTEContent;

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

    // Relevance jQuery — légère attente pour laisser jQuery se charger
    // sur les pages où il arrive après DOMContentLoaded.
    setTimeout(initRelevanceHandlers, 100);

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

    // Relevance — les handlers s'appuient sur un namespace jQuery `.dsfrRelevance`
    // et font `$(sel).off('.dsfrRelevance').on(...)` avant chaque ré-attachement,
    // sans quoi chaque onQuestionsLoaded/onPjax empilerait une copie de plus.
    initRelevanceHandlers();
});

// --- Re-initialisation sur navigation pjax ---
onPjax(() => {
    setTimeout(sanitizeRTEContent, 100);
    setTimeout(initAllRankingQuestions, 300);
    initRelevanceHandlers();
    // Si la page pjax répond avec des erreurs de validation côté serveur,
    // le résumé doit être (re)construit — à l'identique des branches onReady
    // et onQuestionsLoaded.
    setTimeout(createErrorSummary, 200);
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
