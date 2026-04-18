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
