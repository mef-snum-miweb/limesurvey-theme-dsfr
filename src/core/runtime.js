/**
 * Hooks de cycle de vie LimeSurvey.
 *
 * Centralise les trois moments où le thème initialise ou ré-initialise
 * ses comportements :
 *
 * - `onReady`          : DOMContentLoaded, ou appel immédiat si la page
 *                        est déjà chargée au moment de l'abonnement.
 * - `onQuestionsLoaded`: événement custom `limesurvey:questionsLoaded`
 *                        émis par le core LS après un chargement AJAX de
 *                        questions (format inline, all-in-one).
 * - `onPjax`           : événement jQuery `pjax:complete` (navigation
 *                        AJAX entre pages). Silencieusement ignoré si
 *                        jQuery n'est pas présent au moment de l'appel.
 */

export function onReady(cb) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cb);
    } else {
        cb();
    }
}

export function onQuestionsLoaded(cb) {
    document.addEventListener('limesurvey:questionsLoaded', cb);
}

export function onPjax(cb) {
    if (typeof window.$ !== 'undefined') {
        window.$(document).on('pjax:complete', cb);
    }
}
