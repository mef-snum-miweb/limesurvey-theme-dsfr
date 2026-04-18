/**
 * Transformation des erreurs LimeSurvey en messages DSFR.
 *
 * - `transformErrorsToDsfr()` : pour chaque `.question-container.input-error`,
 *   pose `fr-input-group--error`, copie le texte du message d'erreur LS
 *   (priorité mandatory si vide, sinon validation visible) dans un
 *   `<p class="fr-message fr-message--error">`, et cache le message natif.
 *   Pose systématiquement `aria-invalid="true"` sur les inputs concernés.
 *   Ignore les questions gérées par des handlers spécialisés
 *   (`.multiple-short-txt`, `array-*`).
 *
 * - `attachErrorRemovalListeners()` : pose un listener `input`/`change` qui,
 *   quand la saisie redevient valide, retire l'erreur DSFR, pose
 *   `aria-invalid="false"` et affiche un message de succès
 *   `fr-message--valid`. Distingue "vide" (mandatory) et "format invalide"
 *   (numeric-only). Fonction interne — non exportée.
 *
 * - `observeErrorChanges()` : observe `.question-container` pour relancer la
 *   transformation DSFR + le compteur MST dès que la classe `input-error`
 *   apparaît (validation LS côté client déclenche cette classe).
 */

import { handleMultipleShortTextErrors } from './mst-errors.js';
import { handleArrayValidation } from './array-validation.js';
import { updateErrorSummary } from './error-summary.js';

export function transformErrorsToDsfr() {

    // Trouver toutes les questions en erreur
    const errorQuestions = document.querySelectorAll('.question-container.input-error');

    // Passe systématique : poser aria-invalid sur TOUS les champs en erreur,
    // indépendamment du handler spécialisé qui gère le message d'erreur.
    errorQuestions.forEach(function(question) {
        question.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(function(field) {
            field.setAttribute('aria-invalid', 'true');
        });
    });

    errorQuestions.forEach(function(question) {
        // Ignorer les questions gérées par leurs propres handlers spécialisés
        if (question.classList.contains('multiple-short-txt')) {
            return;
        }
        if (question.className.match(/array-/)) {
            return;
        }

        // Trouver le fr-input-group dans cette question
        const inputGroup = question.querySelector('.fr-input-group');

        if (!inputGroup) {
            return;
        }

        // 3. Trouver le fr-messages-group
        const messagesGroup = inputGroup.querySelector('.fr-messages-group');

        if (!messagesGroup) {
            return;
        }

        // IMPORTANT : Vérifier si un message existe déjà pour éviter la duplication
        const existingError = messagesGroup.querySelector('.fr-message--error');
        if (existingError) {
            return; // Déjà traité
        }

        // 1. Ajouter la classe d'erreur DSFR
        inputGroup.classList.add('fr-input-group--error');

        // 2. Trouver le message d'erreur LimeSurvey
        // Ordre de priorité intelligent :
        // - Si champ vide : "obligatoire" prime
        // - Si champ rempli : validation prime
        let lsErrorContainer = null;
        let errorText = '';

        // Vérifier si le champ est vide
        const inputElement = question.querySelector('.fr-input, input, textarea, select');
        const isEmpty = !inputElement || !inputElement.value || inputElement.value.trim() === '';

        const mandatoryError = question.querySelector('.ls-question-mandatory');
        const validationErrors = question.querySelectorAll('.ls-em-tip, .em_num_answers, .ls-em-error');

        if (isEmpty && mandatoryError) {
            // Champ vide + obligatoire → message "obligatoire"
            lsErrorContainer = mandatoryError;
        } else {
            // Champ rempli → chercher les erreurs de validation
            for (let i = 0; i < validationErrors.length; i++) {
                const error = validationErrors[i];
                if (error.offsetParent !== null) { // Visible
                    lsErrorContainer = error;
                    break;
                }
            }
            // Fallback sur mandatory si pas de validation visible
            if (!lsErrorContainer && mandatoryError) {
                lsErrorContainer = mandatoryError;
            }
        }

        if (!lsErrorContainer) {
            return;
        }

        // Extraire le texte du message (sans les icônes)
        errorText = lsErrorContainer.textContent.trim();
        // Nettoyer les icônes et espaces multiples
        errorText = errorText.replace(/\s+/g, ' ').trim();

        if (!errorText) {
            return;
        }

        // 4. Créer le message d'erreur DSFR
        const errorMessage = document.createElement('p');
        errorMessage.className = 'fr-message fr-message--error';
        errorMessage.id = messagesGroup.id + '-error';
        errorMessage.textContent = errorText;
        errorMessage.setAttribute('role', 'alert');

        // Ajouter le message dans le messages-group
        messagesGroup.appendChild(errorMessage);

        // 5. Cacher le message LimeSurvey original
        const questionValidContainer = question.querySelector('.question-valid-container');
        if (questionValidContainer) {
            questionValidContainer.style.display = 'none';
        }


        // 6. Ajouter les listeners pour retirer l'erreur quand l'utilisateur corrige
        attachErrorRemovalListeners(question, inputGroup, messagesGroup);
    });
}

