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


/* ============================================
   RANKING QUESTIONS - Accessibilité clavier et lecteurs d'écran
   ============================================ */

(function() {
    'use strict';

    /**
     * AccessibleRanking
     *
     * Enrichit les questions de classement (Type R) avec :
     * - Navigation clavier (Enter/Space pour déplacer, Alt+Flèches pour réordonner)
     * - Boutons de contrôle visibles (Monter / Descendre / Retirer)
     * - Annonces aria-live pour les lecteurs d'écran
     * - Numérotation des rangs
     *
     * Ce module se greffe par-dessus le vanilla RankingQuestion de LimeSurvey
     * sans le modifier, en utilisant un MutationObserver pour réagir aux
     * changements DOM effectués par SortableJS.
     */

    // ---- Helpers ----

    /**
     * Récupère le label textuel d'un item de ranking
     */
    function getItemLabel(item) {
        var textSpan = item.querySelector('.ranking-item-text');
        if (textSpan) return textSpan.textContent.trim();
        return item.dataset.label || item.textContent.trim();
    }

    /**
     * Annonce un message via la région aria-live
     */
    function announce(qId, message) {
        var liveRegion = document.getElementById('ranking-live-' + qId);
        if (!liveRegion) return;
        // Vider puis remplir pour forcer l'annonce même si le texte est identique
        liveRegion.textContent = '';
        setTimeout(function() {
            liveRegion.textContent = message;
        }, 50);
    }

    /**
     * Déclenche la mise à jour des selects cachés via le mécanisme vanilla.
     * Le vanilla ranking.js écoute les événements onSort de Sortable
     * et met à jour les selects via updateDragDropRank().
     * On simule un changement en déclenchant l'événement change sur les selects.
     */
    function syncHiddenSelects(qId) {
        var questionEl = document.getElementById('question' + qId);
        if (!questionEl) return;

        var rankedItems = document.querySelectorAll('#sortable-rank-' + qId + ' li:not(.ls-remove):not(.d-none)');
        var selects = questionEl.querySelectorAll('.select-list .select-item select');

        // Réinitialiser tous les selects
        selects.forEach(function(select) {
            select.value = '';
        });

        // Remplir dans l'ordre du classement
        rankedItems.forEach(function(item, index) {
            if (index < selects.length) {
                var oldVal = selects[index].value;
                selects[index].value = item.dataset.value;
                if (oldVal !== item.dataset.value) {
                    // Déclencher change via jQuery avec source:'dragdrop' pour que :
                    // 1. L'expression manager de LimeSurvey se mette à jour
                    // 2. Le vanilla ranking.js ne relance PAS loadDragDropRank()
                    //    (il vérifie data.source != 'dragdrop' avant de le faire)
                    // Important : ne PAS utiliser dispatchEvent natif car jQuery 1.x/2.x
                    // pourrait l'intercepter sans le data.source, déclenchant loadDragDropRank.
                    if (typeof $ !== 'undefined') {
                        $(selects[index]).trigger('change', { source: 'dragdrop' });
                    }
                }
            }
        });

        // Mettre à jour les champs de relevance
        var rankingName = questionEl.querySelector('.ranking-question-dsfr')
            ? questionEl.querySelector('.ranking-question-dsfr').dataset.rankingName
            : null;
        if (!rankingName) {
            // Chercher dans le conteneur lui-même
            var container = questionEl.querySelector('[data-ranking-name]');
            if (container) rankingName = container.dataset.rankingName;
        }
        if (rankingName) {
            var relevanceInputs = document.querySelectorAll('[id^="relevance' + rankingName + '"]');
            relevanceInputs.forEach(function(input) {
                input.value = '0';
            });
            rankedItems.forEach(function(item, index) {
                var relInput = document.getElementById('relevance' + rankingName + (index + 1));
                if (relInput) {
                    relInput.value = '1';
                }
            });
        }
    }

    // ---- Boutons de contrôle ----

    /**
     * Crée les boutons Monter / Descendre / Retirer pour un item classé
     */
    function createControlButtons(item, qId) {
        // Ne pas ajouter de boutons en double
        if (item.querySelector('.ranking-controls')) return;

        var label = getItemLabel(item);
        var controls = document.createElement('span');
        controls.className = 'ranking-controls';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', tRanking('ranking_actions_for', label));

        // Bouton Monter
        var btnUp = document.createElement('button');
        btnUp.type = 'button';
        btnUp.className = 'fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-up-line ranking-btn-up';
        btnUp.setAttribute('aria-label', tRanking('ranking_up_aria', label));
        btnUp.setAttribute('title', tRanking('ranking_up'));
        btnUp.textContent = tRanking('ranking_up');

        // Bouton Descendre
        var btnDown = document.createElement('button');
        btnDown.type = 'button';
        btnDown.className = 'fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-down-line ranking-btn-down';
        btnDown.setAttribute('aria-label', tRanking('ranking_down_aria', label));
        btnDown.setAttribute('title', tRanking('ranking_down'));
        btnDown.textContent = tRanking('ranking_down');

        // Bouton Retirer
        var btnRemove = document.createElement('button');
        btnRemove.type = 'button';
        btnRemove.className = 'fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-close-line ranking-btn-remove';
        btnRemove.setAttribute('aria-label', tRanking('ranking_remove_aria', label));
        btnRemove.setAttribute('title', tRanking('ranking_remove'));
        btnRemove.textContent = tRanking('ranking_remove');

        controls.appendChild(btnUp);
        controls.appendChild(btnDown);
        controls.appendChild(btnRemove);
        item.appendChild(controls);

        // ---- Event handlers pour les boutons ----

        btnUp.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            moveItemUp(item, qId);
        });

        btnDown.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            moveItemDown(item, qId);
        });

        btnRemove.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            removeItemFromRank(item, qId);
        });
    }

    /**
     * Met à jour l'état enabled/disabled des boutons Monter/Descendre
     */
    function updateControlButtonStates(qId) {
        var rankList = document.getElementById('sortable-rank-' + qId);
        if (!rankList) return;

        var items = rankList.querySelectorAll('li:not(.ls-remove):not(.d-none)');
        items.forEach(function(item, index) {
            var btnUp = item.querySelector('.ranking-btn-up');
            var btnDown = item.querySelector('.ranking-btn-down');
            if (btnUp) {
                btnUp.disabled = (index === 0);
            }
            if (btnDown) {
                btnDown.disabled = (index === items.length - 1);
            }
        });
    }

    /**
     * RGAA 13.1 — Alternative au drag-and-drop pour la colonne "choix disponibles".
     *
     * Crée un bouton "Ajouter au classement" (flèche droite) sur chaque item de la
     * choice list. Le bouton déclenche addItemToRank(item, qId), strictement
     * équivalent à la touche Entrée du clavier.
     */
    function createChoiceControlButtons(item, qId) {
        // Ne pas ajouter de bouton en double
        if (item.querySelector('.ranking-choice-controls')) return;

        var label = getItemLabel(item);
        var controls = document.createElement('span');
        controls.className = 'ranking-choice-controls';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', tRanking('ranking_actions_for', label));

        var btnAdd = document.createElement('button');
        btnAdd.type = 'button';
        btnAdd.className = 'fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-right-line ranking-btn-add';
        btnAdd.setAttribute('aria-label', tRanking('ranking_add_aria', label));
        btnAdd.setAttribute('title', tRanking('ranking_add'));
        btnAdd.textContent = tRanking('ranking_add');

        controls.appendChild(btnAdd);
        item.appendChild(controls);

        btnAdd.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            addItemToRank(item, qId);
        });
    }

    /**
     * Désactive les boutons "Ajouter" de la choice list lorsque le classement
     * a atteint sa limite max_answers (si définie).
     */
    function updateChoiceControlButtonStates(qId) {
        var container = document.querySelector('[data-ranking-qid="' + qId + '"]');
        if (!container) return;
        var maxAnswers = parseInt(container.dataset.maxAnswers) || 0;
        var rankList = document.getElementById('sortable-rank-' + qId);
        var choiceList = document.getElementById('sortable-choice-' + qId);
        if (!rankList || !choiceList) return;

        var rankedCount = rankList.querySelectorAll('li:not(.ls-remove):not(.d-none)').length;
        var isFull = (maxAnswers > 0 && rankedCount >= maxAnswers);

        choiceList.querySelectorAll('.ranking-btn-add').forEach(function(btn) {
            btn.disabled = isFull;
        });
    }

    // ---- Numérotation des rangs ----

    /**
     * Ajoute ou met à jour le badge de numérotation sur les items classés
     */
    function updateRankNumbers(qId) {
        var rankList = document.getElementById('sortable-rank-' + qId);
        if (!rankList) return;

        var items = rankList.querySelectorAll('li:not(.ls-remove):not(.d-none)');
        var total = items.length;

        items.forEach(function(item, index) {
            var rank = index + 1;
            var badge = item.querySelector('.ranking-rank-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'ranking-rank-badge';
                badge.setAttribute('aria-hidden', 'true');
                item.insertBefore(badge, item.firstChild);
            }
            badge.textContent = '#' + rank;

            // Mettre à jour l'aria-label de l'item
            var label = getItemLabel(item);
            item.setAttribute('aria-label', label + ' - Rang ' + rank + ' sur ' + total + '. Entrée pour retirer, Alt+Flèches pour réordonner');
        });

        // Retirer les badges des items dans la liste des choix
        var choiceList = document.getElementById('sortable-choice-' + qId);
        if (choiceList) {
            choiceList.querySelectorAll('.ranking-rank-badge').forEach(function(badge) {
                badge.remove();
            });
            // Remettre l'aria-label initial pour les items dans la choice list
            choiceList.querySelectorAll('li:not(.ls-remove):not(.d-none)').forEach(function(item) {
                var label = getItemLabel(item);
                item.setAttribute('aria-label', label + ' - Appuyez sur Entrée pour ajouter au classement');
                item.setAttribute('aria-selected', 'false');
            });
        }

        // Marquer aria-selected sur les items classés
        items.forEach(function(item) {
            item.setAttribute('aria-selected', 'true');
        });
    }

    // ---- Actions de déplacement ----

    /**
     * Déplace un item de la choice list vers la ranked list
     */
    function addItemToRank(item, qId) {
        var maxAnswers = parseInt(document.querySelector('[data-ranking-qid="' + qId + '"]').dataset.maxAnswers) || 0;
        var rankList = document.getElementById('sortable-rank-' + qId);
        var currentCount = rankList.querySelectorAll('li:not(.ls-remove):not(.d-none)').length;

        if (maxAnswers > 0 && currentCount >= maxAnswers) {
            announce(qId, 'Nombre maximum de réponses atteint');
            return;
        }

        rankList.appendChild(item);

        var label = getItemLabel(item);
        var newPos = rankList.querySelectorAll('li:not(.ls-remove):not(.d-none)').length;
        announce(qId, label + ' ajouté au classement en position ' + newPos);

        syncHiddenSelects(qId);
        refreshAllItems(qId);

        // Focus sur l'item suivant dans la choice list ou sur l'item déplacé
        var choiceList = document.getElementById('sortable-choice-' + qId);
        var nextItem = choiceList.querySelector('li:not(.ls-remove):not(.d-none):not(.ls-irrelevant)');
        if (nextItem) {
            nextItem.focus();
        } else {
            item.focus();
        }
    }

    /**
     * Retire un item de la ranked list et le remet dans la choice list
     */
    function removeItemFromRank(item, qId) {
        var choiceList = document.getElementById('sortable-choice-' + qId);
        var rankList = document.getElementById('sortable-rank-' + qId);

        // Trouver l'item suivant dans le classement avant de retirer
        var items = Array.from(rankList.querySelectorAll('li:not(.ls-remove):not(.d-none)'));
        var currentIndex = items.indexOf(item);
        var nextFocusItem = items[currentIndex + 1] || items[currentIndex - 1];

        // Remettre l'item dans la choice list.
        // Note : le vanilla ranking.js supprime les .ls-remove au init (ligne 70),
        // donc on ne peut pas s'en servir comme repère. On fait appendChild.
        choiceList.appendChild(item);

        var label = getItemLabel(item);
        announce(qId, label + ' retiré du classement');

        syncHiddenSelects(qId);
        refreshAllItems(qId);

        // Focus sur l'item suivant dans le classement ou sur l'item retiré
        if (nextFocusItem) {
            nextFocusItem.focus();
        } else {
            item.focus();
        }
    }

    /**
     * Monte un item d'un rang dans la ranked list
     */
    function moveItemUp(item, qId) {
        var prev = item.previousElementSibling;
        while (prev && (prev.classList.contains('ls-remove') || prev.classList.contains('d-none'))) {
            prev = prev.previousElementSibling;
        }
        if (!prev) return;

        item.parentNode.insertBefore(item, prev);

        var label = getItemLabel(item);
        var items = item.parentNode.querySelectorAll('li:not(.ls-remove):not(.d-none)');
        var newPos = Array.from(items).indexOf(item) + 1;
        announce(qId, label + ' déplacé en position ' + newPos);

        syncHiddenSelects(qId);
        refreshAllItems(qId);
        item.focus();
    }

    /**
     * Descend un item d'un rang dans la ranked list
     */
    function moveItemDown(item, qId) {
        var next = item.nextElementSibling;
        while (next && (next.classList.contains('ls-remove') || next.classList.contains('d-none'))) {
            next = next.nextElementSibling;
        }
        if (!next) return;

        // insertBefore le suivant du suivant (= insérer après next)
        item.parentNode.insertBefore(item, next.nextSibling);

        var label = getItemLabel(item);
        var items = item.parentNode.querySelectorAll('li:not(.ls-remove):not(.d-none)');
        var newPos = Array.from(items).indexOf(item) + 1;
        announce(qId, label + ' déplacé en position ' + newPos);

        syncHiddenSelects(qId);
        refreshAllItems(qId);
        item.focus();
    }

    // ---- Mise à jour globale ----

    /**
     * Rafraîchit les boutons, numéros et états de tous les items d'une question.
     * Protégé par _isInternalUpdate pour éviter les boucles MutationObserver.
     */
    function refreshAllItems(qId) {
        var rankList = document.getElementById('sortable-rank-' + qId);
        if (!rankList) return;

        _isInternalUpdate = true;

        try {
            // Retirer les éventuels boutons "Ajouter au classement" laissés sur un item
            // qui vient de passer de la choice list à la ranked list (drag-and-drop ou clavier)
            rankList.querySelectorAll('.ranking-choice-controls').forEach(function(ctrl) {
                ctrl.remove();
            });

            // Ajouter les boutons de contrôle Monter/Descendre/Retirer sur les items classés
            rankList.querySelectorAll('li:not(.ls-remove):not(.d-none)').forEach(function(item) {
                createControlButtons(item, qId);
            });

            var choiceList = document.getElementById('sortable-choice-' + qId);
            if (choiceList) {
                // Retirer les boutons de contrôle "classés" des items revenus dans la choice list
                // (un item retiré du classement conserve son wrapper .ranking-controls jusqu'ici)
                choiceList.querySelectorAll('.ranking-controls').forEach(function(ctrl) {
                    ctrl.remove();
                });
                // RGAA 13.1 — alternative drag-and-drop : ajouter le bouton "Ajouter
                // au classement" sur chaque item de la choice list
                choiceList.querySelectorAll('li:not(.ls-remove):not(.d-none)').forEach(function(item) {
                    createChoiceControlButtons(item, qId);
                });
            }

            updateControlButtonStates(qId);
            updateChoiceControlButtonStates(qId);
            updateRankNumbers(qId);
        } finally {
            _isInternalUpdate = false;
        }
    }

    // ---- Navigation clavier ----

    /**
     * Bind les événements clavier sur une question de ranking
     */
    function bindKeyboardEvents(qId) {
        var choiceList = document.getElementById('sortable-choice-' + qId);
        var rankList = document.getElementById('sortable-rank-' + qId);

        if (!choiceList || !rankList) return;

        // Enter/Space dans la choice list → ajouter au classement
        choiceList.addEventListener('keydown', function(e) {
            var item = e.target.closest('li:not(.ls-remove):not(.d-none)');
            if (!item) return;

            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                addItemToRank(item, qId);
            }
        });

        // Clavier dans la ranked list
        rankList.addEventListener('keydown', function(e) {
            var item = e.target.closest('li:not(.ls-remove):not(.d-none)');
            if (!item) return;

            // Ne pas interférer si le focus est sur un bouton
            if (e.target.tagName === 'BUTTON') return;

            if (e.key === 'Enter' || e.key === ' ') {
                // Enter/Space → retirer du classement
                e.preventDefault();
                removeItemFromRank(item, qId);
            } else if (e.key === 'ArrowUp' && e.altKey) {
                // Alt+↑ → monter
                e.preventDefault();
                moveItemUp(item, qId);
            } else if (e.key === 'ArrowDown' && e.altKey) {
                // Alt+↓ → descendre
                e.preventDefault();
                moveItemDown(item, qId);
            }
        });
    }

    // ---- Observation DOM ----

    /**
     * Observe les mutations sur les listes pour réagir aux déplacements
     * effectués par le drag-and-drop vanilla (SortableJS).
     *
     * On utilise un flag _isInternalUpdate pour éviter les boucles infinies :
     * nos propres modifications DOM (injection de boutons, badges) déclencheraient
     * le MutationObserver qui rappellerait refreshAllItems, etc.
     */
    var _isInternalUpdate = false;

    function observeRankingLists(qId) {
        var rankList = document.getElementById('sortable-rank-' + qId);
        var choiceList = document.getElementById('sortable-choice-' + qId);

        if (!rankList || !choiceList) return;

        var observer = new MutationObserver(function(mutations) {
            // Ignorer les mutations déclenchées par nos propres mises à jour
            if (_isInternalUpdate) return;

            var hasChildChange = mutations.some(function(m) {
                return m.type === 'childList' && (m.addedNodes.length > 0 || m.removedNodes.length > 0);
            });
            if (hasChildChange) {
                refreshAllItems(qId);
            }
        });

        observer.observe(rankList, { childList: true });
        observer.observe(choiceList, { childList: true });
    }

    // ---- Initialisation ----

    /**
     * Initialise le module AccessibleRanking pour une question donnée
     */
    function initAccessibleRanking(qId) {
        bindKeyboardEvents(qId);
        observeRankingLists(qId);
        // Initialisation initiale (les items pré-classés depuis la session)
        refreshAllItems(qId);
    }

    /**
     * Détecte et initialise toutes les questions ranking de la page
     */
    function initAllRankingQuestions() {
        var questions = document.querySelectorAll('.ranking-question-dsfr[data-ranking-qid]');
        questions.forEach(function(q) {
            var qId = q.dataset.rankingQid;
            if (qId && !q.dataset.accessibleRankingInit) {
                q.dataset.accessibleRankingInit = 'true';
                // Laisser le temps au vanilla ranking.js de s'initialiser d'abord
                setTimeout(function() {
                    initAccessibleRanking(qId);
                }, 200);
            }
        });
    }

    // Lancer au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllRankingQuestions);
    } else {
        initAllRankingQuestions();
    }

    // Réexécuter après navigation AJAX (pjax) et chargement de questions
    document.addEventListener('limesurvey:questionsLoaded', function() {
        setTimeout(initAllRankingQuestions, 300);
    });
    if (typeof $ !== 'undefined') {
        $(document).on('pjax:complete', function() {
            setTimeout(initAllRankingQuestions, 300);
        });
    }

})();

