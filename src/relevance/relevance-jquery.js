/**
 * Handlers jQuery de la relevance LimeSurvey (questions conditionnelles).
 *
 * Le core LimeSurvey émet des événements custom `relevance:on` / `relevance:off`
 * sur les questions et groupes quand l'Expression Manager décide de les
 * montrer ou les masquer. Par défaut le thème ne réagit pas à ces événements —
 * on redéfinit localement (comme fruity_twentythree) les handlers
 * `triggerEmRelevance*` pour :
 *
 * - Ajouter / retirer `ls-irrelevant ls-hidden` sur les questions, groupes et
 *   sous-questions.
 * - Ré-activer / désactiver les inputs (disabled, tabindex) selon l'état.
 * - Mettre à jour la parité des lignes (`ls-odd` / `ls-even`) et les en-têtes
 *   répétés des tableaux multi-lignes.
 *
 * Ces fonctions sont dépendantes de jQuery (`$`) car elles reproduisent le
 * contrat de `survey.js` du core. Elles sont ré-exposées sur `window` depuis
 * `src/index.js` via `registerRelevanceGlobals()` — le core LimeSurvey les
 * appelle via `window.triggerEmRelevance()` sur certaines pages.
 */

/* eslint-disable no-undef */ // $ est fourni par jQuery global

export function triggerEmRelevance() {
    triggerEmRelevanceQuestion();
    triggerEmRelevanceGroup();
    triggerEmRelevanceSubQuestion();
}

export function triggerEmRelevanceQuestion() {
    $("[id^='question']").on('relevance:on', function (event) {
        if (event.target != this) return;
        $(this).removeClass('ls-irrelevant ls-hidden');
        $(this).find('input, textarea, select').each(function () {
            $(this).prop('disabled', false);
            $(this).removeAttr('tabindex');
        });
    });
    $("[id^='question']").on('relevance:off', function (event) {
        if (event.target != this) return;
        $(this).addClass('ls-irrelevant ls-hidden');
        $(this).find('input, textarea, select').each(function () {
            $(this).attr('tabindex', '-1');
        });
    });
    // Mode All-in-one : maintenir la visibilité du groupe aussi
    $(".allinone [id^='group-']:not(.ls-irrelevant) [id^='question']").on('relevance:on', function (event) {
        if (event.target != this) return;
        $(this).closest("[id^='group-']").removeClass('ls-hidden');
    });
    $(".allinone [id^='group-']:not(.ls-irrelevant) [id^='question']").on('relevance:off', function (event) {
        if (event.target != this) return;
        if ($(this).closest("[id^='group-']").find("[id^='question']").length == $(this).closest("[id^='group-']").find("[id^='question'].ls-hidden").length) {
            $(this).closest("[id^='group-']").addClass('ls-hidden');
        }
    });
}

export function triggerEmRelevanceGroup() {
    $("[id^='group-']").on('relevance:on', function (event) {
        if (event.target != this) return;
        $(this).removeClass('ls-irrelevant ls-hidden');
    });
    $("[id^='group-']").on('relevance:off', function (event) {
        if (event.target != this) return;
        $(this).addClass('ls-irrelevant ls-hidden');
    });
}

export function triggerEmRelevanceSubQuestion() {
    $("[id^='question']").on('relevance:on', "[id^='javatbd']", function (event, data) {
        if (event.target != this) return;
        data = $.extend({ style: 'hidden' }, data);
        $(this).removeClass('ls-irrelevant ls-' + data.style);
        if (data.style == 'disabled') {
            if ($(event.target).hasClass('answer-item')) {
                $(event.target).find('input').each(function (itrt, item) {
                    $(item).prop('disabled', false);
                });
            } else {
                $(event.target).find('.answer-item input').each(function (itrt, item) {
                    $(item).prop('disabled', false);
                });
            }
        }
        if (data.style == 'hidden') {
            updateLineClass($(this));
            updateRepeatHeading($(this).closest('.ls-answers'));
        }
    });
    $("[id^='question']").on('relevance:off', "[id^='javatbd']", function (event, data) {
        if (event.target != this) return;
        data = $.extend({ style: 'hidden' }, data);
        $(this).addClass('ls-irrelevant ls-' + data.style);
        if (data.style == 'disabled') {
            $(event.target).find('input').each(function (itrt, item) {
                if ($(item).attr('type') == 'checkbox' && $(item).prop('checked')) {
                    $(item).prop('checked', false).trigger('change');
                }
                $(item).prop('disabled', true);
            });
        }
        if (data.style == 'hidden') {
            updateLineClass($(this));
            updateRepeatHeading($(this).closest('.ls-answers'));
        }
    });
}

export function updateLineClass(line) {
    if ($(line).hasClass('ls-odd') || $(line).hasClass('ls-even')) {
        $(line).closest('.ls-answers').find('.ls-odd:visible,.ls-even:visible').each(function (index) {
            $(this).removeClass('ls-odd ls-even').addClass(((index + 1) % 2 == 0) ? 'ls-odd' : 'ls-even');
        });
    }
}

export function updateRepeatHeading(answers) {
    $(function () {
        if ($(answers).data('repeatHeading') || $(answers).find('tbody').find('.ls-heading').length) {
            if (!$(answers).data('repeatHeading')) {
                $(answers).data('repeatHeading', $(answers).find('tbody').find('.ls-heading').first().html());
            }
            $(answers).find('tbody').find('.ls-heading').remove();
            var repeatHeading = $(answers).data('repeatHeading');
            $(answers).find('tbody').find('tr:visible').each(function (index) {
                if (repeatHeading && index > 0 && index % repeatHeading == 0) {
                    $(this).before("<tr class='ls-heading'>" + repeatHeading + '</tr>');
                }
            });
        }
    });
}

/**
 * Wrapper d'init appelé depuis `src/index.js` : attache les handlers de
 * relevance quand jQuery est disponible. Si jQuery n'est pas encore chargé
 * au onReady (cas rare mais possible), on attend 100 ms et on réessaye.
 */
export function initRelevanceHandlers() {
    triggerEmRelevance();
}

/**
 * Expose les fonctions relevance sur `window` — contrat avec le core
 * LimeSurvey qui peut les appeler depuis du code externe (via
 * `window.triggerEmRelevance()` sur certaines pages all-in-one).
 */
export function registerRelevanceGlobals(win = window) {
    win.triggerEmRelevance = triggerEmRelevance;
    win.triggerEmRelevanceQuestion = triggerEmRelevanceQuestion;
    win.triggerEmRelevanceGroup = triggerEmRelevanceGroup;
    win.triggerEmRelevanceSubQuestion = triggerEmRelevanceSubQuestion;
    win.updateLineClass = updateLineClass;
    win.updateRepeatHeading = updateRepeatHeading;
}
