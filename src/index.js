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
import { initSearchableDropdowns } from './dropdowns/combobox.js';
import { initStepperProgress } from './ui/stepper-progress.js';
import {
    initConditionalQuestionsAria,
    setupConditionalQuestionsObserver,
    initConditionalVisibilityNotifier,
    excludeIrrelevantInputsFromTabOrder,
} from './a11y/conditional-aria.js';
import { initMultipleShortText } from './inputs/input-on-demand.js';
import { initNativeSliders } from './inputs/slider-native.js';
import { initNativeDateInputs } from './inputs/date-native.js';
import { initBootstrapButtonsRadio, initRadioOtherField } from './inputs/radio-buttons.js';
import { initCaptchaReload, initCaptchaValidation } from './captcha/captcha.js';
import { initAllRankingQuestions } from './ranking/ranking.js';
import { initRelevanceHandlers, registerRelevanceGlobals } from './relevance/relevance-jquery.js';


/**
 * Exécute une initialisation en l'isolant : une init qui lève (API DOM
 * absente sur un vieux navigateur, markup inattendu) ne doit pas empêcher
 * les inits suivantes de tourner. Cf. revue 2026-06 (C2) : un :has() non
 * supporté dans required-fields interrompait toute l'initialisation.
 */
function safeInit(fn) {
    try {
        fn();
    } catch (e) {
        if (typeof console !== 'undefined' && console.warn) {
            console.warn('[DSFR] init "' + (fn.name || 'anonyme') + '" en échec :', e);
        }
    }
}

// --- Contrats globaux LimeSurvey ---
// Le core et d'éventuels plugins tiers peuvent appeler ces fonctions via
// `window.<fn>()`. On les expose AVANT onReady pour couvrir le cas où le
// core les invoque tôt dans le cycle de vie de la page.
registerRelevanceGlobals(window);
window.DSFRSanitizeRTEContent = sanitizeRTEContent;


// Délais d'ordonnancement (ms) — laissent le DOM/EM se stabiliser avant
// les passes qui lisent leur état. Valeurs historiques, conservées telles
// quelles ; chaque init reste idempotente si elle tourne deux fois.
const DELAY_EM_MESSAGES = 100;   // messages EM peuplés après le rendu
const DELAY_DOM_STABLE = 200;    // observers posés après stabilisation DOM
const DELAY_RANKING = 300;       // SortableJS peuplé (listes ranking)
const DELAY_AFTER_SUBMIT = 500;  // round-trip validation serveur

// --- Initialisation au chargement de la page ---
onReady(() => {
    safeInit(sanitizeRTEContent);
    safeInit(enableImageLazyLoading);
    safeInit(extendDescribedByForValidationTips);
    safeInit(addInputmodeNumericToNumericFields);
    safeInit(reorderListRadioNoAnswer);
    safeInit(fixTableAccessibility);

    // Validation DSFR
    safeInit(handleRequiredFields);
    safeInit(transformErrorsToDsfr);
    safeInit(handleMultipleShortTextErrors);
    safeInit(observeErrorChanges);
    safeInit(initAriaInvalidSync);
    safeInit(initNumericValidation);
    safeInit(handleArrayValidation);
    safeInit(handleNumericMultiValidation);
    safeInit(handleSimpleQuestionValidation);
    safeInit(transformValidationMessages);
    // Laisser un petit délai aux messages d'Expression Manager pour se peupler
    setTimeout(() => safeInit(transformValidationMessages), 100);
    // L'observer de somme des numeric-multi a besoin que le DOM soit stable
    setTimeout(() => safeInit(observeNumericMultiSumValidation), DELAY_DOM_STABLE);
    // Créer le récapitulatif si des erreurs sont déjà présentes au chargement
    setTimeout(() => safeInit(createErrorSummary), DELAY_EM_MESSAGES);

    // Tableaux dropdown-array : nettoyage mobile + observer
    safeInit(fixDropdownArrayInlineStyles);
    safeInit(setupStyleObserver);

    // Combobox DSFR accessible : remplace bootstrap-select sur les
    // list_dropdown avec recherche (cf. src/dropdowns/combobox.js).
    safeInit(initSearchableDropdowns);

    // Stepper DSFR : pilote la barre de progression via --fr-progress
    // (contourne la limite DSFR à 8 étapes — cf. src/ui/stepper-progress.js).
    safeInit(initStepperProgress);

    // Questions conditionnelles (a11y)
    safeInit(initConditionalQuestionsAria);
    safeInit(setupConditionalQuestionsObserver);
    safeInit(initConditionalVisibilityNotifier);
    safeInit(excludeIrrelevantInputsFromTabOrder);

    // Inputs et captcha
    safeInit(initMultipleShortText);
    safeInit(initBootstrapButtonsRadio);
    safeInit(initRadioOtherField);
    safeInit(initNativeSliders);
    safeInit(initNativeDateInputs);
    safeInit(initCaptchaReload);
    safeInit(initCaptchaValidation);

    // Ranking accessible (SortableJS + clavier + aria-live)
    safeInit(initAllRankingQuestions);

    // Relevance jQuery — légère attente pour laisser jQuery se charger
    // sur les pages où il arrive après DOMContentLoaded.
    setTimeout(() => safeInit(initRelevanceHandlers), DELAY_EM_MESSAGES);

    // Re-déclencher la transformation + le récapitulatif après soumission
    // LimeSurvey (cas de validation côté serveur qui ne passe pas par pjax).
    const forms = document.querySelectorAll('form#limesurvey, form[name="limesurvey"]');
    forms.forEach((form) => {
        form.addEventListener('submit', () => {
            setTimeout(() => {
                safeInit(transformErrorsToDsfr);
                safeInit(createErrorSummary);
            }, DELAY_AFTER_SUBMIT);
        });
    });
});

