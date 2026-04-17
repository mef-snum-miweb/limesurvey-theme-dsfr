/**
 * Liaison automatique des questions conditionnelles avec ARIA (RGAA 11.1 / 11.2).
 *
 * Le core LimeSurvey expose des questions conditionnelles via la classe
 * `.ls-irrelevant` / `.ls-hidden` (pas l'attribut `data-relevance`, qui n'est
 * jamais posé). Ce module :
 *
 * 1. Liste les parents d'une question conditionnelle en extrayant les codes
 *    (Q1, Q2_SQ001, ...) de l'expression `data-ls-relevance`.
 * 2. Crée un tooltip descriptif `<div class="dsfr-conditional-info">` caché en
 *    classe, stipulant de quelle(s) question(s) parente(s) la visibilité dépend.
 * 3. Relie le tooltip aux champs de la question via `aria-describedby`.
 * 4. Observe les changements de classe pour annoncer l'apparition/disparition
 *    de questions via une région `aria-live="polite"` dédiée.
 * 5. Exclut les inputs des questions masquées du tab order (RGAA 7.1) au
 *    chargement initial — le handler relevance:off prend le relais après.
 *
 * Les fonctions top-level (`extractQuestionCodes`, `findQuestionByCode`,
 * `getQuestionText`) sont pures et testables isolément ; les init fonctions
 * instancient des MutationObserver qui doivent n'être appelés qu'une fois.
 */

import { isQuestionHidden } from '../core/dom-utils.js';

export function extractQuestionCodes(expression) {
    if (!expression) return [];

    const questionCodes = [];

    // Pattern pour trouver les codes de questions (format : Q + chiffres + optionnel _SQ + chiffres)
    // Exemples: Q1, Q2_SQ001, Q123, etc.
    const regex = /\b(Q\d+(?:_SQ\d+)?)\./gi;

    let match;
    while ((match = regex.exec(expression)) !== null) {
        const code = match[1];
        if (!questionCodes.includes(code)) {
            questionCodes.push(code);
        }
    }

    return questionCodes;
}

/**
 * Trouve l'élément HTML d'une question par son code
 *
 * @param {string} questionCode - Code de la question (ex: Q1, Q2_SQ001)
 * @returns {HTMLElement|null} - Élément question ou null
 */
export function findQuestionByCode(questionCode) {
    // Chercher par attribut data-qcode ou id contenant le code
    let question = document.querySelector(`[data-qcode="${questionCode}"]`);

    if (!question) {
        // Chercher dans les IDs des questions (format: question + code)
        question = document.querySelector(`[id*="${questionCode}"]`);
    }

    return question;
}

/**
 * Récupère le texte de la question parente
 *
 * @param {HTMLElement} questionElement - Élément de la question
 * @returns {string} - Texte de la question ou numéro de question
 */
export function getQuestionText(questionElement) {
    // Chercher le titre de la question (h3 avec id ls-question-text-*)
    const questionTitle = questionElement.querySelector('[id^="ls-question-text-"]');

    if (questionTitle) {
        // Nettoyer le texte (enlever les balises HTML, garder seulement le texte)
        const text = questionTitle.textContent.trim();
        // Limiter à 50 caractères pour ne pas surcharger
        return text.length > 50 ? text.substring(0, 50) + '...' : text;
    }

    // Sinon, chercher le numéro de question
    const questionNumber = questionElement.querySelector('.fr-text--xs');
    if (questionNumber) {
        return questionNumber.textContent.trim();
    }

    return 'la question précédente';
}

/**
 * Crée un élément de description caché pour lecteurs d'écran
 *
 * @param {string} questionId - ID de la question conditionnelle
 * @param {Array<string>} parentQuestions - Textes des questions parentes
 * @returns {HTMLElement} - Élément div avec la description
 */
export function createConditionalDescription(questionId, parentQuestions) {
    const descId = `conditional-desc-${questionId}`;

    // Vérifier si l'élément existe déjà
    let descElement = document.getElementById(descId);
    if (descElement) {
        return descElement;
    }

    descElement = document.createElement('div');
    descElement.id = descId;
    descElement.className = 'fr-sr-only';
    descElement.setAttribute('role', 'note');

    // Créer le texte de description (cloner le tableau pour ne pas muter l'argument)
    let descText;
    const pq = [...parentQuestions];
    if (pq.length === 1) {
        descText = `Cette question dépend de votre réponse à ${pq[0]}.`;
    } else if (pq.length > 1) {
        const lastQuestion = pq.pop();
        descText = `Cette question dépend de vos réponses à ${pq.join(', ')} et ${lastQuestion}.`;
    } else {
        descText = 'Cette question est conditionnelle.';
    }

    descElement.textContent = descText;

    return descElement;
}

