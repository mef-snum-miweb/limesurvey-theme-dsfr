/**
 * JavaScript personnalisé pour le thème DSFR
 *
 * Utilisez ce fichier pour vos scripts personnalisés
 * sans modifier theme.js
 */

import { tMandatory, tRanking } from './core/i18n.js';
import { isValidNumber, isQuestionHidden } from './core/dom-utils.js';
import { updateErrorSummary } from './validation/error-summary.js';

// Message de bienvenue
console.log('%c\n' +
    '             Développé avec ❤️ par la                   \n' +
    '                                                        \n' +
    '       ███╗   ███╗██╗██╗    ██╗███████╗██████╗           \n' +
    '       ████╗ ████║██║██║    ██║██╔════╝██╔══██╗          \n' +
    '       ██╔████╔██║██║██║ █╗ ██║█████╗  ██████╔╝          \n' +
    '       ██║╚██╔╝██║██║██║███╗██║██╔══╝  ██╔══██╗          \n' +
    '       ██║ ╚═╝ ██║██║╚███╔███╔╝███████╗██████╔╝          \n' +
    '       ╚═╝     ╚═╝╚═╝ ╚══╝╚══╝ ╚══════╝╚═════╝           \n' +
    '                                                        \n' +
    '           Mission Ingénierie du Web                   \n' +
    '    Ministère de l\'Économie et des Finances         \n' +
    '    https://github.com/bmatge/limesurvey-theme-dsfr  \n' +
    '    Thème DSFR pour LimeSurvey - 2025 - Etalab 2.0    \n',
    'color: #000091; font-weight: bold;'
);



// ============================================
// FIX: Définition locale des handlers de relevance (questions conditionnelles)
// ============================================
// Comme fruity_twentythree, on définit les fonctions triggerEmRelevance* localement
// pour garantir leur disponibilité et leur bon fonctionnement avec le thème DSFR.

/**
 * Action à effectuer quand la relevance est activée ou désactivée
 * Copié depuis survey.js de LimeSurvey core
 */
function triggerEmRelevance() {
    triggerEmRelevanceQuestion();
    triggerEmRelevanceGroup();
    triggerEmRelevanceSubQuestion();
}

/* Sur les questions */
function triggerEmRelevanceQuestion() {
    /* Action sur cette question */
    $("[id^='question']").on('relevance:on', function(event, data) {
        if (event.target != this) return;
        $(this).removeClass("ls-irrelevant ls-hidden");
        // Réactiver les inputs pour qu'ils soient focusables
        $(this).find('input, textarea, select').each(function() {
            $(this).prop('disabled', false);
            $(this).removeAttr('tabindex');
        });
    });
    $("[id^='question']").on('relevance:off', function(event, data) {
        if (event.target != this) return;
        $(this).addClass("ls-irrelevant ls-hidden");
        // Exclure les inputs du tab order et de la soumission
        $(this).find('input, textarea, select').each(function() {
            $(this).attr('tabindex', '-1');
        });
    });
    /* En mode All-in-one : besoin de mettre à jour le groupe aussi */
    $(".allinone [id^='group-']:not(.ls-irrelevant) [id^='question']").on('relevance:on', function(event, data) {
        if (event.target != this) return;
        $(this).closest("[id^='group-']").removeClass("ls-hidden");
    });
    $(".allinone [id^='group-']:not(.ls-irrelevant) [id^='question']").on('relevance:off', function(event, data) {
        if (event.target != this) return;
        if ($(this).closest("[id^='group-']").find("[id^='question']").length == $(this).closest("[id^='group-']").find("[id^='question'].ls-hidden").length) {
            $(this).closest("[id^='group-']").addClass("ls-hidden");
        }
    });
}

/* Sur les groupes */
function triggerEmRelevanceGroup() {
    $("[id^='group-']").on('relevance:on', function(event, data) {
        if (event.target != this) return;
        $(this).removeClass("ls-irrelevant ls-hidden");
    });
    $("[id^='group-']").on('relevance:off', function(event, data) {
        if (event.target != this) return;
        $(this).addClass("ls-irrelevant ls-hidden");
    });
}