// --- Re-initialisation sur chargement AJAX de questions ---
onQuestionsLoaded(() => {
    safeInit(enableImageLazyLoading);
    safeInit(extendDescribedByForValidationTips);
    safeInit(addInputmodeNumericToNumericFields);
    safeInit(reorderListRadioNoAnswer);
    safeInit(handleRequiredFields);
    safeInit(transformErrorsToDsfr);
    safeInit(handleMultipleShortTextErrors);
    safeInit(initNumericValidation);
    safeInit(handleArrayValidation);
    safeInit(handleNumericMultiValidation);
    safeInit(handleSimpleQuestionValidation);
    safeInit(transformValidationMessages);
    safeInit(fixDropdownArrayInlineStyles);
    safeInit(setupStyleObserver);
    safeInit(initSearchableDropdowns);
    // fixTableAccessibility a historiquement un délai de 200ms après
    // questionsLoaded pour laisser le DOM se stabiliser.
    setTimeout(() => safeInit(fixTableAccessibility), DELAY_DOM_STABLE);
    setTimeout(() => safeInit(observeNumericMultiSumValidation), DELAY_DOM_STABLE);
    setTimeout(() => safeInit(createErrorSummary), DELAY_EM_MESSAGES);

    // Inputs et captcha — re-init après chargement AJAX
    safeInit(initMultipleShortText);
    safeInit(initBootstrapButtonsRadio);
    safeInit(initRadioOtherField);
    safeInit(initNativeSliders);
    safeInit(initNativeDateInputs);
    safeInit(initCaptchaReload);
    safeInit(initCaptchaValidation);

    // Ranking — réexécuté avec un délai pour laisser SortableJS se peupler
    setTimeout(() => safeInit(initAllRankingQuestions), DELAY_RANKING);

    // Relevance — les handlers s'appuient sur un namespace jQuery `.dsfrRelevance`
    // et font `$(sel).off('.dsfrRelevance').on(...)` avant chaque ré-attachement,
    // sans quoi chaque onQuestionsLoaded/onPjax empilerait une copie de plus.
    safeInit(initRelevanceHandlers);
});

// --- Re-initialisation sur navigation pjax ---
onPjax(() => {
    setTimeout(() => safeInit(sanitizeRTEContent), DELAY_EM_MESSAGES);
    setTimeout(() => safeInit(initAllRankingQuestions), DELAY_RANKING);
    safeInit(initRelevanceHandlers);
    safeInit(initSearchableDropdowns);
    safeInit(initStepperProgress);
    safeInit(initNativeSliders);
    safeInit(initNativeDateInputs);
    // Si la page pjax répond avec des erreurs de validation côté serveur,
    // le résumé doit être (re)construit — à l'identique des branches onReady
    // et onQuestionsLoaded.
    setTimeout(() => safeInit(createErrorSummary), DELAY_DOM_STABLE);
});

// --- Redimensionnement : dropdown-array selon largeur de fenêtre ---
let dropdownResizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(dropdownResizeTimer);
    dropdownResizeTimer = setTimeout(() => {
        safeInit(fixDropdownArrayInlineStyles);
        safeInit(setupStyleObserver);
    }, 250);
});
