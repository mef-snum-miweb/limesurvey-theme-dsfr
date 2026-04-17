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

(function() {
    'use strict';

    // === Fix pour les questions Multiple Short Text avec Input On Demand ===

    /**
     * Réinitialise les boutons "Ajouter une ligne" après validation
     */
    function reinitInputOnDemand() {
        const addButtons = document.querySelectorAll('.selector--inputondemand-addlinebutton');

        addButtons.forEach(button => {
            if (button.dataset.initialized) return;
            button.dataset.initialized = 'true';

            const container = button.closest('[id^="selector--inputondemand-"]');
            if (!container) return;

            const itemsList = container.querySelector('.selector--inputondemand-list');
            if (!itemsList) return;

            // Utiliser capture=true pour intercepter avant les autres listeners
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation(); // Bloquer les autres listeners (LimeSurvey natif)

                const hiddenItems = itemsList.querySelectorAll('.selector--inputondemand-list-item.d-none');

                if (hiddenItems.length > 0) {
                    const nextItem = hiddenItems[0];
                    nextItem.classList.remove('d-none');

                    const input = nextItem.querySelector('input, textarea');
                    if (input) setTimeout(() => input.focus(), 100);

                    if (hiddenItems.length === 1) button.style.display = 'none';
                }
            }, true); // Capture phase = true pour s'exécuter avant les autres
        });
    }

    /**
     * Affiche les lignes visibles après validation échouée
     */
    function restoreVisibleLines() {
        const containers = document.querySelectorAll('[id^="selector--inputondemand-"]');

        containers.forEach(container => {
            const itemsList = container.querySelector('.selector--inputondemand-list');
            if (!itemsList) return;

            const allItems = itemsList.querySelectorAll('.selector--inputondemand-list-item');
            const hiddenItems = itemsList.querySelectorAll('.selector--inputondemand-list-item.d-none');

            if (hiddenItems.length === allItems.length && allItems.length > 0) {
                allItems[0].classList.remove('d-none');
            }
        });
    }

    /**
     * Gère l'affichage du bouton "Ajouter une ligne"
     */
    function updateAddButtonVisibility() {
        const containers = document.querySelectorAll('[id^="selector--inputondemand-"]');

        containers.forEach(container => {
            const button = container.querySelector('.selector--inputondemand-addlinebutton');
            const itemsList = container.querySelector('.selector--inputondemand-list');

            if (!button || !itemsList) return;

            const hiddenItems = itemsList.querySelectorAll('.selector--inputondemand-list-item.d-none');
            button.style.display = hiddenItems.length > 0 ? '' : 'none';
        });
    }

    /**
     * Initialisation
     */
    function initMultipleShortText() {
        restoreVisibleLines();
        reinitInputOnDemand();
        updateAddButtonVisibility();
    }

    // Initialiser au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMultipleShortText);
    } else {
        initMultipleShortText();
    }

    // Réinitialiser après événements AJAX
    document.addEventListener('limesurvey:questionsLoaded', initMultipleShortText);

    // === Fix pour les Bootstrap Buttons Radio (boutons radio stylés) ===

    /**
     * Gère l'état "active" des conteneurs de boutons radio
     */
    function initBootstrapButtonsRadio() {
        // Trouver tous les groupes de boutons radio
        const radioGroups = document.querySelectorAll('.radio-list[data-bs-toggle="buttons"]');

        radioGroups.forEach(function(group) {
            // Trouver tous les inputs radio dans ce groupe
            const radios = group.querySelectorAll('input[type="radio"]');

            radios.forEach(function(radio) {
                // Ajouter un event listener sur chaque radio
                radio.addEventListener('change', function() {
                    if (this.checked) {
                        // Retirer la classe "active" de tous les conteneurs du même groupe
                        const allContainers = group.querySelectorAll('.bootstrap-buttons-div .form-check');
                        allContainers.forEach(function(container) {
                            container.classList.remove('active');
                        });

                        // Ajouter la classe "active" au conteneur du radio sélectionné
                        const currentContainer = this.closest('.form-check');
                        if (currentContainer) {
                            currentContainer.classList.add('active');
                        }
                    }
                });

                // Initialiser l'état au chargement
                if (radio.checked) {
                    const container = radio.closest('.form-check');
                    if (container) {
                        container.classList.add('active');
                    }
                }
            });
        });
    }

    /**
     * Initialise le champ "Autre" des radio buttons au chargement
     * - Affiche le champ si "autre" est sélectionné
     * - Restaure la valeur depuis le champ caché
     */
    function initRadioOtherField() {
        // Trouver tous les boutons radio "autre"
        const otherRadios = document.querySelectorAll('input[type="radio"][value="-oth-"]');

        otherRadios.forEach(function(radio) {
            const name = radio.name;
            const otherDiv = document.getElementById('div' + name + 'other');
            const otherInput = document.getElementById('answer' + name + 'othertext');
            const hiddenInput = document.getElementById('answer' + name + 'othertextaux');

            if (!otherDiv || !otherInput) return;

            // Si "autre" est sélectionné au chargement, afficher le champ et restaurer la valeur
            if (radio.checked) {
                otherDiv.classList.remove('ls-js-hidden');

                // Restaurer la valeur depuis le champ caché si elle existe
                if (hiddenInput && hiddenInput.value) {
                    otherInput.value = hiddenInput.value;
                }
            }
        });
    }

    // Initialiser au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initBootstrapButtonsRadio();
            initRadioOtherField();
        });
    } else {
        initBootstrapButtonsRadio();
        initRadioOtherField();
    }

    // Réinitialiser après événements AJAX
    document.addEventListener('limesurvey:questionsLoaded', function() {
        initBootstrapButtonsRadio();
        initRadioOtherField();
    });

    // === Fix pour le rechargement du Captcha ===

    /**
     * Recharge l'image du captcha sans recharger toute la page
     */
    function initCaptchaReload() {
        const reloadButton = document.getElementById('reloadCaptcha');

        if (!reloadButton) {
            return; // Pas de captcha sur cette page
        }

        // Éviter de dupliquer les listeners
        if (reloadButton.dataset.captchaInitialized) {
            return;
        }
        reloadButton.dataset.captchaInitialized = 'true';

        reloadButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();


            // Trouver l'image du captcha
            // Elle est soit dans le même container, soit juste avant le bouton
            const captchaContainer = reloadButton.closest('.fr-captcha, .captcha-container, [class*="captcha"]');
            let captchaImage = null;

            if (captchaContainer) {
                captchaImage = captchaContainer.querySelector('img');
            }

            // Fallback: chercher dans tout le formulaire
            if (!captchaImage) {
                const form = reloadButton.closest('form');
                if (form) {
                    captchaImage = form.querySelector('img[src*="captcha"]');
                }
            }

            if (!captchaImage) {
                window.location.reload();
                return;
            }

            // Recharger l'image en changeant le paramètre v
            const currentSrc = captchaImage.src;
            const newSrc = currentSrc.replace(/v=[^&]*/, 'v=' + new Date().getTime());


            // Ajouter un effet visuel pendant le rechargement
            captchaImage.style.opacity = '0.5';

            captchaImage.onload = function() {
                captchaImage.style.opacity = '1';
                if (typeof window.__lsDsfrFixCaptchaAlt === 'function') {
                    window.__lsDsfrFixCaptchaAlt();
                }
            };

            captchaImage.onerror = function() {
                captchaImage.style.opacity = '1';
            };

            captchaImage.src = newSrc;
        });

    }

    /**
     * Validation DSFR pour le champ captcha
     * Remplace la validation HTML5 native par une validation DSFR avec message d'erreur
     */
    function initCaptchaValidation() {
        const captchaForm = document.getElementById('form-captcha');
        const captchaInput = document.getElementById('loadsecurity');
        const messagesGroup = document.getElementById('loadsecurity-messages');
        const inputGroup = captchaInput?.closest('.fr-input-group');

        if (!captchaForm || !captchaInput || !messagesGroup) {
            return; // Pas de formulaire captcha sur cette page
        }

        captchaForm.addEventListener('submit', function(e) {
            // Nettoyer les erreurs précédentes
            inputGroup.classList.remove('fr-input-group--error');
            messagesGroup.innerHTML = '';

            // Valider le champ
            if (!captchaInput.value || captchaInput.value.trim() === '') {
                e.preventDefault();
                e.stopPropagation();

                // Ajouter la classe d'erreur
                inputGroup.classList.add('fr-input-group--error');

                // Ajouter le message d'erreur DSFR
                const errorMessage = document.createElement('p');
                errorMessage.className = 'fr-message fr-message--error';
                errorMessage.textContent = 'Veuillez saisir votre réponse';
                messagesGroup.appendChild(errorMessage);

                // Focus sur le champ pour l'accessibilité
                captchaInput.focus();

                return false;
            }
        });
    }

    // Initialiser au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initCaptchaReload();
            initCaptchaValidation();
        });
    } else {
        initCaptchaReload();
        initCaptchaValidation();
    }

    // Réinitialiser après événements AJAX
    document.addEventListener('limesurvey:questionsLoaded', function() {
        initCaptchaReload();
        initCaptchaValidation();
    });


    // === Validation en temps réel pour les champs numériques ===

    /**
     * Affiche un message d'erreur en temps réel si l'utilisateur saisit du texte
     * dans un champ numérique, AVANT que LimeSurvey ne l'efface
     */
    function initNumericValidation() {
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

    // Initialiser la validation numérique
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNumericValidation);
    } else {
        initNumericValidation();
    }

    // Réinitialiser après chargement AJAX
    document.addEventListener('limesurvey:questionsLoaded', initNumericValidation);

    // === Validation pour les tableaux (array questions) ===
    //
    // RGAA 11.10 + 11.11 — Approche « compteur global » (même logique que multiple-short-txt) :
    //   • Champs vides = neutres (pas de rouge individuel)
    //   • Champs remplis = vert discret
    //   • Erreur de format numérique = rouge individuel (seul cas)
    //   • Message compteur global avec aria-live="polite"

    /**
     * Gère la validation des questions de type tableau (array)
     * avec message compteur global au lieu d'une erreur par cellule.
     */
    function handleArrayValidation() {
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

    // Initialiser la validation des tableaux
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleArrayValidation);
    } else {
        handleArrayValidation();
    }

    // Réinitialiser après chargement AJAX
    document.addEventListener('limesurvey:questionsLoaded', handleArrayValidation);

    // === Validation DSFR pour les questions "Multiples entrées numériques" ===

    /**
     * Gère la validation DSFR pour les questions de type "Multiples entrées numériques"
     * - Transforme le message d'erreur global
     * - Ajoute fr-input-group et fr-messages-group pour chaque input
     * - Gère la validation en temps réel
     */
    function handleNumericMultiValidation() {
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

    // Initialiser la validation des multiples entrées numériques
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleNumericMultiValidation);
    } else {
        handleNumericMultiValidation();
    }

    // Réinitialiser après chargement AJAX
    document.addEventListener('limesurvey:questionsLoaded', handleNumericMultiValidation);

    // === Validation de la somme (min/max) pour les questions "Multiples entrées numériques" ===

    /**
     * Observe le totalvalue_* des questions numeric-multi pour détecter
     * quand l'Expression Manager de LimeSurvey bascule la classe ls-em-error
     * (somme hors limites) et synchronise l'état avec les messages DSFR.
     */
    function observeNumericMultiSumValidation() {
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

    // Initialiser l'observation de la somme
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(observeNumericMultiSumValidation, 200);
        });
    } else {
        setTimeout(observeNumericMultiSumValidation, 200);
    }

    // Réinitialiser après chargement AJAX
    document.addEventListener('limesurvey:questionsLoaded', function() {
        setTimeout(observeNumericMultiSumValidation, 200);
    });

    // === Validation DSFR pour les questions simples (radio, select, date) ===

    /**
     * Gère la validation pour les questions simples : oui/non, genre, liste, date, etc.
     * Ces questions passent en succès dès qu'une valeur est sélectionnée
     */
    function handleSimpleQuestionValidation() {
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

    // Initialiser la validation des questions simples
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleSimpleQuestionValidation);
    } else {
        handleSimpleQuestionValidation();
    }

    // Réinitialiser après chargement AJAX
    document.addEventListener('limesurvey:questionsLoaded', handleSimpleQuestionValidation);

    // === Transformation des messages de validation LimeSurvey en messages DSFR ===

    /**
     * Transforme les messages de validation générés par LimeSurvey en messages DSFR
     * Applique les classes fr-message fr-message--info aux messages de validation
     */
    function transformValidationMessages() {
        // Sélectionner tous les messages de validation LimeSurvey
        const emMessages = document.querySelectorAll('.ls-question-message');
        emMessages.forEach(message => {
            // Vérifier si le message n'a pas déjà été transformé
            if (message.classList.contains('fr-message')) {
                return;
            }

            // Déterminer le type de message
            let messageType = 'info'; // Par défaut

            if (message.classList.contains('ls-em-error')) {
                messageType = 'error';
            } else if (message.classList.contains('ls-em-warning')) {
                messageType = 'warning';
            } else if (message.classList.contains('ls-em-success') || message.classList.contains('ls-em-tip')) {
                messageType = 'info'; // Les messages de succès et tips deviennent des infos
            }

            // Créer un nouveau paragraphe avec les classes DSFR
            const dsfrMessage = document.createElement('p');
            dsfrMessage.className = `fr-message fr-message--${messageType}`;
            dsfrMessage.textContent = message.textContent.trim();
            dsfrMessage.id = message.id ? `${message.id}-dsfr` : '';

            // Remplacer le message original
            message.replaceWith(dsfrMessage);
        });
    }

    // Initialiser la transformation des messages
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            transformValidationMessages();
        });
    } else {
        transformValidationMessages();
    }

    // Aussi essayer avec un petit délai pour être sûr
    setTimeout(function() {
        transformValidationMessages();
    }, 100);

    // Réinitialiser après chargement AJAX
    document.addEventListener('limesurvey:questionsLoaded', function() {
        transformValidationMessages();
    });

    // === Fix pour les tableaux dropdown-array avec styles inline ===

    /**
     * Supprime les styles inline qui empêchent la linéarisation des tableaux sur mobile
     */
    function fixDropdownArrayInlineStyles() {
        // Seulement sur mobile (< 768px)
        if (window.innerWidth >= 768) {
            return;
        }

        // Cibler les tableaux dropdown-array
        const dropdownArrays = document.querySelectorAll('table.dropdown-array');

        dropdownArrays.forEach((table) => {
            // Trouver tous les td avec style inline
            const cells = table.querySelectorAll('tbody tr td[style*="display"]');

            cells.forEach(cell => {
                // Supprimer complètement l'attribut style
                cell.removeAttribute('style');
            });
        });
    }

    // MutationObserver pour surveiller et supprimer les styles réappliqués
    let styleObserver = null;
    let resizeTimer;

    function setupStyleObserver() {
        // Ne surveiller que sur mobile
        if (window.innerWidth >= 768) {
            if (styleObserver) {
                styleObserver.disconnect();
                styleObserver = null;
            }
            return;
        }

        // Si déjà actif, ne rien faire
        if (styleObserver) {
            return;
        }

        // Créer l'observer
        styleObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.tagName === 'TD' && target.closest('table.dropdown-array')) {
                        target.removeAttribute('style');
                    }
                }
            });
        });

        // Observer tous les tableaux dropdown-array
        const dropdownArrays = document.querySelectorAll('table.dropdown-array');
        dropdownArrays.forEach(function(table) {
            styleObserver.observe(table, {
                attributes: true,
                attributeFilter: ['style'],
                subtree: true
            });
        });
    }

    // Activer l'observer après le nettoyage initial
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            fixDropdownArrayInlineStyles();
            setupStyleObserver();
        });
    } else {
        fixDropdownArrayInlineStyles();
        setupStyleObserver();
    }

    // Réactiver l'observer après redimensionnement
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            fixDropdownArrayInlineStyles();
            setupStyleObserver();
        }, 250);
    });

    // Réactiver l'observer après chargement AJAX
    document.addEventListener('limesurvey:questionsLoaded', function() {
        fixDropdownArrayInlineStyles();
        setupStyleObserver();
    });

    // === Liaison automatique des questions conditionnelles avec ARIA ===

    /**
     * Liaison automatique des questions conditionnelles avec ARIA
     *
     * Ce module améliore l'accessibilité en liant automatiquement les questions
     * conditionnelles à leurs questions parentes via aria-describedby.
     *
     * Critères RGAA concernés : 11.1 (Étiquettes), 11.2 (Regroupements de champs)
     */

    /**
     * Extrait les codes de questions (SGQ) depuis une expression ExpressionScript
     * Exemples d'expressions :
     * - "Q1.NAOK == 'Y'"
     * - "Q2_SQ001.NAOK > 5"
     * - "!is_empty(Q3.NAOK)"
     *
     * @param {string} expression - Expression ExpressionScript
     * @returns {Array<string>} - Liste des codes de questions trouvés
     */
    function extractQuestionCodes(expression) {
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
    function findQuestionByCode(questionCode) {
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
    function getQuestionText(questionElement) {
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
    function createConditionalDescription(questionId, parentQuestions) {
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

        // Créer le texte de description
        let descText;
        if (parentQuestions.length === 1) {
            descText = `Cette question dépend de votre réponse à ${parentQuestions[0]}.`;
        } else if (parentQuestions.length > 1) {
            const lastQuestion = parentQuestions.pop();
            descText = `Cette question dépend de vos réponses à ${parentQuestions.join(', ')} et ${lastQuestion}.`;
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
    function addAriaDescribedBy(questionElement, descriptionId) {
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
    function processConditionalQuestion(questionElement) {
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
    function initConditionalQuestionsAria() {
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
    function setupConditionalQuestionsObserver() {
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
    function initConditionalVisibilityNotifier() {
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
    function excludeIrrelevantInputsFromTabOrder() {
        var irrelevant = document.querySelectorAll('.question-container.ls-irrelevant, .question-container.ls-hidden');
        irrelevant.forEach(function(q) {
            q.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(function(field) {
                field.setAttribute('tabindex', '-1');
            });
        });
    }

    // === INITIALISATION des questions conditionnelles ===

    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initConditionalQuestionsAria();
            setupConditionalQuestionsObserver();
            initConditionalVisibilityNotifier();
            excludeIrrelevantInputsFromTabOrder();
        });
    } else {
        // DOM déjà chargé
        initConditionalQuestionsAria();
        setupConditionalQuestionsObserver();
        initConditionalVisibilityNotifier();
        excludeIrrelevantInputsFromTabOrder();
    }

})();

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
