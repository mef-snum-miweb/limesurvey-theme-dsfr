/**
 * Gestion des questions obligatoires à saisie multiple (multiple-short-txt).
 *
 * Approche « compteur global » pour respecter RGAA 11.10 + 11.11 :
 * - pas de rouge individuel sur les champs vides, seulement sur format invalide ;
 * - un message global dynamique annonçant combien de champs restent à compléter ;
 * - feedback vert discret sur les champs remplis valides ;
 * - `aria-live="polite"` pour annoncer la progression.
 *
 * Les messages i18n proviennent de `core/i18n.js` (clés `fields_remaining_*`,
 * `fields_all_required`, `field_valid`, `numeric_only`).
 */

import { tMandatory } from '../core/i18n.js';
import { updateErrorSummary } from './error-summary.js';

export function handleMultipleShortTextErrors() {
    var multipleQuestions = document.querySelectorAll('.question-container.multiple-short-txt');

    multipleQuestions.forEach(function(question) {
        // Ne traiter que les questions en erreur (après soumission)
        if (!question.classList.contains('input-error')) {
            return;
        }

        // Éviter de réattacher les listeners
        if (question.dataset.mandatoryCounterAttached) {
            return;
        }
        question.dataset.mandatoryCounterAttached = 'true';

        // Cacher les messages d'erreur legacy LimeSurvey
        var legacyMessages = question.querySelectorAll(
            '.ls-question-mandatory, .ls-question-mandatory-initial, .ls-question-mandatory-array'
        );
        legacyMessages.forEach(function(msg) {
            msg.style.display = 'none';
        });

        // Cacher le conteneur question-valid-container legacy
        var validContainer = question.querySelector('.question-valid-container');
        if (validContainer) {
            validContainer.style.display = 'none';
        }

        // Collecter tous les inputs visibles (exclure les lignes InputOnDemand cachées)
        var allItems = question.querySelectorAll('.answer-item:not(.d-none)');

        // Retirer les erreurs individuelles injectées par le template (server-side)
        allItems.forEach(function(item) {
            var inputGroup = item.querySelector('.fr-input-group');
            var messagesGroup = item.querySelector('.fr-messages-group');
            if (inputGroup) {
                inputGroup.classList.remove('fr-input-group--error');
            }
            if (messagesGroup) {
                var existingError = messagesGroup.querySelector('.fr-message--error');
                if (existingError) existingError.remove();
            }
            item.classList.remove('input-error', 'ls-error-mandatory', 'has-error');
        });

        // Créer le conteneur pour le message compteur global
        var counterContainer = document.createElement('div');
        counterContainer.className = 'fr-messages-group fr-mt-2w';
        counterContainer.setAttribute('aria-live', 'polite');
        counterContainer.id = 'mandatory-counter-' + (question.id || Math.random().toString(36).substring(2, 11));

        var counterMessage = document.createElement('p');
        counterMessage.className = 'fr-message fr-message--error';
        counterMessage.setAttribute('role', 'status');
        counterContainer.appendChild(counterMessage);

        // Insérer le compteur après la liste de réponses
        var answersList = question.querySelector('.ls-answers, .subquestion-list');

        if (answersList) {
            answersList.parentNode.insertBefore(counterContainer, answersList.nextSibling);
        } else {
            // Fallback: insérer en fin de question
            question.appendChild(counterContainer);
        }

        // Fonction de mise à jour du compteur
        function updateCounter() {
            var visibleItems = question.querySelectorAll('.answer-item:not(.d-none)');
            var totalFields = visibleItems.length;
            var emptyCount = 0;

            visibleItems.forEach(function(item) {
                var input = item.querySelector('input, textarea');
                if (!input) return;

                var value = input.value ? input.value.trim() : '';
                var inputGroup = item.querySelector('.fr-input-group');
                var messagesGroup = item.querySelector('.fr-messages-group');

                if (value === '') {
                    // Champ vide — neutre (pas de rouge)
                    emptyCount++;
                    if (inputGroup) {
                        inputGroup.classList.remove('fr-input-group--valid', 'fr-input-group--error');
                    }
                    if (messagesGroup) {
                        var fmtErr = messagesGroup.querySelector('.fr-message--error');
                        if (fmtErr) fmtErr.remove();
                        var fmtOk = messagesGroup.querySelector('.fr-message--valid');
                        if (fmtOk) fmtOk.remove();
                    }
                    input.classList.remove('fr-input--error', 'fr-input--valid', 'error');
                } else {
                    // Champ rempli — vérifier le format
                    var isNumberOnly = input.dataset.number === '1';
                    var isInvalidNumber = isNumberOnly && !/^-?\d*[.,]?\d+$/.test(value);

                    if (isInvalidNumber) {
                        // Erreur de format → rouge individuel (le seul cas)
                        emptyCount++; // compte comme non valide
                        if (inputGroup) {
                            inputGroup.classList.add('fr-input-group--error');
                            inputGroup.classList.remove('fr-input-group--valid');
                        }
                        input.classList.add('fr-input--error');
                        input.classList.remove('fr-input--valid');
                        // Message d'erreur de format sur le champ
                        if (messagesGroup && !messagesGroup.querySelector('.fr-message--error')) {
                            var fmtMsg = document.createElement('p');
                            fmtMsg.className = 'fr-message fr-message--error';
                            fmtMsg.textContent = tMandatory('numeric_only');
                            messagesGroup.appendChild(fmtMsg);
                        }
                    } else {
                        // Champ rempli et valide → vert discret
                        if (inputGroup) {
                            inputGroup.classList.remove('fr-input-group--error');
                            inputGroup.classList.add('fr-input-group--valid');
                        }
                        input.classList.remove('fr-input--error', 'error');
                        input.classList.add('fr-input--valid');
                        if (messagesGroup) {
                            var fmtErr2 = messagesGroup.querySelector('.fr-message--error');
                            if (fmtErr2) fmtErr2.remove();
                        }
                    }
                }
            });

            // Mettre à jour le message compteur global
            if (emptyCount === 0) {
                // Tous les champs sont remplis et valides → succès
                counterContainer.remove();
                question.classList.remove('input-error', 'fr-input-group--error');
                question.classList.add('input-valid');

                if (typeof updateErrorSummary === 'function') {
                    setTimeout(updateErrorSummary, 50);
                }
            } else {
                // Il reste des champs à remplir
                question.classList.add('input-error');
                question.classList.remove('input-valid');

                if (emptyCount === totalFields) {
                    counterMessage.textContent = tMandatory('fields_all_required', null, totalFields);
                } else if (emptyCount === 1) {
                    counterMessage.textContent = tMandatory('fields_remaining_singular');
                } else {
                    counterMessage.textContent = tMandatory('fields_remaining_plural', emptyCount, totalFields);
                }

                if (typeof updateErrorSummary === 'function') {
                    setTimeout(updateErrorSummary, 50);
                }
            }
        }

        // Initialiser le compteur
        updateCounter();

        // Attacher les listeners sur chaque input
        allItems.forEach(function(item) {
            var input = item.querySelector('input, textarea');
            if (!input || input.dataset.errorListenerAdded) return;
            input.dataset.errorListenerAdded = 'true';

            input.addEventListener('input', updateCounter);
        });
    });
}