/* ============================================
   RGAA 12.9 — Liste radio : placer "Sans réponse" en tête de liste
   ============================================

   Dans une question de type "Liste (Boutons radio)" avec option "Autre" +
   "Sans réponse", le core LimeSurvey rend les options dans cet ordre :
     1. options standards
     2. "Autre :" + champ texte
     3. "Sans réponse"

   Problème RGAA 12.9 : en navigation clavier (flèches Haut/Bas dans un
   radiogroup), l'utilisateur qui souhaite choisir "Sans réponse" doit
   traverser tout le radiogroup, y compris "Autre" dont le handler JS
   faisait un .focus() auto sur le champ texte — ce qui cassait la
   navigation (cf. fix dans answer_row_other.twig où le .focus() a été
   supprimé).

   Bonus UX : placer "Sans réponse" en première position rend le refus
   immédiatement accessible et garde le bloc "Autre + champ texte"
   cohérent en fin de liste, avec le champ directement sous son radio
   (relation visuelle et programmatique claire, le radio sert de label
   conceptuel au champ).

   Cet IIFE repositionne le .fr-fieldset__element contenant le radio
   "Sans réponse" (value="") en première position du .fr-fieldset__content.
   Les questions sans option "Sans réponse" ne sont pas modifiées.
*/

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
