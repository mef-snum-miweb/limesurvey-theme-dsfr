/**
 * Validation DSFR des champs et questions numériques.
 *
 * - initNumericValidation : attache un listener input sur chaque champ
 *   data-number="1" pour afficher une erreur en temps réel quand l'utilisateur
 *   saisit du texte (avant que LimeSurvey ne l'efface).
 * - handleNumericMultiValidation : pour les questions .numeric-multi,
 *   transforme le message global d'erreur LS + pose la validation live
 *   champ par champ (fr-input-group, fr-messages-group, fr-message--valid).
 * - observeNumericMultiSumValidation : observe le totalvalue_* des
 *   numeric-multi pour détecter quand Expression Manager bascule la classe
 *   ls-em-error (somme hors bornes) et synchronise les messages DSFR.
 */

import { isValidNumber } from '../core/dom-utils.js';
import { updateErrorSummary } from './error-summary.js';

export function initNumericValidation() {
    const numericInputs = document.querySelectorAll('input[data-number="1"]');

    numericInputs.forEach(function(input) {
        // Éviter de dupliquer les listeners
        if (input.dataset.numericValidationAttached) {
            return;
        }
        input.dataset.numericValidationAttached = 'true';

        // Validation sur input (en temps réel)
        input.addEventListener('input', function() {
            const value = this.value.trim();
            const question = this.closest('.question-container');
            const inputGroup = this.closest('.fr-input-group');

            if (!question || !inputGroup) return;

            const messagesGroup = inputGroup.querySelector('.fr-messages-group');
            if (!messagesGroup) return;

            // Si vide, retirer tous les messages (la validation obligatoire gérera)
            if (value === '') {
                // Retirer les messages d'erreur de validation
                const errorMessage = messagesGroup.querySelector('.fr-message--error');
                if (errorMessage) {
                    errorMessage.remove();
                }
                // Retirer les messages de succès
                const validMessage = messagesGroup.querySelector('.fr-message--valid');
                if (validMessage) {
                    validMessage.remove();
                }
                // Retirer les classes de validation
                inputGroup.classList.remove('fr-input-group--error', 'fr-input-group--valid');
                return;
            }

            // Vérifier si c'est un nombre valide
            // Accepter les nombres avec virgule ou point, mais pas juste un signe ou un séparateur
            const isValidNumber = /^-?\d+([.,]\d*)?$/.test(value) || /^-?\d*[.,]\d+$/.test(value);

            if (!isValidNumber) {
                // Format invalide → Erreur de validation
                question.classList.add('input-error');
                inputGroup.classList.add('fr-input-group--error');
                inputGroup.classList.remove('fr-input-group--valid');

                // Ajouter la classe d'erreur à l'input
                this.classList.add('fr-input--error');
                this.classList.remove('fr-input--valid');

                // Retirer le message de succès s'il existe
                const validMessage = messagesGroup.querySelector('.fr-message--valid');
                if (validMessage) {
                    validMessage.remove();
                }

                // Ajouter/mettre à jour le message d'erreur
                let errorMessage = messagesGroup.querySelector('.fr-message--error');
                if (!errorMessage) {
                    errorMessage = document.createElement('p');
                    errorMessage.className = 'fr-message fr-message--error';
                    errorMessage.id = messagesGroup.id + '-error';
                    errorMessage.setAttribute('role', 'alert');
                    messagesGroup.appendChild(errorMessage);
                }
                errorMessage.textContent = "Ce champ n'accepte que des chiffres. Les caractères non numériques sont automatiquement supprimés.";

            } else {
                // Format valide et non vide → Retirer les erreurs
                question.classList.remove('input-error');
                inputGroup.classList.remove('fr-input-group--error');
                this.classList.remove('fr-input--error');

                // Retirer le message d'erreur s'il existe et marquer qu'une erreur a été corrigée
                const errorMessage = messagesGroup.querySelector('.fr-message--error');
                if (errorMessage) {
                    errorMessage.remove();
                    // Marquer que cette question a eu une erreur
                    question.dataset.hadError = 'true';
                }

                // Ajouter les classes et message de succès UNIQUEMENT si la question a eu une erreur auparavant
                if (question.dataset.hadError === 'true') {
                    question.classList.add('input-valid');
                    inputGroup.classList.add('fr-input-group--valid');
                    this.classList.add('fr-input--valid');

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
        });
    });

}

export function handleNumericMultiValidation() {
    const numericMultiQuestions = document.querySelectorAll('.question-container.numeric-multi');

    numericMultiQuestions.forEach(function(question) {
        // Vérifier si déjà initialisé
        if (question.dataset.dsfrNumericMultiInit) {
            return;
        }
        question.dataset.dsfrNumericMultiInit = 'true';

        // Masquer les messages d'erreur LimeSurvey
        const initialErrorMessage = question.querySelector('.ls-question-mandatory-initial');
        if (initialErrorMessage) {
            initialErrorMessage.style.display = 'none';
        }

        // Transformer le message d'erreur global en DSFR
        const arrayErrorMessage = question.querySelector('.ls-question-mandatory-array');
        if (arrayErrorMessage && !arrayErrorMessage.classList.contains('fr-message')) {
            const dsfrMessage = document.createElement('p');
            dsfrMessage.className = 'fr-message fr-message--error';
            dsfrMessage.textContent = arrayErrorMessage.textContent.trim().replace(/\s+/g, ' ');
            dsfrMessage.setAttribute('role', 'alert');
            arrayErrorMessage.style.display = 'none';
            arrayErrorMessage.parentNode.insertBefore(dsfrMessage, arrayErrorMessage.nextSibling);
        }

        // Pour chaque input numérique
        const numericInputs = question.querySelectorAll('input.numeric[data-number="1"]');

        numericInputs.forEach(function(input) {
            const listItem = input.closest('li.question-item');
            if (!listItem) return;

            // Vérifier si le fr-input-group existe déjà
            let inputGroup = input.closest('.fr-input-group');
            if (!inputGroup) {
                // Créer le fr-input-group
                inputGroup = document.createElement('div');
                inputGroup.className = 'fr-input-group';

                // Wrapper l'input dans le fr-input-group
                const parent = input.parentNode;
                parent.insertBefore(inputGroup, input);
                inputGroup.appendChild(input);

                // Créer le fr-messages-group
                const messagesGroup = document.createElement('div');
                messagesGroup.className = 'fr-messages-group';
                messagesGroup.id = input.id + '-messages';
                messagesGroup.setAttribute('aria-live', 'polite');
                inputGroup.appendChild(messagesGroup);

                // Mettre à jour aria-describedby
                input.setAttribute('aria-describedby', messagesGroup.id);
            }

            // Si le champ est en erreur, ajouter la classe et le message
            if (listItem.classList.contains('ls-error-mandatory') || listItem.classList.contains('has-error')) {
                input.classList.add('fr-input--error');
                if (inputGroup) {
                    inputGroup.classList.add('fr-input-group--error');
                }

                // Ajouter un message d'erreur initial si le champ est vide
                const messagesGroup = inputGroup.querySelector('.fr-messages-group');
                if (messagesGroup && (!input.value || input.value.trim() === '')) {
                    let errorMsg = messagesGroup.querySelector('.fr-message--error');
                    if (!errorMsg) {
                        errorMsg = document.createElement('p');
                        errorMsg.className = 'fr-message fr-message--error';
                        errorMsg.setAttribute('role', 'alert');
                        messagesGroup.appendChild(errorMsg);
                    }
                    errorMsg.textContent = 'Ce champ est obligatoire';
                }

                // Masquer le message LimeSurvey .ls-em-error si présent
                const lsEmError = listItem.querySelector('.ls-em-error');
                if (lsEmError) {
                    lsEmError.style.display = 'none';
                }
            }

            // Éviter de dupliquer les listeners
            if (input.dataset.numericMultiListenerAttached) {
                return;
            }
            input.dataset.numericMultiListenerAttached = 'true';

            // Validation en temps réel
            input.addEventListener('input', function() {
                const value = this.value.trim();
                const messagesGroup = inputGroup.querySelector('.fr-messages-group');

                // Masquer le message LimeSurvey .ls-em-error pendant la saisie
                const lsEmError = listItem.querySelector('.ls-em-error');
                if (lsEmError) {
                    lsEmError.style.display = 'none';
                }

                // Si vide, retirer les messages mais garder l'état d'erreur
                if (value === '') {
                    this.classList.add('fr-input--error');
                    this.classList.remove('fr-input--valid');
                    inputGroup.classList.add('fr-input-group--error');
                    inputGroup.classList.remove('fr-input-group--valid');

                    // Retirer les messages
                    const errorMsg = messagesGroup.querySelector('.fr-message--error');
                    if (errorMsg) errorMsg.remove();
                    const validMsg = messagesGroup.querySelector('.fr-message--valid');
                    if (validMsg) validMsg.remove();
                    return;
                }

                // Vérifier si c'est un nombre valide
                const isValidNumber = /^-?\d+([.,]\d*)?$/.test(value) || /^-?\d*[.,]\d+$/.test(value);

                if (!isValidNumber) {
                    // Format invalide → erreur
                    this.classList.add('fr-input--error');
                    this.classList.remove('fr-input--valid');
                    inputGroup.classList.add('fr-input-group--error');
                    inputGroup.classList.remove('fr-input-group--valid');

                    // Retirer le message de succès
                    const validMsg = messagesGroup.querySelector('.fr-message--valid');
                    if (validMsg) validMsg.remove();

                    // Ajouter le message d'erreur
                    let errorMsg = messagesGroup.querySelector('.fr-message--error');
                    if (!errorMsg) {
                        errorMsg = document.createElement('p');
                        errorMsg.className = 'fr-message fr-message--error';
                        errorMsg.setAttribute('role', 'alert');
                        messagesGroup.appendChild(errorMsg);
                    }
                    errorMsg.textContent = "Ce champ n'accepte que des chiffres. Les caractères non numériques sont automatiquement supprimés.";

                    // Marquer que cette question a eu une erreur
                    question.dataset.hadError = 'true';
                } else {
                    // Format valide → retirer les erreurs de format
                    this.classList.remove('fr-input--error');
                    inputGroup.classList.remove('fr-input-group--error');

                    // Retirer le message d'erreur de format
                    const errorMsg = messagesGroup.querySelector('.fr-message--error');
                    if (errorMsg) {
                        errorMsg.remove();
                        question.dataset.hadError = 'true';
                    }

                    // Si pas de contrainte de somme, afficher "Merci" immédiatement
                    // Sinon, on attend le setTimeout qui vérifiera la somme
                    var hasSumConstraint = !!question.querySelector('.dynamic-total');
                    if (!hasSumConstraint && question.dataset.hadError === 'true') {
                        this.classList.add('fr-input--valid');
                        inputGroup.classList.add('fr-input-group--valid');

                        let validMsg = messagesGroup.querySelector('.fr-message--valid');
                        if (!validMsg) {
                            validMsg = document.createElement('p');
                            validMsg.className = 'fr-message fr-message--valid';
                            messagesGroup.appendChild(validMsg);
                        }
                        validMsg.textContent = 'Merci d\'avoir répondu';
                    }
                }

                // Vérifier l'ensemble : formats + somme (après recalcul EM)
                setTimeout(function() {
                    var allInputs = question.querySelectorAll('input.numeric[data-number="1"]');
                    var allFormatValid = true;
                    var allFilled = true;

                    allInputs.forEach(function(inp) {
                        var val = inp.value ? inp.value.trim() : '';
                        if (val === '') {
                            allFilled = false;
                            allFormatValid = false;
                        } else {
                            var isValid = /^-?\d+([.,]\d*)?$/.test(val) || /^-?\d*[.,]\d+$/.test(val);
                            if (!isValid) allFormatValid = false;
                        }
                    });

                    // Vérifier la contrainte de somme en calculant nous-mêmes
                    var totalEl = question.querySelector('.dynamic-total');
                    var hasSumConstraint = false;
                    var isSumValid = true;

                    if (totalEl) {
                        // Chercher le message de contrainte de somme (vmsg_*_sum_range-dsfr)
                        var qId = totalEl.id ? totalEl.id.replace('totalvalue_', '') : null;
                        var sumRangeMsg = qId ? document.getElementById('vmsg_' + qId + '_sum_range-dsfr') : null;

                        if (sumRangeMsg) {
                            hasSumConstraint = true;
                            // Parser les limites depuis le texte "entre X et Y"
                            var rangeMatch = sumRangeMsg.textContent.match(/(\d+)\s+.+\s+(\d+)/);
                            if (rangeMatch) {
                                var minSum = parseFloat(rangeMatch[1]);
                                var maxSum = parseFloat(rangeMatch[2]);

                                // Calculer la somme des champs remplis
                                var currentSum = 0;
                                allInputs.forEach(function(inp) {
                                    var val = inp.value ? inp.value.trim().replace(',', '.') : '';
                                    if (val !== '' && !isNaN(parseFloat(val))) {
                                        currentSum += parseFloat(val);
                                    }
                                });

                                isSumValid = currentSum >= minSum && currentSum <= maxSum;
                            }
                        }
                    }

                    if (allFormatValid && allFilled && isSumValid) {
                        // Tout est OK → succès global
                        question.classList.remove('input-error', 'fr-input-group--error');
                        question.classList.add('input-valid');

                        // Afficher "Merci" sur chaque champ (y compris ceux en attente de la somme)
                        if (question.dataset.hadError === 'true') {
                            allInputs.forEach(function(inp) {
                                var grp = inp.closest('.fr-input-group');
                                if (grp) {
                                    grp.classList.remove('fr-input-group--error');
                                    grp.classList.add('fr-input-group--valid');
                                    inp.classList.remove('fr-input--error');
                                    inp.classList.add('fr-input--valid');
                                    var msgs = grp.querySelector('.fr-messages-group');
                                    if (msgs) {
                                        var vMsg = msgs.querySelector('.fr-message--valid');
                                        if (!vMsg) {
                                            vMsg = document.createElement('p');
                                            vMsg.className = 'fr-message fr-message--valid';
                                            msgs.appendChild(vMsg);
                                        }
                                        vMsg.textContent = 'Merci d\'avoir répondu';
                                    }
                                }
                            });
                        }

                        // Retirer les messages d'erreur globaux
                        var dsfrErrorMsg = question.querySelector('.question-valid-container .fr-message--error');
                        if (dsfrErrorMsg) dsfrErrorMsg.remove();

                        if (typeof updateErrorSummary === 'function') {
                            setTimeout(updateErrorSummary, 50);
                        }

                    } else if (allFormatValid && hasSumConstraint && !isSumValid) {
                        // Formats OK mais somme hors limites
                        question.classList.remove('input-valid');
                        question.classList.add('input-error');

                        // Retirer les "Merci" per-field (la somme n'est pas bonne)
                        allInputs.forEach(function(inp) {
                            var grp = inp.closest('.fr-input-group');
                            if (grp) {
                                grp.classList.remove('fr-input-group--error', 'fr-input-group--valid');
                                inp.classList.remove('fr-input--error', 'fr-input--valid');
                                var msgs = grp.querySelector('.fr-messages-group');
                                if (msgs) {
                                    var vMsg = msgs.querySelector('.fr-message--valid');
                                    if (vMsg) vMsg.remove();
                                    var eMsg = msgs.querySelector('.fr-message--error');
                                    if (eMsg) eMsg.remove();
                                }
                            }
                        });

                        // Marquer hadError pour pouvoir afficher "Merci" plus tard
                        question.dataset.hadError = 'true';

                    } else if (!allFormatValid) {
                        // Erreurs de format sur certains champs
                        question.classList.add('input-error');
                        question.classList.remove('input-valid');

                        // S'assurer que les champs invalides affichent l'erreur
                        // (déjà géré dans le handler synchrone ci-dessus)
                    }
                }, 200);
            });
        });
    });
}

export function observeNumericMultiSumValidation() {
    var numericMultiQuestions = document.querySelectorAll('.question-container.numeric-multi');
    console.log('[DSFR SumValidation] Questions numeric-multi trouvées:', numericMultiQuestions.length);

    numericMultiQuestions.forEach(function(question) {
        var totalEl = question.querySelector('.dynamic-total');
        console.log('[DSFR SumValidation] totalEl:', totalEl ? totalEl.id : 'NON TROUVÉ');
        if (!totalEl) return;

        var qId = totalEl.id ? totalEl.id.replace('totalvalue_', '') : null;
        console.log('[DSFR SumValidation] qId:', qId);
        if (!qId) return;

        var sumRangeMsgId = 'vmsg_' + qId + '_sum_range-dsfr';
        var sumRangeMsg = document.getElementById(sumRangeMsgId);
        console.log('[DSFR SumValidation] sumRangeMsg (' + sumRangeMsgId + '):', sumRangeMsg ? sumRangeMsg.textContent : 'NON TROUVÉ');
        // Aussi chercher sans le suffixe -dsfr (si transformValidationMessages n'a pas encore tourné)
        if (!sumRangeMsg) {
            sumRangeMsg = document.getElementById('vmsg_' + qId + '_sum_range');
            console.log('[DSFR SumValidation] fallback vmsg_' + qId + '_sum_range:', sumRangeMsg ? sumRangeMsg.textContent : 'NON TROUVÉ');
        }
        if (!sumRangeMsg) return;

        if (totalEl.dataset.dsfrSumObserver) return;
        totalEl.dataset.dsfrSumObserver = 'true';

        // Parser les limites depuis le texte du message (ex: "entre 3 et 10")
        var rangeMatch = sumRangeMsg.textContent.match(/(\d+)\s+.+\s+(\d+)/);
        console.log('[DSFR SumValidation] rangeMatch:', rangeMatch);
        if (!rangeMatch) return;
        var minSum = parseFloat(rangeMatch[1]);
        var maxSum = parseFloat(rangeMatch[2]);

        var totalRow = totalEl.closest('.ls-group-total');

        function checkSumAndUpdate() {
            // Calculer la somme depuis les inputs
            var allInputs = question.querySelectorAll('input.numeric[data-number="1"]');
            var currentSum = 0;
            var anyFilled = false;
            allInputs.forEach(function(inp) {
                var val = inp.value ? inp.value.trim().replace(',', '.') : '';
                if (val !== '' && !isNaN(parseFloat(val))) {
                    currentSum += parseFloat(val);
                    anyFilled = true;
                }
            });

            var isSumError = anyFilled && (currentSum < minSum || currentSum > maxSum);

            if (isSumError) {
                // Somme hors limites → erreur
                sumRangeMsg.classList.remove('fr-message--info', 'fr-message--valid');
                sumRangeMsg.classList.add('fr-message--error');
                sumRangeMsg.setAttribute('role', 'alert');

                // Afficher l'erreur sous le Total
                if (totalRow) {
                    var totalErrMsg = totalRow.querySelector('.sum-range-error');
                    if (!totalErrMsg) {
                        totalErrMsg = document.createElement('p');
                        totalErrMsg.className = 'fr-message fr-message--error sum-range-error';
                        totalErrMsg.setAttribute('role', 'alert');
                        totalErrMsg.textContent = sumRangeMsg.textContent;
                        var totalInputGroup = totalRow.querySelector('.ls-input-group');
                        if (totalInputGroup) {
                            totalInputGroup.appendChild(totalErrMsg);
                        } else {
                            totalRow.appendChild(totalErrMsg);
                        }
                    }
                }

                question.classList.remove('input-valid');
                question.classList.add('input-error');

                // Retirer les "Merci" per-field
                allInputs.forEach(function(inp) {
                    var grp = inp.closest('.fr-input-group');
                    if (grp) {
                        grp.classList.remove('fr-input-group--valid');
                        inp.classList.remove('fr-input--valid');
                        var msgs = grp.querySelector('.fr-messages-group');
                        if (msgs) {
                            var vMsg = msgs.querySelector('.fr-message--valid');
                            if (vMsg) vMsg.remove();
                        }
                    }
                });

                question.dataset.hadError = 'true';

            } else {
                // Somme OK → info
                sumRangeMsg.classList.remove('fr-message--error');
                sumRangeMsg.classList.add('fr-message--info');
                sumRangeMsg.removeAttribute('role');

                if (totalRow) {
                    var totalErrMsg = totalRow.querySelector('.sum-range-error');
                    if (totalErrMsg) totalErrMsg.remove();
                }
            }
        }

        // Vérification initiale
        checkSumAndUpdate();

        // Observer les changements sur les inputs de la question
        var allInputs = question.querySelectorAll('input.numeric[data-number="1"]');
        allInputs.forEach(function(inp) {
            inp.addEventListener('input', function() {
                // Laisser le temps au handler principal de s'exécuter
                setTimeout(checkSumAndUpdate, 250);
            });
        });
    });
}