/* Sur les sous-questions et listes de réponses */
function triggerEmRelevanceSubQuestion() {
    $("[id^='question']").on('relevance:on', "[id^='javatbd']", function(event, data) {
        if (event.target != this) return;
        data = $.extend({ style: 'hidden' }, data);
        $(this).removeClass("ls-irrelevant ls-" + data.style);
        if (data.style == 'disabled') {
            if ($(event.target).hasClass("answer-item")) {
                $(event.target).find('input').each(function(itrt, item) {
                    $(item).prop("disabled", false);
                });
            } else {
                $(event.target).find('.answer-item input').each(function(itrt, item) {
                    $(item).prop("disabled", false);
                });
            }
        }
        if (data.style == 'hidden') {
            updateLineClass($(this));
            updateRepeatHeading($(this).closest(".ls-answers"));
        }
    });
    $("[id^='question']").on('relevance:off', "[id^='javatbd']", function(event, data) {
        if (event.target != this) return;
        data = $.extend({ style: 'hidden' }, data);
        $(this).addClass("ls-irrelevant ls-" + data.style);
        if (data.style == 'disabled') {
            $(event.target).find('input').each(function(itrt, item) {
                if ($(item).attr('type') == 'checkbox' && $(item).prop('checked')) {
                    $(item).prop('checked', false).trigger('change');
                }
                $(item).prop("disabled", true);
            });
        }
        if (data.style == 'hidden') {
            updateLineClass($(this));
            updateRepeatHeading($(this).closest(".ls-answers"));
        }
    });
}

/* Mise à jour des classes de ligne lors de relevance:(on|off) */
function updateLineClass(line) {
    if ($(line).hasClass("ls-odd") || $(line).hasClass("ls-even")) {
        $(line).closest(".ls-answers").find(".ls-odd:visible,.ls-even:visible").each(function(index) {
            $(this).removeClass('ls-odd ls-even').addClass(((index + 1) % 2 == 0) ? "ls-odd" : "ls-even");
        });
    }
}

/* Mise à jour des en-têtes répétés */
function updateRepeatHeading(answers) {
    $(function() {
        if ($(answers).data("repeatHeading") || $(answers).find("tbody").find(".ls-heading").length) {
            if (!$(answers).data("repeatHeading")) {
                $(answers).data("repeatHeading", $(answers).find("tbody").find(".ls-heading").first().html());
            }
            $(answers).find("tbody").find(".ls-heading").remove();
            var repeatHeading = $(answers).data("repeatHeading");
            $(answers).find("tbody").find("tr:visible").each(function(index) {
                if (repeatHeading && index > 0 && index % repeatHeading == 0) {
                    $(this).before("<tr class='ls-heading'>" + repeatHeading + "</tr>");
                }
            });
        }
    });
}

// Initialisation des handlers de relevance
(function() {
    'use strict';

    function initRelevanceHandlers() {
        // Appeler notre version locale de triggerEmRelevance
        triggerEmRelevance();
    }

    // Exécuter au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRelevanceHandlers);
    } else {
        // DOM déjà chargé, exécuter après un court délai pour laisser jQuery se charger
        setTimeout(initRelevanceHandlers, 100);
    }

    // Réexécuter après chargement AJAX (pjax)
    $(document).on('pjax:complete', initRelevanceHandlers);
    document.addEventListener('limesurvey:questionsLoaded', initRelevanceHandlers);

})();


// ============================================================================
// Contrat global LimeSurvey — exposition explicite sur window
// ============================================================================
// Ces fonctions sont aujourd'hui hissées au scope global parce que custom.js
// est chargé tel quel dans la page. Une fois custom.js bundlé par esbuild,
// le fichier est enveloppé dans une IIFE : les function top-level deviennent
// locales au bundle. On les réexpose ici pour que le core LimeSurvey (qui les
// appelle via `window.triggerEmRelevance()` ou équivalent) continue de les
// trouver. À préserver tant qu'un module `src/relevance/` n'a pas été extrait.
if (typeof window !== 'undefined') {
    window.triggerEmRelevance = triggerEmRelevance;
    window.triggerEmRelevanceQuestion = triggerEmRelevanceQuestion;
    window.triggerEmRelevanceGroup = triggerEmRelevanceGroup;
    window.triggerEmRelevanceSubQuestion = triggerEmRelevanceSubQuestion;
    window.updateLineClass = updateLineClass;
    window.updateRepeatHeading = updateRepeatHeading;
}