/**
 * Ajoute aria-describedby à tous les inputs/select/textarea de la question
 *
 * @param {HTMLElement} questionElement - Élément de la question
 * @param {string} descriptionId - ID de l'élément de description
 */
export function addAriaDescribedBy(questionElement, descriptionId) {
    // Trouver tous les champs de formulaire dans la question
    const formFields = questionElement.querySelectorAll('input, select, textarea');

    formFields.forEach(field => {
        const currentDescribedBy = field.getAttribute('aria-describedby') || '';

        // Ajouter l'ID de description seulement s'il n'existe pas déjà
        if (!currentDescribedBy.includes(descriptionId)) {
            const newDescribedBy = currentDescribedBy
                ? `${currentDescribedBy} ${descriptionId}`.trim()
                : descriptionId;

            field.setAttribute('aria-describedby', newDescribedBy);
        }
    });
}

/**
 * Traite une question conditionnelle pour ajouter les liaisons ARIA
 *
 * @param {HTMLElement} questionElement - Élément de la question
 */
export function processConditionalQuestion(questionElement) {
    // Récupérer l'expression de relevance
    const relevanceExpression = questionElement.getAttribute('data-relevance');
    if (!relevanceExpression) return;

    // Récupérer l'ID de la question (depuis l'attribut id ou générer)
    const questionId = questionElement.id || questionElement.querySelector('[id]')?.id || `q-${Date.now()}`;

    // Extraire les codes des questions parentes
    const parentQuestionCodes = extractQuestionCodes(relevanceExpression);
    if (parentQuestionCodes.length === 0) return;

    // Trouver les textes des questions parentes
    const parentQuestionTexts = [];
    parentQuestionCodes.forEach(code => {
        const parentElement = findQuestionByCode(code);
        if (parentElement) {
            const questionText = getQuestionText(parentElement);
            parentQuestionTexts.push(questionText);
        }
    });

    if (parentQuestionTexts.length === 0) return;

    // Créer l'élément de description
    const descElement = createConditionalDescription(questionId, parentQuestionTexts);

    // Insérer la description au début de la question
    questionElement.insertBefore(descElement, questionElement.firstChild);

    // Ajouter aria-describedby aux champs
    addAriaDescribedBy(questionElement, descElement.id);

}

/**
 * Initialise le système de liaison des questions conditionnelles.
 *
 * Détection via deux sources :
 * 1. data-relevance (si LimeSurvey le pose — rare selon les versions)
 * 2. .ls-irrelevant / .ls-hidden (toujours présentes sur les questions masquées)
 *
 * Pour les questions détectées par classe seule (sans data-relevance),
 * on utilise une description générique car l'expression de relevance
 * n'est pas disponible côté client.
 */
export function initConditionalQuestionsAria() {
    // Source 1 : questions avec data-relevance explicite
    var conditionalQuestions = document.querySelectorAll('.question-container[data-relevance]');

    // Source 2 : questions avec classes ls-irrelevant/ls-hidden (signal LimeSurvey)
    var hiddenQuestions = document.querySelectorAll('.question-container.ls-irrelevant, .question-container.ls-hidden');
    hiddenQuestions.forEach(function(q) {
        // Marquer comme conditionnelle si pas déjà traitée
        if (!q.hasAttribute('data-relevance') && !q.dataset.dsfrConditionalProcessed) {
            q.dataset.dsfrConditionalProcessed = 'true';
            var questionId = q.id || 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
            var descElement = createConditionalDescription(questionId, []);
            q.insertBefore(descElement, q.firstChild);
            addAriaDescribedBy(q, descElement.id);
        }
    });

    // Traiter les questions avec data-relevance (description enrichie)
    conditionalQuestions.forEach(function(questionElement) {
        if (questionElement.dataset.dsfrConditionalProcessed) return;
        questionElement.dataset.dsfrConditionalProcessed = 'true';
        try {
            processConditionalQuestion(questionElement);
        } catch (error) {
            // Silently ignore errors in production
        }
    });
}

/**
 * Observer pour détecter les nouvelles questions conditionnelles
 * ajoutées dynamiquement ou dont la classe change.
 */
