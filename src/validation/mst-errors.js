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

        // Collecter TOUTES les lignes, y compris les lignes InputOnDemand
        // encore masquées (.d-none) : le serveur valide chaque ligne
        // potentielle, masquée ou non — les ignorer faisait passer la
        // question au vert alors que la soumission restait bloquée.
        var allItems = question.querySelectorAll('.answer-item');

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
            var allRows = question.querySelectorAll('.answer-item');
            var totalFields = allRows.length;
            var emptyCount = 0;
            var hiddenEmptyCount = 0;

            allRows.forEach(function(item) {
                var input = item.querySelector('input, textarea');
                if (!input) return;

                var value = input.value ? input.value.trim() : '';

                // Ligne InputOnDemand encore masquée : compte comme manquante
                // si vide, mais pas de stylage (elle n'est pas à l'écran).
                if (item.classList.contains('d-none')) {
                    if (value === '') {
                        emptyCount++;
                        hiddenEmptyCount++;
                    }
                    return;
                }

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
                // Ré-insérer le compteur s'il avait été retiré (champ re-vidé
                // après que tout était rempli) — sinon question en erreur sans
                // message visible ni annonce SR. Même pattern que
                // handleChoiceArray (array-validation.js).
                if (!counterContainer.isConnected) {
                    if (answersList) {
                        answersList.parentNode.insertBefore(counterContainer, answersList.nextSibling);
                    } else {
                        question.appendChild(counterContainer);
                    }
                }
                // Il reste des champs à remplir
                question.classList.add('input-error');
                question.classList.remove('input-valid');

                if (hiddenEmptyCount > 0) {
                    // Des lignes obligatoires sont encore masquées : sans ce
                    // message dédié, l'utilisateur ne peut pas comprendre
                    // pourquoi la page refuse de passer (les champs visibles
                    // sont remplis, mais le serveur attend chaque ligne).
                    counterMessage.textContent = tMandatory('iod_add_lines', emptyCount, totalFields);
                } else if (emptyCount === totalFields) {
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

        // Attacher les listeners sur chaque input (lignes masquées comprises :
        // elles seront révélées par « Ajouter une ligne » sans ré-init).
        allItems.forEach(function(item) {
            var input = item.querySelector('input, textarea');
            if (!input || input.dataset.errorListenerAdded) return;
            input.dataset.errorListenerAdded = 'true';

            input.addEventListener('input', updateCounter);
        });

        // « Ajouter une ligne » révèle une ligne en retirant d-none — son
        // handler (input-on-demand.js) coupe la propagation du clic
        // (stopImmediatePropagation), on observe donc la liste plutôt que
        // d'écouter le bouton. Garde sur la transition d-none UNIQUEMENT :
        // updateCounter modifie lui-même des classes dans la liste (--valid,
        // --error), réagir à tout changement de class bouclerait à l'infini.
        var iodList = question.querySelector('.selector--inputondemand-list');
        if (iodList) {
            new MutationObserver(function(mutations) {
                var revealed = mutations.some(function(m) {
                    return typeof m.oldValue === 'string' &&
                        m.oldValue.indexOf('d-none') !== -1 &&
                        m.target.classList &&
                        !m.target.classList.contains('d-none');
                });
                if (revealed) {
                    updateCounter();
                }
            }).observe(iodList, {
                attributes: true,
                attributeFilter: ['class'],
                attributeOldValue: true,
                subtree: true,
            });
        }
    });
}
