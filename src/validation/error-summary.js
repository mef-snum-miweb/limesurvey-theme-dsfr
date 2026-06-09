/**
 * Récapitulatif DSFR des erreurs de validation (RGAA 9.3, 11.10, WCAG 4.1.3).
 *
 * ## Composition
 *
 * Deux éléments distincts et indépendants :
 *
 *   1. `<div id="dsfr-error-summary" role="alert" tabindex="-1">` — le
 *      récapitulatif visible, créé après chaque soumission en échec. Le
 *      `role="alert"` assure l'annonce à la création initiale.
 *
 *   2. `<div id="dsfr-error-status" role="status" aria-live="polite"
 *         aria-atomic="true" class="fr-sr-only">` — région sr-only dédiée
 *      aux micro-annonces lors des corrections à la volée (retrait d'un
 *      item, décompte). `role="status"` (= `aria-live="polite"`) ne vole
 *      pas le focus et n'interrompt pas la lecture en cours.
 *
 * ## API exportée
 *
 *   - `createErrorSummary()` : crée le récapitulatif à partir des questions
 *     en erreur (`.question-container.input-error`). À appeler UNIQUEMENT
 *     après une soumission : c'est le seul moment où on scroll+focus le
 *     résumé. Idempotent (remplace l'existant).
 *
 *   - `updateErrorSummary()` : réconcilie la liste en place, sans scroll
 *     ni focus. Retire les items dont la question n'est plus en erreur
 *     et annonce la correction via la région `role="status"`. À appeler
 *     depuis chaque handler d'input (mst-errors, numeric-validation,
 *     array-validation) après qu'il a mis à jour les classes
 *     `input-error` / `input-valid` du `.question-container`.
 *
 * ## Ce que ce module NE fait PAS
 *
 *   - Pas de MutationObserver global : la mise à jour est pilotée par les
 *     handlers de validation qui appellent explicitement
 *     `updateErrorSummary()`. Un observer sur tout le subtree réagit à
 *     chaque frappe, recrée le résumé et vole le focus — c'était la
 *     cause du bug "focus remonte à la saisie".
 *
 *   - Pas de re-focus après la création initiale : l'utilisateur naviguant
 *     au clavier doit pouvoir rester sur son champ pendant qu'il corrige.
 */

import { tUI } from '../core/i18n.js';
import { isQuestionHidden } from '../core/dom-utils.js';

const SUMMARY_ID = 'dsfr-error-summary';
const STATUS_ID = 'dsfr-error-status';

/**
 * Sélecteur des questions considérées en erreur côté DOM.
 *
 * On s'appuie uniquement sur la classe `input-error` du `.question-container`,
 * posée/retirée par les handlers de validation DSFR (mst-errors, errors-dsfr,
 * numeric-validation, array-validation). La classe `fr-input-group--error`
 * n'est PAS un marqueur fiable au niveau question : elle reste parfois sur
 * le `.question-container` même après correction (résidu LimeSurvey ou
 * transformations DSFR), ce qui ferait apparaître la question comme
 * toujours en erreur dans le résumé.
 */
const ERROR_QUESTION_SELECTOR = '.question-container.input-error';

/**
 * Une question en erreur n'est listable QUE si elle est effectivement affichée.
 *
 * Le core LimeSurvey pose parfois `input-error` sur des questions mandatory
 * **non pertinentes** (conditionnelles masquées par relevance — classes
 * `ls-irrelevant`/`ls-hidden` + `display:none` posées côté serveur dès le
 * rendu). Cas observé sur le sondage 527199 (Galileo BNA) : un groupe où seule
 * la 1re question est visible affichait « 5 erreurs à corriger » listant 4
 * questions de suivi invisibles, conditionnées à la réponse de la 1re.
 *
 * On ne peut pas demander à l'utilisateur de corriger une question qu'il ne
 * voit pas → on les exclut du résumé. Le filtre est fiable au moment de la
 * construction : les classes de masquage sont présentes dans le HTML serveur,
 * pas ajoutées tardivement par le JS de relevance.
 */
function isListableError(question) {
    return question.matches(ERROR_QUESTION_SELECTOR) && !isQuestionHidden(question);
}

/* ──────────────── Helpers ──────────────── */

