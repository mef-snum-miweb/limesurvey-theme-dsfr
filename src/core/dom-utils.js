/**
 * Helpers DOM partagés, purs (pas de side-effects).
 *
 * `isValidNumber` : format de nombre accepté par les validations DSFR
 * (FR-friendly : virgule et point, partie entière et/ou décimale autorisées).
 *
 * `isQuestionHidden` : état d'affichage d'une question LimeSurvey, basé sur
 * les classes que le core ajoute (`ls-irrelevant`, `ls-hidden`) et sur le
 * `display: none` inline.
 */

export function isValidNumber(value) {
    return /^-?\d+([.,]\d*)?$/.test(value) || /^-?\d*[.,]\d+$/.test(value);
}

export function isQuestionHidden(el) {
    return (
        el.style.display === 'none' ||
        el.classList.contains('ls-irrelevant') ||
        el.classList.contains('ls-hidden') ||
        el.classList.contains('d-none')
    );
}

/**
 * Détermine si un élément doit être ignoré par le nettoyage de styles
 * inline ajoutés par le RTE (astérisques obligatoires, images, uploads).
 * Utilisé par la chaîne `sanitize*` — sera déplacé dans `src/rte/` lors
 * de l'extraction du module sanitize.
 */
export function shouldSkipElement(element) {
    if (!element) return true;

    if (element.classList && (
        element.classList.contains('required-asterisk') ||
        element.classList.contains('asterisk')
    )) return true;

    if (element.tagName === 'IMG') return true;

    if (element.querySelector && element.querySelector('img')) return true;

    if (element.closest && element.closest('[class*="upload"]')) return true;
    if (element.closest && element.closest('[class*="file"]')) return true;

    return false;
}
