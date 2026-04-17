/**
 * RGAA 7.5 / 11.1 — liaison des tips de validation aux champs.
 *
 * Le core LimeSurvey génère un tip `<div class="ls-questionhelp"
 * id="vmsg_<qid>">` par champ avec contrainte, mais sans le relier
 * sémantiquement au champ. On étend `aria-describedby` des
 * input/textarea/select pour inclure l'id du tip : les lecteurs
 * d'écran annoncent ainsi la contrainte au focus.
 *
 * Le `role="alert"` du core a parallèlement été retiré de help.twig
 * (cf. views/survey/questions/question_help/help.twig).
 *
 * Idempotent via `dataset.describedbyWired`.
 */

export function extendDescribedByForValidationTips() {
    const tips = document.querySelectorAll('.ls-questionhelp[id^="vmsg_"]');
    tips.forEach(function (tip) {
        if (tip.dataset.describedbyWired === '1') return;

        const question = tip.closest('[id^="question"]');
        if (!question) return;

        const fields = question.querySelectorAll('input, textarea, select');
        fields.forEach(function (field) {
            if (field.type === 'hidden') return;
            const existing = field.getAttribute('aria-describedby') || '';
            const ids = existing.split(/\s+/).filter(Boolean);
            if (ids.indexOf(tip.id) === -1) {
                ids.push(tip.id);
                field.setAttribute('aria-describedby', ids.join(' '));
            }
        });

        tip.dataset.describedbyWired = '1';
    });
}