/** Retrouve (ou crée) la région sr-only qui annonce les corrections. */
function ensureStatusRegion() {
    let status = document.getElementById(STATUS_ID);
    if (status) return status;

    status = document.createElement('div');
    status.id = STATUS_ID;
    status.className = 'fr-sr-only';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');

    const summary = document.getElementById(SUMMARY_ID);
    if (summary && summary.parentNode) {
        summary.parentNode.insertBefore(status, summary.nextSibling);
    } else {
        document.body.appendChild(status);
    }
    return status;
}

/** Émet un message dans la région `role="status"` (relu à voix). */
function announceStatus(message) {
    const status = ensureStatusRegion();
    // Forcer un reflow textuel pour que les SR ré-annoncent, même si le
    // message est identique à un précédent.
    status.textContent = '';
    // Un micro-timeout évite la coalescence de deux updates successives.
    setTimeout(() => {
        status.textContent = message;
    }, 30);
}

/** Extrait le couple {id, label} d'une question en erreur. */
function describeErrorQuestion(question) {
    const id = question.id;

    const textEl = question.querySelector('.ls-label-question, .question-text');
    const text = textEl ? textEl.textContent.trim() : tUI('summary_untitled_question');

    const msgEl = question.querySelector('.fr-message--error');
    const msg = msgEl ? msgEl.textContent.trim() : '';

    let label = text;
    if (msg) label += ' : ' + msg;
    if (label.length > 150) label = label.substring(0, 147) + '...';

    return { id, label };
}

/** Construit un `<li>` pour une erreur donnée. */
function buildErrorItem(error) {
    const item = document.createElement('li');
    item.className = 'error-item';
    item.setAttribute('data-question-id', error.id);

    const link = document.createElement('a');
    link.setAttribute('href', '#' + error.id);
    link.className = 'fr-link fr-icon-error-warning-line fr-link--icon-left';
    link.textContent = error.label;

    link.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.getElementById(error.id);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            const firstInput = target.querySelector(
                '.fr-input:not([type="hidden"]), input:not([type="hidden"]), textarea, select',
            );
            if (firstInput) firstInput.focus();
        }, 300);
    });

    item.appendChild(link);
    return item;
}

/** Met à jour le titre et la description du résumé selon le nombre d'erreurs restantes. */
function updateHeader(summary, remaining) {
    const title = summary.querySelector('.fr-alert__title');
    const description = summary.querySelector('.dsfr-error-summary-desc');

    if (remaining === 0) {
        summary.className = 'fr-alert fr-alert--success fr-mb-4w';
        if (title) title.textContent = tUI('summary_all_fixed_title');
        if (description) description.textContent = tUI('summary_all_fixed_desc');
        return;
    }

    summary.className = 'fr-alert fr-alert--error fr-mb-4w';
    if (title) {
        title.textContent = remaining === 1
            ? tUI('summary_one_error')
            : tUI('summary_n_errors', null, remaining);
    }
    if (description) description.textContent = tUI('summary_fix_following');
}

/* ──────────────── API publique ──────────────── */

/**
 * Crée (ou reconstruit) le récapitulatif d'erreurs, scroll+focus dessus.
 * À n'appeler qu'à une soumission ayant échoué (init ou après submit).
 */
export function createErrorSummary() {
    const existing = document.getElementById(SUMMARY_ID);
    if (existing) existing.remove();

    const errorQuestions = Array.from(
        document.querySelectorAll(ERROR_QUESTION_SELECTOR),
    ).filter(isListableError);
    if (errorQuestions.length === 0) return;

    const summary = document.createElement('div');
    summary.id = SUMMARY_ID;
    summary.className = 'fr-alert fr-alert--error fr-mb-4w';
    summary.setAttribute('role', 'alert');
    summary.setAttribute('tabindex', '-1');

    // textContent + setAttribute partout : error.label et error.id
    // proviennent du textContent de labels contrôlés par l'admin du sondage,
    // innerHTML les ré-interpréterait comme HTML (XSS stocké).
    const title = document.createElement('h3');
    title.className = 'fr-alert__title';
    summary.appendChild(title);

    const description = document.createElement('p');
    description.className = 'dsfr-error-summary-desc';
    summary.appendChild(description);

    const list = document.createElement('ul');
    list.className = 'fr-mb-0';
    errorQuestions.forEach((q) => list.appendChild(buildErrorItem(describeErrorQuestion(q))));
    summary.appendChild(list);

    updateHeader(summary, errorQuestions.length);

    // Insertion : avant le premier .question-container du groupe courant.
    const firstQuestion = document.querySelector('.question-container');
    if (firstQuestion && firstQuestion.parentNode) {
        firstQuestion.parentNode.insertBefore(summary, firstQuestion);
    } else {
        const form = document.querySelector('form#limesurvey, form[name="limesurvey"]');
        if (form) form.insertBefore(summary, form.firstChild);
    }

    // La région sr-only status est posée juste après le résumé.
    ensureStatusRegion();

    // Scroll + focus SEULEMENT à la création (= submit en échec). Les
    // mises à jour à la volée passent par updateErrorSummary() qui ne
    // touche pas au focus.
    setTimeout(() => {
        summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
        summary.focus();
    }, 100);
}

