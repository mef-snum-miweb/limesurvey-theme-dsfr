/**
 * AccessibleRanking — enrichit les questions de classement (type R) avec :
 *
 * - Navigation clavier (Enter/Space pour saisir, Alt+Flèches pour réordonner)
 * - Boutons de contrôle visibles (Monter / Descendre / Retirer / Ajouter)
 * - Annonces aria-live pour les lecteurs d'écran (`#ranking-live-<qId>`)
 * - Numérotation dynamique des rangs (badge `<span class="ranking-rank-number">`)
 *
 * Ce module se greffe par-dessus le `RankingQuestion` vanilla de LimeSurvey
 * sans le modifier, via un MutationObserver qui réagit aux mutations DOM
 * effectuées par SortableJS.
 *
 * `_isInternalUpdate` est une variable d'état module (était scope IIFE dans
 * l'ancien code) : elle empêche le MutationObserver de se déclencher
 * récursivement pendant nos propres mises à jour DOM.
 *
 * Les init (DOMContentLoaded, pjax:complete, limesurvey:questionsLoaded)
 * sont désormais orchestrés depuis `src/index.js` via `core/runtime.js`.
 */

import { tRanking } from '../core/i18n.js';

// ---- État module partagé ----
let _isInternalUpdate = false;

// ---- Helpers ----

/**
 * Récupère le label textuel d'un item de ranking
 */
export function getItemLabel(item) {
    var textSpan = item.querySelector('.ranking-item-text');
    if (textSpan) return textSpan.textContent.trim();
    return item.dataset.label || item.textContent.trim();
}

/**
 * Annonce un message via la région aria-live
 */
export function announce(qId, message) {
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
export function syncHiddenSelects(qId) {
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
export function createControlButtons(item, qId) {
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
export function updateControlButtonStates(qId) {
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
export function createChoiceControlButtons(item, qId) {
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
export function updateChoiceControlButtonStates(qId) {
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
export function updateRankNumbers(qId) {
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
export function addItemToRank(item, qId) {
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
export function removeItemFromRank(item, qId) {
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
export function moveItemUp(item, qId) {
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
export function moveItemDown(item, qId) {
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
export function refreshAllItems(qId) {
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
export function bindKeyboardEvents(qId) {
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

export function observeRankingLists(qId) {
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
export function initAccessibleRanking(qId) {
    bindKeyboardEvents(qId);
    observeRankingLists(qId);
    // Initialisation initiale (les items pré-classés depuis la session)
    refreshAllItems(qId);
}

/**
 * Détecte et initialise toutes les questions ranking de la page
 */
export function initAllRankingQuestions() {
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
