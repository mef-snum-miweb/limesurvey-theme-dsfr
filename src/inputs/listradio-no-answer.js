/**
 * Repositionne l'option "Sans réponse" en tête d'un list-radio DSFR.
 *
 * Le core LimeSurvey rend l'option `<input value="">` ("Sans réponse")
 * en dernière position, ce qui casse la cible Tab par défaut du
 * radiogroup (RGAA 12.9 + UX). On la replace en première position du
 * fieldset et on ajuste l'état coché selon les règles suivantes :
 *
 *   1. Aucun radio coché → cocher "Sans réponse" (défaut propre).
 *   2. "Autre" coché MAIS champ texte vide → état incomplet, reset
 *      sur "Sans réponse".
 *   3. Sinon → respecter l'état serveur.
 *
 * Idempotent via `dataset.listradioReordered`.
 */

export function reorderListRadioNoAnswer() {
    const questions = document.querySelectorAll('.list-radio.question-container');
    questions.forEach(function (q) {
        if (q.dataset.listradioReordered === '1') return;

        const noAnswerRadio = q.querySelector('input[type="radio"][value=""]');
        if (!noAnswerRadio) return;

        const noAnswerRow = noAnswerRadio.closest('.fr-fieldset__element');
        if (!noAnswerRow) return;

        const content = noAnswerRow.parentNode;
        if (content && content.firstElementChild !== noAnswerRow) {
            content.insertBefore(noAnswerRow, content.firstElementChild);
        }

        const allRadios = q.querySelectorAll('input[type="radio"][name="' + noAnswerRadio.name + '"]');
        const anyChecked = Array.prototype.some.call(allRadios, function (r) { return r.checked; });

        const otherRadio = q.querySelector('input[type="radio"][id^="SOTH"]');
        let isIncompleteOther = false;
        if (otherRadio && otherRadio.checked) {
            const otherText = q.querySelector('[id$="othertext"]');
            if (otherText && otherText.value.trim() === '') {
                isIncompleteOther = true;
            }
        }

        if (!anyChecked || isIncompleteOther) {
            allRadios.forEach(function (r) {
                r.checked = false;
                r.removeAttribute('checked');
            });
            noAnswerRadio.checked = true;
            noAnswerRadio.setAttribute('checked', 'checked');

            const javaInput = q.querySelector('input[type="hidden"][id^="java"]');
            if (javaInput) {
                javaInput.value = '';
            }

            if (otherRadio) {
                otherRadio.setAttribute('aria-expanded', 'false');
            }
        }

        q.dataset.listradioReordered = '1';
    });
}