/**
 * Réconcilie le résumé existant avec l'état actuel des questions :
 *   - retire les items dont la question n'est plus en erreur
 *   - annonce chaque retrait via la région `role="status"`
 *   - met à jour le compteur / titre
 *
 * Sans scroll, sans focus, sans destruction — idempotent et silencieux
 * si aucune correction depuis le dernier appel.
 */
export function updateErrorSummary() {
    const summary = document.getElementById(SUMMARY_ID);
    if (!summary) return;

    const items = Array.from(summary.querySelectorAll('.error-item'));
    let removed = 0;
    const correctedLabels = [];

    items.forEach((item) => {
        const id = item.getAttribute('data-question-id');
        if (!id) return;
        const question = document.getElementById(id);
        if (!question) return;

        // Une question est considérée "corrigée" dès qu'elle ne porte plus
        // de classe `input-error` ET qu'elle ne matche plus le sélecteur
        // d'erreur (fr-input-group--error). On ne s'appuie PAS sur une
        // heuristique "tous les champs sont remplis" car chaque handler
        // de validation (mst-errors, numeric, array) sait mieux que nous
        // si la question est valide (notamment pour les sous-questions).
        // Une question devenue non pertinente (masquée par relevance) sort
        // également du résumé : `isListableError` couvre les deux cas.
        const stillInError = isListableError(question);
        if (stillInError) return;

        const link = item.querySelector('a');
        const label = link ? link.textContent.trim() : '';
        if (label) correctedLabels.push(label.split(' : ')[0]);
        item.remove();
        removed++;
    });

    // Ré-ajouter les questions RETOMBÉES en erreur (ex. champ re-vidé après
    // correction) : sans cette passe, une erreur réactivée restait absente
    // du récapitulatif alors que la question portait input-error.
    let added = 0;
    const addedLabels = [];
    const list = summary.querySelector('ul');
    if (list) {
        const presentIds = new Set(
            Array.from(summary.querySelectorAll('.error-item'))
                .map((item) => item.getAttribute('data-question-id')),
        );
        Array.from(document.querySelectorAll(ERROR_QUESTION_SELECTOR))
            .filter(isListableError)
            .forEach((question) => {
                if (!question.id || presentIds.has(question.id)) return;
                const error = describeErrorQuestion(question);
                list.appendChild(buildErrorItem(error));
                addedLabels.push(error.label.split(' : ')[0]);
                added++;
            });
    }

    const remaining = summary.querySelectorAll('.error-item').length;
    updateHeader(summary, remaining);

    // Annonce polie au lecteur d'écran. Si plusieurs corrections sont
    // faites dans la même passe (ex. remplissage rapide), on regroupe.
    if (removed > 0 || added > 0) {
        const parts = [];
        if (removed === 1) {
            parts.push(tUI('summary_fixed_one', correctedLabels[0]));
        } else if (removed > 1) {
            parts.push(tUI('summary_fixed_n', null, removed));
        }
        if (added === 1) {
            parts.push(tUI('summary_new_error', addedLabels[0]));
        } else if (added > 1) {
            parts.push(tUI('summary_new_errors', null, added));
        }
        if (remaining === 0) {
            parts.push(tUI('summary_all_fixed_announce'));
        } else {
            parts.push(remaining === 1 ? tUI('summary_remaining_one') : tUI('summary_remaining_n', null, remaining));
        }
        announceStatus(parts.join(' '));
    }
}
