/**
 * Hooks de cycle de vie LimeSurvey.
 *
 * Centralise les trois moments où le thème initialise ou ré-initialise
 * ses comportements :
 *
 * - `onReady`          : DOMContentLoaded, ou appel immédiat si la page
 *                        est déjà chargée au moment de l'abonnement.
 * - `onQuestionsLoaded`: nouvelles questions insérées dans le DOM.
 *                        VÉRIFIÉ (revue 2026-06, #29) : le core LS 6.16
 *                        n'émet AUCUN événement `limesurvey:questionsLoaded`
 *                        — le vrai mécanisme de rechargement de questions
 *                        est la navigation pjax. Les callbacks sont donc
 *                        déclenchés sur `pjax:complete` (jQuery) ET sur
 *                        l'événement DOM custom (point d'extension si un
 *                        plugin veut forcer une ré-init).
 * - `onPjax`           : événement jQuery `pjax:complete`. L'abonnement
 *                        attend jQuery (retry) au lieu d'abandonner
 *                        silencieusement si le bundle s'évalue avant lui.
 */

const JQUERY_RETRY_INTERVAL_MS = 100;
const JQUERY_RETRY_MAX = 100; // ~10 s, même budget que bootstrap-stubs.js

/** Exécute cb dès que jQuery est disponible (ou jamais, après ~10 s). */
function whenJQueryReady(cb) {
    if (typeof window.$ !== 'undefined') {
        cb(window.$);
        return;
    }
    let attempts = 0;
    const timer = setInterval(() => {
        attempts++;
        if (typeof window.$ !== 'undefined') {
            clearInterval(timer);
            cb(window.$);
        } else if (attempts >= JQUERY_RETRY_MAX) {
            clearInterval(timer);
        }
    }, JQUERY_RETRY_INTERVAL_MS);
}

export function onReady(cb) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cb);
    } else {
        cb();
    }
}

export function onQuestionsLoaded(cb) {
    // Point d'extension explicite (dispatch manuel possible)…
    document.addEventListener('limesurvey:questionsLoaded', cb);
    // …et mécanisme réel : navigation pjax (les modules re-initialisés
    // sont idempotents — flags dataset/namespaces — le recouvrement avec
    // onPjax est sans effet de bord).
    whenJQueryReady(($) => {
        $(document).on('pjax:complete.dsfrQuestionsLoaded', cb);
    });
}

export function onPjax(cb) {
    whenJQueryReady(($) => {
        $(document).on('pjax:complete.dsfrPjax', cb);
    });
}
