/**
 * RGAA 7.4 — inputmode="numeric" sur les champs numériques.
 *
 * Le core LimeSurvey rend les champs "numbers only" comme
 * `<input type="text" data-number="1">`. On y ajoute `inputmode="numeric"`
 * pour déclencher le clavier numérique sur mobile et signaler la nature
 * du champ aux AT, sans tomber dans les bugs connus de `type="number"`
 * (roulette, notation scientifique, locales).
 *
 * Idempotent via `dataset.inputmodeWired`.
 */

export function addInputmodeNumericToNumericFields() {
    const numericInputs = document.querySelectorAll('input[data-number="1"]');
    numericInputs.forEach(function (input) {
        if (input.dataset.inputmodeWired === '1') return;
        if (!input.hasAttribute('inputmode')) {
            input.setAttribute('inputmode', 'numeric');
        }
        input.dataset.inputmodeWired = '1';
    });
}