function attachErrorRemovalListeners(question, inputGroup, messagesGroup) {
    // Éviter de dupliquer les listeners
    if (question.dataset.dsfrErrorListeners) {
        return;
    }
    question.dataset.dsfrErrorListeners = 'true';

    // Fonction pour valider et mettre à jour l'état du champ
    function validateAndUpdateState(input) {
        const value = input.value ? input.value.trim() : '';
        const isNumberOnly = input.dataset.number === '1';

        // Vérifier si le champ est vide
        if (value === '') {
            // Champ vide → erreur obligatoire
            inputGroup.classList.add('fr-input-group--error');
            inputGroup.classList.remove('fr-input-group--valid');
            question.classList.add('input-error');
            question.classList.remove('input-valid');

            // Ajouter la classe d'erreur à l'input
            input.classList.add('fr-input--error');
            input.classList.remove('fr-input--valid');
            input.setAttribute('aria-invalid', 'true');

            // Retirer le message de succès s'il existe
            const validMessage = messagesGroup.querySelector('.fr-message--valid');
            if (validMessage) {
                validMessage.remove();
            }

            // Ajouter le message d'erreur si pas présent
            if (!messagesGroup.querySelector('.fr-message--error')) {
                const newErrorMessage = document.createElement('p');
                newErrorMessage.className = 'fr-message fr-message--error';
                newErrorMessage.id = messagesGroup.id + '-error';
                newErrorMessage.textContent = 'Ce champ est obligatoire';
                newErrorMessage.setAttribute('role', 'alert');
                messagesGroup.appendChild(newErrorMessage);
            }
            return;
        }

        // Vérifier la validation numérique si applicable
        if (isNumberOnly) {
            const isValidNumber = /^-?\d+([.,]\d*)?$/.test(value) || /^-?\d*[.,]\d+$/.test(value);

            if (!isValidNumber) {
                // Format invalide → erreur de validation
                inputGroup.classList.add('fr-input-group--error');
                inputGroup.classList.remove('fr-input-group--valid');
                question.classList.add('input-error');
                question.classList.remove('input-valid');

                // Ajouter la classe d'erreur à l'input
                input.classList.add('fr-input--error');
                input.classList.remove('fr-input--valid');
                input.setAttribute('aria-invalid', 'true');

                // Retirer le message de succès
                const validMessage = messagesGroup.querySelector('.fr-message--valid');
                if (validMessage) {
                    validMessage.remove();
                }

                // Ajouter/mettre à jour le message d'erreur
                let errorMsg = messagesGroup.querySelector('.fr-message--error');
                if (!errorMsg) {
                    errorMsg = document.createElement('p');
                    errorMsg.className = 'fr-message fr-message--error';
                    errorMsg.id = messagesGroup.id + '-error';
                    errorMsg.setAttribute('role', 'alert');
                    messagesGroup.appendChild(errorMsg);
                }
                errorMsg.textContent = "Ce champ n'accepte que des chiffres. Les caractères non numériques sont automatiquement supprimés.";

                setTimeout(updateErrorSummary, 50);
                return;
            }
        }

        // Champ valide → succès
        inputGroup.classList.remove('fr-input-group--error');
        question.classList.remove('input-error');

        // Retirer la classe d'erreur de l'input
        input.classList.remove('fr-input--error');
        input.removeAttribute('aria-invalid');

        // Retirer le message d'erreur et marquer qu'une erreur a été corrigée
        const errorMsg = messagesGroup.querySelector('.fr-message--error');
        if (errorMsg) {
            errorMsg.remove();
            // Marquer que cette question a eu une erreur (pour afficher le message de succès)
            question.dataset.hadError = 'true';
        }

        // Ajouter les classes et message de succès UNIQUEMENT si la question a eu une erreur auparavant
        if (question.dataset.hadError === 'true') {
            inputGroup.classList.add('fr-input-group--valid');
            question.classList.add('input-valid');
            input.classList.add('fr-input--valid');

            let validMessage = messagesGroup.querySelector('.fr-message--valid');
            if (!validMessage) {
                validMessage = document.createElement('p');
                validMessage.className = 'fr-message fr-message--valid';
                validMessage.id = messagesGroup.id + '-valid';
                messagesGroup.appendChild(validMessage);
            }
            validMessage.textContent = 'Merci d\'avoir répondu';
        }

        // Mettre à jour le récapitulatif d'erreurs
        setTimeout(updateErrorSummary, 50);
    }

    // Trouver tous les inputs/textareas/selects dans la question
    const inputs = question.querySelectorAll('.fr-input, input[type="text"], input[type="number"], textarea, select');

    inputs.forEach(function(input) {
        // Valider en temps réel à chaque frappe
        input.addEventListener('input', function() {
            validateAndUpdateState(input);
        });
        input.addEventListener('change', function() {
            validateAndUpdateState(input);
        });
    });

    // Pour les radio/checkbox - convertir en succès immédiatement
    const radiosCheckboxes = question.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    radiosCheckboxes.forEach(function(input) {
        input.addEventListener('change', function() {
            // Pour radio/checkbox, retirer les erreurs
            inputGroup.classList.remove('fr-input-group--error');
            question.classList.remove('input-error');

            // Retirer aria-invalid de tous les champs de la question
            question.querySelectorAll('[aria-invalid]').forEach(function(f) {
                f.removeAttribute('aria-invalid');
            });

            // Retirer le message d'erreur et marquer qu'une erreur a été corrigée
            const errorMsg = messagesGroup.querySelector('.fr-message--error');
            if (errorMsg) {
                errorMsg.remove();
                // Marquer que cette question a eu une erreur
                question.dataset.hadError = 'true';
            }

            // Ajouter les classes et message de succès UNIQUEMENT si la question a eu une erreur auparavant
            if (question.dataset.hadError === 'true') {
                inputGroup.classList.add('fr-input-group--valid');
                question.classList.add('input-valid');

                let validMessage = messagesGroup.querySelector('.fr-message--valid');
                if (!validMessage) {
                    validMessage = document.createElement('p');
                    validMessage.className = 'fr-message fr-message--valid';
                    validMessage.id = messagesGroup.id + '-valid';
                    messagesGroup.appendChild(validMessage);
                }
                validMessage.textContent = 'Merci d\'avoir répondu';
            }

            setTimeout(updateErrorSummary, 50);
        }, { once: true });
    });
}

export function observeErrorChanges() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Si un élément a été modifié et a maintenant la classe input-error
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('question-container') && target.classList.contains('input-error')) {
                    setTimeout(function() {
                        transformErrorsToDsfr();
                        handleMultipleShortTextErrors();
                        handleArrayValidation();
                    }, 100);
                }
            }

            // Si des éléments ont été ajoutés (nouveau contenu AJAX)
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('input-error')) {
                        setTimeout(function() {
                            transformErrorsToDsfr();
                            handleMultipleShortTextErrors();
                            handleArrayValidation();
                        }, 100);
                    }
                });
            }
        });
    });

    // Observer le body pour les changements
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true
    });

}
