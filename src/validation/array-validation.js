/**
 * Validation DSFR des questions tableau (array) et des questions simples.
 *
 * - handleArrayValidation : pour les questions .array-* en erreur, applique
 *   l'approche « compteur global » RGAA 11.10 + 11.11 (même logique que
 *   multiple-short-txt) : champs vides neutres, remplis vert discret, erreur
 *   de format uniquement sur les cases numériques mal saisies, message
 *   compteur global aria-live="polite".
 * - handleSimpleQuestionValidation : pour les questions simples (radio,
 *   select, date, etc.), marque la question en succès dès qu'une valeur
 *   est sélectionnée (pas d'erreur individuelle).
 */

import { isValidNumber } from '../core/dom-utils.js';
import { tMandatory } from '../core/i18n.js';
import { updateErrorSummary } from './error-summary.js';

export function handleArrayValidation() {
    // Trouver toutes les questions de type array avec erreur
    var arrayQuestions = document.querySelectorAll('.question-container.input-error[class*="array-"]');

    arrayQuestions.forEach(function(question) {
        // Éviter de dupliquer les listeners
        if (question.dataset.arrayValidationAttached) {
            return;
        }
        question.dataset.arrayValidationAttached = 'true';

        // Cacher les messages d'erreur legacy LimeSurvey
        var legacyMessages = question.querySelectorAll(
            '.ls-question-mandatory, .ls-question-mandatory-initial, ' +
            '.ls-question-mandatory-array, .ls-question-mandatory-arraycolumn'
        );
        legacyMessages.forEach(function(msg) {
            msg.style.display = 'none';
        });

        // Cacher le conteneur question-valid-container legacy
        var validContainer = question.querySelector('.question-valid-container');
        if (validContainer) {
            validContainer.style.display = 'none';
        }

        // Trouver tous les inputs dans le tableau
        var allInputs = question.querySelectorAll('table input[type="text"], table textarea, table select');

        // Retirer les classes d'erreur individuelles injectées par le template
        allInputs.forEach(function(input) {
            input.classList.remove('fr-input--error', 'error');
            var cell = input.closest('.fr-input-group');
            if (cell) {
                cell.classList.remove('fr-input-group--error');
            }
        });

        // Retirer les classes d'erreur sur les lignes
        var errorRows = question.querySelectorAll('tr.ls-mandatory-error');
        errorRows.forEach(function(row) {
            row.classList.remove('ls-mandatory-error');
            var th = row.querySelector('th.fr-text--error');
            if (th) th.classList.remove('fr-text--error');
        });

        // Retirer les classes d'erreur sur les cellules
        var errorCells = question.querySelectorAll('td.has-error');
        errorCells.forEach(function(td) {
            td.classList.remove('has-error');
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

        // Insérer le compteur après le tableau
        var tableWrapper = question.querySelector('.fr-table');
        if (tableWrapper) {
            tableWrapper.parentNode.insertBefore(counterContainer, tableWrapper.nextSibling);
        }

        // Fonction de mise à jour du compteur
        function updateCounter() {
            var totalFields = allInputs.length;
            var emptyCount = 0;

            allInputs.forEach(function(input) {
                var value = input.value ? input.value.trim() : '';
                var inputGroup = input.closest('.fr-input-group');

                if (value === '') {
                    // Champ vide — neutre
                    emptyCount++;
                    input.classList.remove('fr-input--error', 'fr-input--valid');
                    if (inputGroup) {
                        inputGroup.classList.remove('fr-input-group--error', 'fr-input-group--valid');
                    }
                } else {
                    var isNumberOnly = input.dataset.number === '1';
                    var isInvalidNumber = isNumberOnly && !isValidNumber(value);

                    if (isInvalidNumber) {
                        // Erreur de format → rouge individuel
                        emptyCount++;
                        input.classList.add('fr-input--error');
                        input.classList.remove('fr-input--valid');
                        if (inputGroup) {
                            inputGroup.classList.add('fr-input-group--error');
                            inputGroup.classList.remove('fr-input-group--valid');
                        }
                    } else {
                        // Champ rempli et valide → vert discret
                        input.classList.remove('fr-input--error');
                        input.classList.add('fr-input--valid');
                        if (inputGroup) {
                            inputGroup.classList.remove('fr-input-group--error');
                            inputGroup.classList.add('fr-input-group--valid');
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
        allInputs.forEach(function(input) {
            if (input.dataset.arrayInputListener) return;
            input.dataset.arrayInputListener = 'true';

            input.addEventListener('input', updateCounter);
        });
    });
}

export function handleSimpleQuestionValidation() {
    // Trouver toutes les questions en erreur qui ne sont pas des types complexes déjà gérés
    const simpleQuestions = document.querySelectorAll('.question-container.input-error');

    simpleQuestions.forEach(function(question) {
        // Ignorer les questions déjà gérées par d'autres fonctions
        if (question.classList.contains('numeric-multi') ||
            question.classList.contains('multiple-short-txt') ||
            question.dataset.simpleValidationAttached ||
            question.classList.toString().match(/array-/)) {
            return;
        }
        question.dataset.simpleValidationAttached = 'true';

        // Masquer tous les messages d'erreur LimeSurvey
        const allLsMessages = question.querySelectorAll('.ls-question-mandatory, .ls-question-mandatory-initial, .ls-question-mandatory-other');
        allLsMessages.forEach(function(msg) {
            msg.style.display = 'none';
        });

        // Chercher tous les contrôles de saisie
        const radios = question.querySelectorAll('input[type="radio"]');
        const checkboxes = question.querySelectorAll('input[type="checkbox"]');
        const selects = question.querySelectorAll('select');
        const dateInputs = question.querySelectorAll('input[type="date"], input[type="text"].date');

        // Fonction pour marquer la question comme valide
        function markQuestionValid() {
            question.classList.remove('input-error', 'fr-input-group--error');
            question.classList.add('input-valid');

            // Masquer tous les messages d'erreur LimeSurvey
            const allErrors = question.querySelectorAll('.ls-question-mandatory, .ls-question-mandatory-initial, .ls-question-mandatory-other');
            allErrors.forEach(function(error) {
                error.style.display = 'none';
            });

            // Retirer le message d'erreur DSFR s'il existe
            const dsfrError = question.querySelector('.fr-message--error');
            if (dsfrError) {
                dsfrError.remove();
            }

            // Mettre à jour le récapitulatif
            if (typeof updateErrorSummary === 'function') {
                setTimeout(updateErrorSummary, 50);
            }
        }

        // Attacher les listeners aux radios
        radios.forEach(function(radio) {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    markQuestionValid();
                }
            });
        });

        // Attacher les listeners aux checkboxes
        checkboxes.forEach(function(checkbox) {
            checkbox.addEventListener('change', function() {
                // Pour les checkboxes, vérifier qu'au moins une est cochée
                const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
                if (anyChecked) {
                    markQuestionValid();
                }
            });
        });

        // Attacher les listeners aux selects
        selects.forEach(function(select) {
            select.addEventListener('change', function() {
                if (this.value && this.value !== '' && this.value !== '-oth-') {
                    markQuestionValid();
                }
            });
        });

        // Attacher les listeners aux dates
        dateInputs.forEach(function(dateInput) {
            dateInput.addEventListener('change', function() {
                if (this.value && this.value.trim() !== '') {
                    markQuestionValid();
                }
            });
        });
    });
}