export function setupConditionalQuestionsObserver() {
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Nouvelles questions ajoutées au DOM
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType !== Node.ELEMENT_NODE) return;

                var targets = [];
                if (node.classList && node.classList.contains('question-container')) {
                    targets.push(node);
                }
                var nested = node.querySelectorAll && node.querySelectorAll('.question-container');
                if (nested) {
                    nested.forEach(function(n) { targets.push(n); });
                }

                targets.forEach(function(q) {
                    if (q.dataset.dsfrConditionalProcessed) return;
                    if (q.hasAttribute('data-relevance') || q.classList.contains('ls-irrelevant') || q.classList.contains('ls-hidden')) {
                        q.dataset.dsfrConditionalProcessed = 'true';
                        if (q.hasAttribute('data-relevance')) {
                            try { processConditionalQuestion(q); } catch (e) {}
                        } else {
                            var qId = q.id || 'q-' + Date.now();
                            var desc = createConditionalDescription(qId, []);
                            q.insertBefore(desc, q.firstChild);
                            addAriaDescribedBy(q, desc.id);
                        }
                    }
                });
            });
        });
    });

    var surveyContainer = document.getElementById('limesurvey') || document.body;
    observer.observe(surveyContainer, {
        childList: true,
        subtree: true
    });
}

// === RGAA 7.1 — Notification lecteurs d'écran pour questions conditionnelles ===

/**
 * Observe les changements de visibilité des questions conditionnelles
 * et annonce l'apparition/disparition via une aria-live region.
 *
 * LimeSurvey masque/affiche les questions via style.display ou la classe
 * "ls-irrelevant"/"ls-hidden". Ce MutationObserver détecte ces changements
 * et met à jour une live region pour informer les lecteurs d'écran.
 */
export function initConditionalVisibilityNotifier() {
    // Créer la live region (une seule pour toute la page)
    var liveRegion = document.getElementById('conditional-live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'conditional-live-region';
        liveRegion.className = 'fr-sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(liveRegion);
    }

    // Récupérer le texte d'une question pour l'annonce
    function getQuestionLabel(questionEl) {
        var titleEl = questionEl.querySelector('[id^="ls-question-text-"]');
        if (titleEl) {
            var text = titleEl.textContent.trim();
            return text.length > 80 ? text.substring(0, 80) + '…' : text;
        }
        return 'Une question';
    }

    // Timer pour regrouper les annonces (éviter le spam)
    var announceTimer = null;
    var pendingAnnouncements = [];

    function scheduleAnnouncement(message) {
        pendingAnnouncements.push(message);
        if (announceTimer) clearTimeout(announceTimer);
        announceTimer = setTimeout(function() {
            liveRegion.textContent = pendingAnnouncements.join('. ');
            pendingAnnouncements = [];
            // Vider après un délai pour permettre une nouvelle annonce
            setTimeout(function() { liveRegion.textContent = ''; }, 3000);
        }, 300);
    }

    // Observer les changements de style et de classe sur TOUTES les questions.
    // On détecte les transitions ls-irrelevant/ls-hidden ↔ visible,
    // sans dépendre de l'attribut data-relevance (absent dans LS).
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            var el = mutation.target;
            if (!el.classList || !el.classList.contains('question-container')) return;

            if (mutation.type === 'attributes') {
                var isHidden = isQuestionHidden(el);
                var wasHidden = el.dataset.conditionalWasHidden === 'true';

                if (isHidden && !wasHidden) {
                    // Question vient d'être masquée
                    el.dataset.conditionalWasHidden = 'true';
                } else if (!isHidden && wasHidden) {
                    // Question vient d'apparaître
                    el.dataset.conditionalWasHidden = 'false';
                    var label = getQuestionLabel(el);
                    scheduleAnnouncement('Nouvelle question affichée : ' + label);
                }
            }
        });
    });

    // Observer toutes les questions de la page (pas seulement [data-relevance])
    var allQuestions = document.querySelectorAll('.question-container');
    allQuestions.forEach(function(q) {
        // Initialiser l'état courant
        q.dataset.conditionalWasHidden = isQuestionHidden(q) ? 'true' : 'false';

        observer.observe(q, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    });
}

/**
 * Exclut du tab order les inputs des questions déjà masquées au chargement.
 * Complète le handler relevance:off qui ne couvre que les transitions dynamiques.
 */
export function excludeIrrelevantInputsFromTabOrder() {
    var irrelevant = document.querySelectorAll('.question-container.ls-irrelevant, .question-container.ls-hidden');
    irrelevant.forEach(function(q) {
        q.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(function(field) {
            field.setAttribute('tabindex', '-1');
        });
    });
}
