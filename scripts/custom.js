/**
 * JavaScript personnalisé pour le thème DSFR
 *
 * Utilisez ce fichier pour vos scripts personnalisés
 * sans modifier theme.js
 */

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

    /**
     * Gestion des champs obligatoires :
     * - Ajoute la classe .has-required-field aux labels/legends des champs obligatoires
     * - Ajoute une mention "Les champs marqués d'un * sont obligatoires" en haut de page
     */
    function handleRequiredFields() {
        // 1. Trouver tous les champs obligatoires
        // Méthode A: Attribut required/aria-required (captcha, formulaires)
        const requiredFields = document.querySelectorAll('input[required], textarea[required], select[required], input[aria-required="true"], textarea[aria-required="true"], select[aria-required="true"]');

        // Méthode B: Classe .mandatory sur les questions (pages LimeSurvey)
        // Inclut aussi les questions dont le h3 a mandatory-question (ajouté par le Twig)
        const mandatoryQuestions = document.querySelectorAll('.mandatory.question-container, .mandatory[id^="question"], .question-container:has(.mandatory-question)');

        // Méthode C: Badges "Obligatoire"
        const mandatoryBadges = document.querySelectorAll('.fr-badge[aria-label*="Mandatory"], .fr-badge[aria-label*="Obligatoire"]');

        if (requiredFields.length === 0 && mandatoryQuestions.length === 0 && mandatoryBadges.length === 0) {
            return; // Pas de champs obligatoires sur cette page
        }

        // 2. Traiter les champs avec attribut required
        requiredFields.forEach(field => {
            // Chercher le label associé (plusieurs stratégies)
            let label = null;

            // Stratégie 1: Label avec for="id"
            if (field.id) {
                label = document.querySelector(`label[for="${field.id}"]`);
            }

            // Stratégie 2: Label parent direct
            if (!label) {
                label = field.closest('label');
            }

            // Stratégie 3: Label ou legend frère précédent
            if (!label) {
                const inputGroup = field.closest('.fr-input-group, .fr-fieldset__element');
                if (inputGroup) {
                    label = inputGroup.querySelector('.fr-label, .fr-fieldset__legend');
                }
            }

            // Stratégie 4: Chercher dans le parent fieldset
            if (!label) {
                const fieldset = field.closest('fieldset');
                if (fieldset) {
                    label = fieldset.querySelector('.fr-fieldset__legend');
                }
            }

            // Stratégie 5: Span spécifique comme #ls-captcha-text
            if (!label && field.getAttribute('aria-labelledby')) {
                const labelId = field.getAttribute('aria-labelledby');
                label = document.getElementById(labelId);
            }

            // Ajouter la classe si on a trouvé un label
            if (label && !label.classList.contains('has-required-field')) {
                label.classList.add('has-required-field');
            }
        });

        // 3. Traiter les questions avec classe .mandatory
        mandatoryQuestions.forEach(question => {
            // Chercher le label principal de la question (h3.question-text)
            let questionLabel = question.querySelector('.question-text');

            // Si pas trouvé, chercher .ls-label-question en fallback
            if (!questionLabel) {
                questionLabel = question.querySelector('.ls-label-question');
            }

            if (!questionLabel) return;

            // Vérifier si pas déjà traité (classe marqueur ou astérisque déjà présent)
            const alreadyHasAsterisk = questionLabel.classList.contains('asterisk-injected') ||
                                       questionLabel.querySelector('.required-asterisk') ||
                                       questionLabel.querySelector('.asterisk');

            if (!alreadyHasAsterisk) {
                // Marquer comme traité
                questionLabel.classList.add('asterisk-injected');

                // Créer et insérer l'astérisque
                const asterisk = document.createElement('span');
                asterisk.className = 'required-asterisk';
                asterisk.style.color = 'var(--text-default-error)';
                asterisk.style.fontWeight = '700';
                asterisk.style.marginRight = '0.25rem';
                asterisk.setAttribute('aria-hidden', 'true');
                asterisk.textContent = '* ';

                // Chercher le dernier élément structurel (question-number, question-code)
                const lastStructuralElement = questionLabel.querySelector('.question-code') ||
                                               questionLabel.querySelector('.question-number');

                if (lastStructuralElement && lastStructuralElement.nextSibling) {
                    // Insérer après le dernier élément structurel, avant le texte
                    questionLabel.insertBefore(asterisk, lastStructuralElement.nextSibling);
                } else {
                    // Pas d'éléments structurels, insérer au début
                    questionLabel.insertBefore(asterisk, questionLabel.firstChild);
                }
            }

            // IMPORTANT : Ajouter aria-required pour l'accessibilité
            // LimeSurvey ne le fait pas automatiquement sur les questions obligatoires
            const inputs = question.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"], textarea, select');
            inputs.forEach(input => {
                // Ne pas ajouter sur les inputs cachés ou disabled
                if (input.type !== 'hidden' && !input.disabled && !input.hasAttribute('aria-required')) {
                    input.setAttribute('aria-required', 'true');
                }
            });
        });

        // 4. Ajouter la mention en haut de page (une seule fois)
        if (document.getElementById('required-fields-notice')) {
            return; // Déjà ajoutée
        }

        // Trouver le point d'insertion : juste avant les questions

        // Contenu HTML commun de la mention
        // RGAA 10.8 — l'astérisque fait partie intégrante de la phrase,
        // il ne doit PAS être masqué aux technologies d'assistance.
        // Seule l'icône décorative reste aria-hidden.
        const noticeHTML = '<p class="fr-text--sm" style="color: var(--text-mention-grey);"><span class="fr-icon-error-warning-line" aria-hidden="true" style="margin-right: 0.5rem;"></span>Les champs marqués d\'un <span style="color: var(--text-default-error); font-weight: 700;">*</span> sont obligatoires</p>';

        // Stratégie 0a: Page anti-bot - insérer dans la colonne centrée avant le titre
        const antibotContainer = document.querySelector('#antibot-challenge-container');
        if (antibotContainer) {
            const centeredCol = antibotContainer.querySelector('.fr-mx-auto, .fr-col-md-8');
            if (centeredCol) {
                const notice = document.createElement('div');
                notice.id = 'required-fields-notice';
                notice.className = 'fr-mb-2w';
                notice.innerHTML = noticeHTML;
                centeredCol.insertBefore(notice, centeredCol.firstChild);
                return;
            }
        }

        // Stratégie 0b: Page de bienvenue (welcome) - insérer dans le conteneur avant le titre
        // Cherche le conteneur welcome par id dynamique ou par structure
        const welcomeContainer = document.querySelector('#welcome-page-wrapper .fr-container, [id*="welcome"] .fr-col-12, [class*="welcomecontainer"]');
        if (welcomeContainer) {
            const innerCol = welcomeContainer.querySelector('.fr-col-12') || welcomeContainer;
            const firstTitle = innerCol.querySelector('h1, h2');
            if (firstTitle) {
                const notice = document.createElement('div');
                notice.id = 'required-fields-notice';
                notice.className = 'fr-mb-2w';
                notice.innerHTML = noticeHTML;
                innerCol.insertBefore(notice, firstTitle);
                return;
            }
        }

        // Stratégie 1: Page de sauvegarde - insérer avant le fr-callout dans la grille
        const saveMessage = document.querySelector('.save-message');
        if (saveMessage) {
            const notice = document.createElement('div');
            notice.id = 'required-fields-notice';
            notice.className = 'fr-mb-2w';
            notice.innerHTML = noticeHTML;

            // Insérer avant le .save-message (fr-callout)
            saveMessage.parentElement.insertBefore(notice, saveMessage);
            return;
        }

        // Stratégie 2: Page captcha - insérer avant le formulaire (avec fr-container)
        const captchaForm = document.querySelector('.form-captcha');
        if (captchaForm) {
            const notice = document.createElement('div');
            notice.id = 'required-fields-notice';
            notice.className = 'fr-container fr-my-2w';
            notice.innerHTML = noticeHTML;

            const formParent = captchaForm.parentElement;
            if (formParent) {
                formParent.insertBefore(notice, captchaForm);
                return;
            }
        }

        // Créer la mention pour les pages de questions (sans fr-container car déjà dans un groupe)
        const notice = document.createElement('div');
        notice.id = 'required-fields-notice';
        notice.className = 'fr-my-3w';
        notice.innerHTML = noticeHTML;

        // Stratégie 3: Pages de questions - Insérer juste avant la première question
        // dans le premier groupe (après nom/description du groupe)
        const firstGroup = document.querySelector('[id^="group-"]');
        if (firstGroup) {
            // Chercher la première question à l'intérieur du groupe (id="question*", etc.)
            const firstQuestion = firstGroup.querySelector('[id^="question"]');
            if (firstQuestion) {
                // Insérer juste avant la première question
                firstQuestion.parentElement.insertBefore(notice, firstQuestion);
                return;
            }
        }

        // Stratégie 4: Chercher directement la première question (fallback)
        const firstQuestion = document.querySelector('[id^="question"], .question-container, .ls-question, .question-item');
        if (firstQuestion) {
            firstQuestion.parentElement.insertBefore(notice, firstQuestion);
            return;
        }

        // Stratégie 5: Insérer dans le conteneur principal après les alertes
        const mainContent = document.querySelector('#main-col, .ls-survey-content, .survey-content, .main-content');
        if (mainContent) {
            const lastAlert = mainContent.querySelector('.fr-alert:last-of-type, .error-messages:last-of-type');
            if (lastAlert) {
                lastAlert.insertAdjacentElement('afterend', notice);
            } else {
                mainContent.insertBefore(notice, mainContent.firstChild);
            }
            return;
        }

        // Stratégie 6: Fallback final - insérer dans le premier groupe ou fr-container
        const firstContainer = document.querySelector('[id^="group-"], .fr-container');
        if (firstContainer) {
            firstContainer.insertBefore(notice, firstContainer.firstChild);
        }
    }

    // Initialiser au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleRequiredFields);
    } else {
        handleRequiredFields();
    }

    // Réinitialiser après navigation AJAX
    document.addEventListener('limesurvey:questionsLoaded', handleRequiredFields);

    // === Transformation des erreurs LimeSurvey vers DSFR ===

    /**
     * Transforme les messages d'erreur LimeSurvey en messages DSFR conformes
     * - Détecte les questions avec classe "input-error"
     * - Ajoute fr-input-group--error sur le fr-input-group
     * - Copie le message dans fr-messages-group
     * - Cache le message LimeSurvey original
     */
    function transformErrorsToDsfr() {

        // Trouver toutes les questions en erreur
        const errorQuestions = document.querySelectorAll('.question-container.input-error');

        errorQuestions.forEach(function(question) {
            // Ignorer les questions multiple-short-txt qui sont gérées par handleMultipleShortTextErrors()
            if (question.classList.contains('multiple-short-txt')) {
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

    /**
     * Attache des event listeners pour retirer l'erreur DSFR quand l'utilisateur interagit
     */
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

    /**
     * Observer les changements dans le DOM pour détecter les nouvelles erreurs
     * (validation AJAX, validation dynamique, etc.)
     */
    function observeErrorChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Si un élément a été modifié et a maintenant la classe input-error
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('question-container') && target.classList.contains('input-error')) {
                        setTimeout(transformErrorsToDsfr, 100); // Petit délai pour laisser LimeSurvey finir
                    }
                }

                // Si des éléments ont été ajoutés (nouveau contenu AJAX)
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && node.classList && node.classList.contains('input-error')) {
                            setTimeout(transformErrorsToDsfr, 100);
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

    // === Gestion spécifique des questions à saisie multiple obligatoire ===
    // (multiple-short-txt, type Q)
    //
    // RGAA 11.10 + 11.11 — Approche « compteur global » :
    //   • Pas de rouge individuel sur les champs vides (seulement pour erreur de format)
    //   • Un message global dynamique avec compteur de champs restants
    //   • Feedback vert discret sur les champs remplis
    //   • aria-live="polite" pour annoncer la progression aux lecteurs d'écran

    /**
     * Gère les erreurs pour les questions à saisie multiple obligatoire.
     * Affiche un message global avec compteur au lieu d'une erreur par champ.
     */
    function handleMultipleShortTextErrors() {
        const multipleQuestions = document.querySelectorAll('.question-container.multiple-short-txt');

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

            // Insérer le compteur après la liste de réponses (avant question-valid-container)
            var answersList = question.querySelector('.ls-answers, .subquestion-list');
            if (answersList) {
                answersList.parentNode.insertBefore(counterContainer, answersList.nextSibling);
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

    // === RGAA 11.10 — Synchronisation aria-invalid avec les classes d'erreur ===

    /**
     * MutationObserver global qui synchronise aria-invalid="true" sur les inputs
     * chaque fois que la classe fr-input--error ou error est ajoutée/retirée.
     * Couvre tous les cas : transformErrorsToDsfr, handleMultipleShortTextErrors,
     * validateAndUpdateState, handlers radio/checkbox, validations numériques, etc.
     */
    function initAriaInvalidSync() {
        // Synchronise aria-invalid sur les champs de formulaire en fonction
        // des classes d'erreur, que l'erreur soit sur le champ lui-même
        // (input.error, .fr-input--error) ou sur un conteneur parent
        // (.question-container.input-error, .fr-input-group--error).

        function syncAriaInvalidInContainer(container, hasError) {
            var fields = container.querySelectorAll('input, textarea, select');
            fields.forEach(function(field) {
                // Ignorer les champs cachés (hidden, disabled, java*)
                if (field.type === 'hidden' || field.id && field.id.indexOf('java') === 0) return;
                if (hasError) {
                    field.setAttribute('aria-invalid', 'true');
                } else {
                    field.removeAttribute('aria-invalid');
                }
            });
        }

        // 1. Traiter les champs déjà en erreur au chargement
        // Champs individuels en erreur
        document.querySelectorAll('.fr-input--error, input.error, textarea.error, select.error').forEach(function(input) {
            input.setAttribute('aria-invalid', 'true');
        });
        // Conteneurs en erreur (radio, checkbox, tableaux, etc.)
        document.querySelectorAll('.question-container.input-error, .fr-input-group--error').forEach(function(container) {
            syncAriaInvalidInContainer(container, true);
        });

        // 2. Observer les changements de classe sur les champs ET les conteneurs
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') return;
                var el = mutation.target;

                // Cas 1 : changement directement sur un champ de formulaire
                if (el.matches('input, textarea, select')) {
                    var hasError = el.classList.contains('fr-input--error') || el.classList.contains('error');
                    if (hasError) {
                        el.setAttribute('aria-invalid', 'true');
                    } else {
                        el.removeAttribute('aria-invalid');
                    }
                }

                // Cas 2 : changement sur un conteneur de question
                if (el.classList && el.classList.contains('question-container')) {
                    var containerError = el.classList.contains('input-error');
                    syncAriaInvalidInContainer(el, containerError);
                }

                // Cas 3 : changement sur un fr-input-group (radios, checkboxes)
                if (el.classList && el.classList.contains('fr-input-group')) {
                    var groupError = el.classList.contains('fr-input-group--error');
                    syncAriaInvalidInContainer(el, groupError);
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
    }

    // Initialiser la transformation des erreurs au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            transformErrorsToDsfr();
            handleMultipleShortTextErrors();
            observeErrorChanges();
            initAriaInvalidSync();
            // Créer le récapitulatif si des erreurs sont déjà présentes au chargement
            setTimeout(createErrorSummary, 100);
        });
    } else {
        transformErrorsToDsfr();
        handleMultipleShortTextErrors();
        observeErrorChanges();
        initAriaInvalidSync();
        // Créer le récapitulatif si des erreurs sont déjà présentes au chargement
        setTimeout(createErrorSummary, 100);
    }

    // Réinitialiser après événements LimeSurvey
    document.addEventListener('limesurvey:questionsLoaded', function() {
        transformErrorsToDsfr();
        handleMultipleShortTextErrors();
        setTimeout(createErrorSummary, 100);
    });

    // Réinitialiser après soumission de formulaire (en cas de validation côté serveur)
    document.addEventListener('DOMContentLoaded', function() {
        const forms = document.querySelectorAll('form#limesurvey, form[name="limesurvey"]');
        forms.forEach(function(form) {
            form.addEventListener('submit', function() {
                // Attendre que LimeSurvey affiche les erreurs
                setTimeout(function() {
                    transformErrorsToDsfr();
                    createErrorSummary();
                }, 500);
            });
        });
    });

    // === Récapitulatif d'erreurs en haut de page ===

    /**
     * Crée un récapitulatif DSFR des erreurs en haut de page
     * avec liens ancrés vers chaque champ en erreur
     */
    function createErrorSummary() {

        // Supprimer l'ancien récapitulatif s'il existe
        const oldSummary = document.getElementById('dsfr-error-summary');
        if (oldSummary) {
            oldSummary.remove();
        }

        // Trouver toutes les questions en erreur
        const errorQuestions = document.querySelectorAll('.question-container.input-error, .question-container.fr-input-group--error');

        if (errorQuestions.length === 0) {
            return;
        }


        // Construire la liste des erreurs
        const errorList = [];
        errorQuestions.forEach(function(question) {
            const questionId = question.id;

            // Trouver le texte de la question
            const questionTextElement = question.querySelector('.ls-label-question, .question-text');
            let questionText = questionTextElement ? questionTextElement.textContent.trim() : 'Question sans titre';

            // Trouver le numéro de question si disponible
            const questionNumberElement = question.querySelector('.question-number');
            let questionNumber = questionNumberElement ? questionNumberElement.textContent.trim() : '';

            // Trouver le message d'erreur DSFR
            const errorMessageElement = question.querySelector('.fr-message--error');
            let errorMessage = errorMessageElement ? errorMessageElement.textContent.trim() : '';

            // Construire le label avec question + erreur (sans numéro)
            let label = questionText;

            // Ajouter le message d'erreur
            if (errorMessage) {
                label += ' : ' + errorMessage;
            }

            // Limiter la longueur du texte pour le récapitulatif
            if (label.length > 150) {
                label = label.substring(0, 147) + '...';
            }

            errorList.push({
                id: questionId,
                label: label
            });
        });

        // Créer l'alerte DSFR
        const summary = document.createElement('div');
        summary.id = 'dsfr-error-summary';
        summary.className = 'fr-alert fr-alert--error fr-mb-4w';
        summary.setAttribute('role', 'alert');
        summary.setAttribute('tabindex', '-1');

        // Construire le HTML
        let html = '<h3 class="fr-alert__title">';
        html += errorList.length === 1 ? 'Une erreur a été détectée' : errorList.length + ' erreurs ont été détectées';
        html += '</h3>';
        html += '<p>Veuillez corriger les erreurs suivantes :</p>';
        html += '<ul class="fr-mb-0">';

        errorList.forEach(function(error) {
            html += '<li class="error-item" data-question-id="' + error.id + '">';
            html += '<a href="#' + error.id + '" class="fr-link fr-icon-error-warning-line fr-link--icon-left">' + error.label + '</a>';
            html += '</li>';
        });

        html += '</ul>';

        summary.innerHTML = html;

        // Ajouter des listeners sur les liens pour scroller proprement
        summary.querySelectorAll('a[href^="#"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Scroller vers la question
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Focus le premier input de la question
                    setTimeout(function() {
                        const firstInput = targetElement.querySelector('.fr-input, input, textarea, select');
                        if (firstInput) {
                            firstInput.focus();
                        }
                    }, 300);
                }
            });
        });

        // Insérer le récapitulatif en haut de la page de questions
        // Trouver le conteneur approprié
        const questionContainer = document.querySelector('.questions-container, .survey-question-container, #question-container, .question-container');
        const firstQuestion = document.querySelector('.question-container');

        if (questionContainer && questionContainer.parentNode) {
            // Insérer avant le conteneur de questions
            questionContainer.parentNode.insertBefore(summary, questionContainer);
        } else if (firstQuestion && firstQuestion.parentNode) {
            // Insérer avant la première question
            firstQuestion.parentNode.insertBefore(summary, firstQuestion);
        } else {
            // Fallback : insérer au début du formulaire
            const form = document.querySelector('form#limesurvey, form[name="limesurvey"]');
            if (form) {
                form.insertBefore(summary, form.firstChild);
            }
        }

        // Scroller vers le récapitulatif et le focuser pour l'accessibilité
        setTimeout(function() {
            summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
            summary.focus();
        }, 100);
    }

    /**
     * Met à jour le récapitulatif d'erreurs de manière progressive
     * - Marque les erreurs corrigées en vert
     * - Passe de error → warning → success selon l'état
     */
    function updateErrorSummary() {
        const summary = document.getElementById('dsfr-error-summary');
        if (!summary) {
            return; // Pas de récapitulatif à mettre à jour
        }


        // Récupérer toutes les lignes d'erreur dans le récapitulatif
        const errorItems = summary.querySelectorAll('.error-item');

        let totalErrors = errorItems.length;
        let correctedCount = 0;

        // Pour chaque ligne, vérifier si la question est encore en erreur
        errorItems.forEach(function(item) {
            const questionId = item.getAttribute('data-question-id');
            const question = document.getElementById(questionId);

            if (!question) return;

            // Vérifier si la question est encore en erreur
            const isError = question.classList.contains('input-error');
            const isValid = question.classList.contains('input-valid');

            // Vérifier aussi si tous les inputs de la question sont valides
            const inputs = question.querySelectorAll('.fr-input, input[type="text"], input[type="number"], textarea, select');
            let allInputsValid = inputs.length > 0;
            inputs.forEach(function(input) {
                if (input.classList.contains('fr-input--error') || !input.value || input.value.trim() === '') {
                    allInputsValid = false;
                }
            });

            if ((isValid && !isError) || allInputsValid) {
                // Question corrigée → changer l'icône du lien
                if (!item.classList.contains('corrected')) {
                    item.classList.add('corrected');
                    const link = item.querySelector('a');
                    if (link) {
                        // Remplacer l'icône d'erreur par l'icône de validation
                        link.classList.remove('fr-icon-error-warning-line');
                        link.classList.add('fr-icon-checkbox-circle-line');
                    }
                }
                correctedCount++;
            }
        });


        // Mettre à jour le type d'alerte selon l'état
        const title = summary.querySelector('.fr-alert__title');
        const description = summary.querySelector('p');

        if (correctedCount === totalErrors) {
            // Toutes les erreurs corrigées → SUCCESS
            summary.className = 'fr-alert fr-alert--success fr-mb-4w';
            if (title) {
                title.textContent = 'Toutes les erreurs ont été corrigées !';
            }
            if (description) {
                description.textContent = 'Vous pouvez maintenant soumettre le formulaire.';
            }
        } else if (correctedCount > 0) {
            // Au moins une erreur corrigée → WARNING
            summary.className = 'fr-alert fr-alert--warning fr-mb-4w';
            if (title) {
                const remaining = totalErrors - correctedCount;
                title.textContent = remaining + ' erreur' + (remaining > 1 ? 's' : '') + ' restante' + (remaining > 1 ? 's' : '');
            }
            if (description) {
                description.textContent = 'Continuez à corriger les erreurs suivantes :';
            }
        }
        // Sinon on reste en error (pas de changement)
    }

    // Observer les changements du DOM pour recréer le récapitulatif si nécessaire
    // (par exemple après une validation AJAX)
    const errorSummaryObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Si une question passe en erreur
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('question-container') && target.classList.contains('input-error')) {
                    setTimeout(createErrorSummary, 100);
                }
            }
        });
    });

    // Démarrer l'observation
    if (document.body) {
        errorSummaryObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
    }

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

            // Fonction de validation numérique
            function isValidNumber(value) {
                return /^-?\d+([.,]\d*)?$/.test(value) || /^-?\d*[.,]\d+$/.test(value);
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
     * Initialise le système de liaison des questions conditionnelles
     */
    function initConditionalQuestionsAria() {
        // Trouver toutes les questions avec attribut data-relevance
        const conditionalQuestions = document.querySelectorAll('[data-relevance]');

        if (conditionalQuestions.length === 0) {
            return;
        }

        // Traiter chaque question conditionnelle
        conditionalQuestions.forEach(questionElement => {
            try {
                processConditionalQuestion(questionElement);
            } catch (error) {
                // Silently ignore errors in production
            }
        });
    }

    /**
     * Observer pour détecter les nouvelles questions ajoutées dynamiquement
     * (utile si LimeSurvey charge des questions via AJAX)
     */
    function setupConditionalQuestionsObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Si le noeud ajouté est une question conditionnelle
                        if (node.hasAttribute && node.hasAttribute('data-relevance')) {
                            processConditionalQuestion(node);
                        }
                        // Ou si le noeud contient des questions conditionnelles
                        const conditionalQuestions = node.querySelectorAll && node.querySelectorAll('[data-relevance]');
                        if (conditionalQuestions && conditionalQuestions.length > 0) {
                            conditionalQuestions.forEach(processConditionalQuestion);
                        }
                    }
                });
            });
        });

        // Observer les changements dans le conteneur principal du questionnaire
        const surveyContainer = document.getElementById('limesurvey') || document.body;
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

        // Observer les changements de style et de classe sur les questions conditionnelles
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                var el = mutation.target;
                // Ne traiter que les conteneurs de questions conditionnelles
                if (!el.classList || !el.classList.contains('question-container')) return;
                if (!el.hasAttribute('data-relevance')) return;

                if (mutation.type === 'attributes') {
                    var isHidden = el.style.display === 'none' ||
                                   el.classList.contains('ls-irrelevant') ||
                                   el.classList.contains('ls-hidden') ||
                                   el.classList.contains('d-none');

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

        // Observer toutes les questions conditionnelles
        var conditionalQuestions = document.querySelectorAll('[data-relevance]');
        conditionalQuestions.forEach(function(q) {
            // Ajouter aria-live="polite" sur chaque conteneur conditionnel (RGAA 7.4.1)
            if (!q.hasAttribute('aria-live')) {
                q.setAttribute('aria-live', 'polite');
            }

            // Initialiser l'état courant
            var isCurrentlyHidden = q.style.display === 'none' ||
                                    q.classList.contains('ls-irrelevant') ||
                                    q.classList.contains('ls-hidden') ||
                                    q.classList.contains('d-none');
            q.dataset.conditionalWasHidden = isCurrentlyHidden ? 'true' : 'false';

            observer.observe(q, {
                attributes: true,
                attributeFilter: ['style', 'class']
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
        });
    } else {
        // DOM déjà chargé
        initConditionalQuestionsAria();
        setupConditionalQuestionsObserver();
        initConditionalVisibilityNotifier();
    }

})();

/* ============================================
   IMAGES - Lazy loading automatique et accessibilité
   ============================================ */

(function() {
    'use strict';

    /**
     * Ajoute loading="lazy" et alt si manquant à toutes les images dans les réponses
     */
    function enableImageLazyLoading() {
        // Sélectionner toutes les images dans les réponses et le texte des questions
        const imageSelectors = [
            '.answer-item img',
            '.fr-fieldset__content img',
            '.answertext img',
            '.fr-checkbox-group img',
            '.fr-radio-group img',
            '.question-text-container img',
            '.ls-question-text img',
            '.ls-question-help img'
        ];

        const images = document.querySelectorAll(imageSelectors.join(', '));

        images.forEach(function(img) {
            // Ajouter loading="lazy" si pas déjà présent
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }

            // Ajouter alt si manquant (accessibilité RGAA)
            if (!img.hasAttribute('alt') || img.getAttribute('alt').trim() === '') {
                // Essayer d'utiliser le title si disponible, sinon texte par défaut
                const altText = img.hasAttribute('title') && img.getAttribute('title').trim() !== ''
                    ? img.getAttribute('title')
                    : 'Image de réponse';
                img.setAttribute('alt', altText);
            }

            // Optionnel : Ajouter une classe pour styling
            if (!img.classList.contains('dsfr-enhanced-image')) {
                img.classList.add('dsfr-enhanced-image');
            }
        });
    }

    // Exécuter au chargement initial
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enableImageLazyLoading);
    } else {
        enableImageLazyLoading();
    }

    // Réexécuter si contenu AJAX chargé (questions conditionnelles, etc.)
    document.addEventListener('limesurvey:questionsLoaded', enableImageLazyLoading);

})();

/* ============================================
   RGAA 7.5 / 11.1 — Association des tips de validation (ls-questionhelp)
   aux champs de saisie via aria-describedby
   ============================================

   Le core LimeSurvey génère, pour chaque champ avec contrainte de saisie, un
   tip descriptif dans un <div class="ls-questionhelp" id="vmsg_<qid>">. Ce tip
   est affiché visuellement sous la question mais n'est pas lié sémantiquement
   au champ (pas de aria-describedby côté core).

   Cet IIFE étend l'attribut aria-describedby de chaque input/textarea/select
   de la question pour y inclure l'id du tip. Les lecteurs d'écran annoncent
   ainsi la contrainte quand l'utilisateur focus le champ, sans interruption
   parasite au chargement.

   Le role="alert" du core a parallèlement été supprimé de help.twig
   (override dans views/survey/questions/question_help/help.twig). */

(function() {
    'use strict';

    function extendDescribedByForValidationTips() {
        var tips = document.querySelectorAll('.ls-questionhelp[id^="vmsg_"]');
        tips.forEach(function(tip) {
            if (tip.dataset.describedbyWired === '1') return;

            var question = tip.closest('[id^="question"]');
            if (!question) return;

            var fields = question.querySelectorAll('input, textarea, select');
            fields.forEach(function(field) {
                if (field.type === 'hidden') return;
                var existing = field.getAttribute('aria-describedby') || '';
                var ids = existing.split(/\s+/).filter(Boolean);
                if (ids.indexOf(tip.id) === -1) {
                    ids.push(tip.id);
                    field.setAttribute('aria-describedby', ids.join(' '));
                }
            });

            tip.dataset.describedbyWired = '1';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', extendDescribedByForValidationTips);
    } else {
        extendDescribedByForValidationTips();
    }

    // Réexécuter si contenu AJAX chargé (questions conditionnelles, etc.)
    document.addEventListener('limesurvey:questionsLoaded', extendDescribedByForValidationTips);
})();

/* ============================================
   RGAA 7.4 — inputmode="numeric" sur les champs numériques
   ============================================

   Le core LimeSurvey rend les champs "numbers only" comme des
   <input type="text" data-number="1"> (via Twig direct ou helpers Yii).
   Sans indication de la nature du champ, l'utilisateur (et les AT)
   ne savent pas que la saisie sera restreinte aux chiffres jusqu'à
   ce qu'un message d'erreur apparaisse.

   Cet IIFE ajoute inputmode="numeric" sur tous les inputs avec
   data-number="1" pour :
   - Déclencher le clavier numérique sur mobile (meilleure UX)
   - Signaler aux AT la nature numérique du champ
   - Préserver la compatibilité avec la validation JS existante
     (virgule, décimales, signe négatif gérés par theme.js)

   Choix de inputmode="numeric" vs type="number" : type="number" a
   des bugs connus (notation scientifique, roulette souris, locale)
   et n'est pas recommandé par WCAG/gov.uk. inputmode reste sur un
   type="text" plus prévisible.

   Le message explicite demandé par l'audit est déjà fourni via :
   - Le tip statique ls-questionhelp (cf. fix #17, lié via aria-describedby)
   - Le message d'erreur dynamique "Seuls des nombres..." (theme.js::validateNumberInput)
*/

(function() {
    'use strict';

    function addInputmodeNumericToNumericFields() {
        var numericInputs = document.querySelectorAll('input[data-number="1"]');
        numericInputs.forEach(function(input) {
            if (input.dataset.inputmodeWired === '1') return;
            if (!input.hasAttribute('inputmode')) {
                input.setAttribute('inputmode', 'numeric');
            }
            input.dataset.inputmodeWired = '1';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addInputmodeNumericToNumericFields);
    } else {
        addInputmodeNumericToNumericFields();
    }

    document.addEventListener('limesurvey:questionsLoaded', addInputmodeNumericToNumericFields);
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
     * i18n minimal pour le module ranking.
     *
     * Détecte la langue de la page via <html lang="..">. Si non préfixée par "en"
     * (détection simple sur les 2 premiers caractères), renvoie la version française.
     * Gère l'interpolation d'un label via le placeholder %s.
     *
     * Les clés restent ajoutables au fil de l'eau pour couvrir les chaînes actuellement
     * hardcodées dans le module.
     */
    var RANKING_I18N_FR = {
        ranking_actions_for:  'Actions pour %s',
        ranking_add:          'Ajouter au classement',
        ranking_add_aria:     'Ajouter %s au classement',
        ranking_up:           'Monter',
        ranking_up_aria:      'Monter %s',
        ranking_down:         'Descendre',
        ranking_down_aria:    'Descendre %s',
        ranking_remove:       'Retirer',
        ranking_remove_aria:  'Retirer %s du classement'
    };
    var RANKING_I18N_EN = {
        ranking_actions_for:  'Actions for %s',
        ranking_add:          'Add to ranking',
        ranking_add_aria:     'Add %s to ranking',
        ranking_up:           'Move up',
        ranking_up_aria:      'Move %s up',
        ranking_down:         'Move down',
        ranking_down_aria:    'Move %s down',
        ranking_remove:       'Remove',
        ranking_remove_aria:  'Remove %s from ranking'
    };

    function tRanking(key, label) {
        var lang = (document.documentElement.lang || 'fr').toLowerCase().substring(0, 2);
        var dict = (lang === 'en') ? RANKING_I18N_EN : RANKING_I18N_FR;
        var str = dict[key] || RANKING_I18N_FR[key] || key;
        if (typeof label !== 'undefined') {
            str = str.replace('%s', label);
        }
        return str;
    }

    // ---- i18n pour les messages de compteur champs obligatoires ----

    var MANDATORY_I18N_FR = {
        fields_remaining_plural: 'Veuillez compléter les %remaining% champs restants sur %total%.',
        fields_remaining_singular: 'Veuillez compléter le dernier champ.',
        fields_all_required: 'Veuillez compléter tous les champs (%total% champs requis).',
        field_valid: 'Saisie valide',
        numeric_only: "Ce champ n'accepte que des valeurs numériques."
    };
    var MANDATORY_I18N_EN = {
        fields_remaining_plural: 'Please complete the remaining %remaining% of %total% fields.',
        fields_remaining_singular: 'Please complete the last field.',
        fields_all_required: 'Please complete all fields (%total% fields required).',
        field_valid: 'Valid input',
        numeric_only: 'This field only accepts numeric values.'
    };

    function tMandatory(key, remaining, total) {
        var lang = (document.documentElement.lang || 'fr').toLowerCase().substring(0, 2);
        var dict = (lang === 'en') ? MANDATORY_I18N_EN : MANDATORY_I18N_FR;
        var str = dict[key] || MANDATORY_I18N_FR[key] || key;
        if (typeof remaining !== 'undefined') {
            str = str.replace('%remaining%', remaining);
        }
        if (typeof total !== 'undefined') {
            str = str.replace('%total%', total);
        }
        return str;
    }

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

(function() {
    'use strict';

    function reorderListRadioNoAnswer() {
        var questions = document.querySelectorAll('.list-radio.question-container');
        questions.forEach(function(q) {
            if (q.dataset.listradioReordered === '1') return;

            var noAnswerRadio = q.querySelector('input[type="radio"][value=""]');
            if (!noAnswerRadio) return;

            var noAnswerRow = noAnswerRadio.closest('.fr-fieldset__element');
            if (!noAnswerRow) return;

            var content = noAnswerRow.parentNode;
            if (content && content.firstElementChild !== noAnswerRow) {
                content.insertBefore(noAnswerRow, content.firstElementChild);
            }

            // Déterminer l'état par défaut pour la cible Tab du radiogroup.
            // Comportement natif HTML : Tab cible le radio checked, ou le
            // premier radio en DOM order si aucun n'est checked.
            //
            // Règle pragmatique appliquée (RGAA 12.9 + UX) :
            //   1. Si aucun radio coché → cocher "Sans réponse" (défaut propre)
            //   2. Si "Autre" est coché MAIS le champ texte est vide → état
            //      incomplet (l'utilisateur a cliqué sans finir sa saisie),
            //      on reset sur "Sans réponse" pour éviter d'avoir un focus
            //      par défaut sur un état non-terminé
            //   3. Sinon (réponse complète ou "Sans réponse" déjà coché)
            //      → on respecte l'état serveur
            var allRadios = q.querySelectorAll('input[type="radio"][name="' + noAnswerRadio.name + '"]');
            var anyChecked = Array.prototype.some.call(allRadios, function(r) { return r.checked; });

            var otherRadio = q.querySelector('input[type="radio"][id^="SOTH"]');
            var isIncompleteOther = false;
            if (otherRadio && otherRadio.checked) {
                var otherText = q.querySelector('[id$="othertext"]');
                if (otherText && otherText.value.trim() === '') {
                    isIncompleteOther = true;
                }
            }

            if (!anyChecked || isIncompleteOther) {
                // Décocher explicitement tous les radios du groupe, puis cocher
                // "Sans réponse". Nécessaire de décocher "Autre" d'abord car
                // sinon l'attribut checked persiste sur le radio même si la
                // property .checked est réassignée.
                allRadios.forEach(function(r) {
                    r.checked = false;
                    r.removeAttribute('checked');
                });
                noAnswerRadio.checked = true;
                noAnswerRadio.setAttribute('checked', 'checked');

                // Mettre à jour le hidden java input pour rester cohérent
                // avec la nouvelle sélection (LS Expression Manager s'en sert).
                var javaInput = q.querySelector('input[type="hidden"][id^="java"]');
                if (javaInput) {
                    javaInput.value = '';
                }

                // Réinitialiser l'aria-expanded sur "Autre" puisqu'il n'est
                // plus sélectionné (cohérence avec le handler du twig)
                if (otherRadio) {
                    otherRadio.setAttribute('aria-expanded', 'false');
                }
            }

            q.dataset.listradioReordered = '1';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', reorderListRadioNoAnswer);
    } else {
        reorderListRadioNoAnswer();
    }

    document.addEventListener('limesurvey:questionsLoaded', reorderListRadioNoAnswer);
})();

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
    });
    $("[id^='question']").on('relevance:off', function(event, data) {
        if (event.target != this) return;
        $(this).addClass("ls-irrelevant ls-hidden");
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

/**
 * === Nettoyage du contenu RTE pour conformité DSFR ===
 *
 * Supprime uniquement les styles inline de mise en forme ajoutés par les contributeurs
 * via l'éditeur de texte riche (RTE) de LimeSurvey.
 * Conserve les styles fonctionnels injectés par JavaScript.
 *
 * Cette fonctionnalité est contrôlée par l'option de thème "sanitize_rte_content"
 */
(function() {
    'use strict';

    // Styles de mise en forme à supprimer (typiquement ajoutés par le RTE)
    const RTE_STYLE_PROPERTIES = [
        'color',
        'background-color',
        'background',
        'font-size',
        'font-family',
        'font-weight',
        'font-style',
        'text-decoration',
        'text-align',
        'line-height',
        'letter-spacing',
        'text-transform',
        'text-indent',
        'margin',
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'padding',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'border',
        'border-color',
        'border-width',
        'border-style'
    ];

    // Styles fonctionnels à conserver (typiquement injectés par JS)
    // display, visibility, position, top, left, right, bottom, width, height,
    // transform, opacity, z-index, overflow, etc.

    // Éléments à traiter (uniquement titre et aide des questions)
    const RTE_CONTENT_SELECTORS = [
        '.question-title-container',
        '.question-help-container'
    ];

    /**
     * Vérifie si un élément doit être exclu du nettoyage
     */
    function shouldSkipElement(element) {
        if (!element) return true;

        // Exclure les astérisques des questions obligatoires
        if (element.classList && (
            element.classList.contains('required-asterisk') ||
            element.classList.contains('asterisk')
        )) return true;

        // Exclure les images
        if (element.tagName === 'IMG') return true;

        // Exclure les éléments contenant des images
        if (element.querySelector && element.querySelector('img')) return true;

        // Exclure les éléments liés aux fichiers/upload
        if (element.closest && element.closest('[class*="upload"]')) return true;
        if (element.closest && element.closest('[class*="file"]')) return true;

        return false;
    }

    /**
     * Nettoie les styles de mise en forme d'un élément
     * Conserve les styles fonctionnels (display, visibility, position, etc.)
     */
    function sanitizeElementStyles(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

        // Vérifier si l'élément doit être exclu
        if (shouldSkipElement(element)) return;

        // Si pas de style inline, rien à faire
        if (!element.hasAttribute('style')) return;

        // Supprimer uniquement les propriétés de mise en forme
        RTE_STYLE_PROPERTIES.forEach(prop => {
            element.style.removeProperty(prop);
        });

        // Si le style est maintenant vide, supprimer l'attribut
        if (element.getAttribute('style') === '' || element.style.cssText.trim() === '') {
            element.removeAttribute('style');
        }
    }

    /**
     * Supprime les attributs HTML obsolètes de mise en forme
     */
    function removeDeprecatedAttributes(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
        if (shouldSkipElement(element)) return;

        // Attributs HTML obsolètes de mise en forme
        ['align', 'bgcolor', 'color', 'face', 'size'].forEach(attr => {
            if (element.hasAttribute(attr)) {
                element.removeAttribute(attr);
            }
        });
    }

    /**
     * Nettoie récursivement un élément et ses enfants
     * Ne supprime que les styles de mise en forme, conserve les classes et styles fonctionnels
     */
    function sanitizeTree(root) {
        if (!root) return;

        // Nettoyer l'élément racine
        sanitizeElementStyles(root);

        // Nettoyer tous les enfants
        const children = root.querySelectorAll('*');
        children.forEach(child => {
            sanitizeElementStyles(child);
        });
    }

    /**
     * Exécute le nettoyage sur tout le contenu RTE de la page
     */
    function sanitizeRTEContent() {
        // Vérifier si l'option est activée via une variable globale
        // Cette variable sera définie dans le template Twig
        if (typeof window.LSThemeOptions === 'undefined' ||
            window.LSThemeOptions.sanitize_rte_content !== 'on') {
            return;
        }

        console.log('[DSFR] Nettoyage du contenu RTE...');

        RTE_CONTENT_SELECTORS.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    sanitizeTree(element);
                });
            } catch (e) {
                // Ignorer les erreurs de sélecteur invalide
            }
        });

        console.log('[DSFR] Contenu RTE nettoyé');
    }

    // Exécuter au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sanitizeRTEContent);
    } else {
        sanitizeRTEContent();
    }

    // Réexécuter après navigation AJAX (pjax)
    if (typeof $ !== 'undefined') {
        $(document).on('pjax:complete', function() {
            setTimeout(sanitizeRTEContent, 100);
        });
    }

    // Exposer la fonction pour usage externe si nécessaire
    window.DSFRSanitizeRTEContent = sanitizeRTEContent;

})();

/* ============================================
   TABLEAUX — Correction accessibilité post-rendu (RGAA 5.5, 5.6)
   ============================================ */

(function() {
    'use strict';

    /**
     * Corrige l'accessibilité des tableaux dont le HTML est généré par le core PHP
     * (5point, 10point, yesnouncertain, multiflexi, texts).
     *
     * - RGAA 5.5 : ajoute scope="row" sur les <th> de ligne qui n'en ont pas
     * - RGAA 5.6 : ajoute l'attribut headers sur les <td> des tableaux à double entrée
     */
    function fixTableAccessibility() {
        // Cibler tous les tableaux de questions LimeSurvey
        var tables = document.querySelectorAll('.ls-answers table, .ls-table-wrapper table, .fr-table table');

        tables.forEach(function(table) {
            // --- RGAA 5.5 : scope="row" sur les th de tbody ---
            var tbodyRows = table.querySelectorAll('tbody tr');
            tbodyRows.forEach(function(tr) {
                var th = tr.querySelector('th');
                if (th && !th.hasAttribute('scope')) {
                    th.setAttribute('scope', 'row');
                }
            });

            // --- RGAA 5.5 : scope="col" sur les th de thead ---
            var theadThs = table.querySelectorAll('thead th');
            theadThs.forEach(function(th) {
                if (!th.hasAttribute('scope')) {
                    th.setAttribute('scope', 'col');
                }
            });

            // --- RGAA 5.6 : headers sur les td des tableaux à double entrée ---
            // Un tableau à double entrée a des th en colonne ET en ligne
            var hasColHeaders = table.querySelectorAll('thead th[id]').length > 0;
            var hasRowHeaders = table.querySelectorAll('tbody th[id]').length > 0;

            if (hasColHeaders && hasRowHeaders) {
                // Collecter les id des th de colonne (dans l'ordre)
                var colHeaderIds = [];
                var headerRow = table.querySelector('thead tr:last-child');
                if (headerRow) {
                    var thIndex = 0;
                    headerRow.querySelectorAll('th').forEach(function(th) {
                        if (th.id) {
                            colHeaderIds[thIndex] = th.id;
                        }
                        thIndex++;
                    });
                }

                // Pour chaque ligne du tbody, associer les td à leurs headers
                tbodyRows.forEach(function(tr) {
                    var rowTh = tr.querySelector('th[id]');
                    if (!rowTh) return;

                    var rowHeaderId = rowTh.id;
                    var cellIndex = 0;

                    tr.querySelectorAll('td, th').forEach(function(cell) {
                        if (cell.tagName === 'TH') {
                            cellIndex++;
                            return;
                        }
                        // Ne pas écraser les headers existants
                        if (!cell.hasAttribute('headers') && colHeaderIds[cellIndex]) {
                            cell.setAttribute('headers', rowHeaderId + ' ' + colHeaderIds[cellIndex]);
                        }
                        cellIndex++;
                    });
                });
            }

            // --- Cas des tableaux sans id sur les th : en ajouter ---
            // Pour les tableaux générés par le core PHP (5point, 10point, yesnouncertain)
            var needsIds = false;
            var allTheadThs = table.querySelectorAll('thead th');
            var allTbodyThs = table.querySelectorAll('tbody th');

            // Vérifier s'il y a des th sans id
            allTheadThs.forEach(function(th) {
                if (!th.id && th.textContent.trim()) needsIds = true;
            });
            allTbodyThs.forEach(function(th) {
                if (!th.id && th.textContent.trim()) needsIds = true;
            });

            if (needsIds) {
                // Générer un préfixe unique basé sur la position du tableau
                var tableId = table.id || 'tbl-' + Math.random().toString(36).substr(2, 6);

                // Ajouter des id sur les th de colonne
                var colIds = [];
                allTheadThs.forEach(function(th, i) {
                    if (!th.id && th.textContent.trim()) {
                        th.id = tableId + '-col-' + i;
                    }
                    colIds[i] = th.id || null;
                });

                // Ajouter des id sur les th de ligne et headers sur les td
                tbodyRows.forEach(function(tr) {
                    var th = tr.querySelector('th');
                    if (!th) return;

                    if (!th.id && th.textContent.trim()) {
                        var rowName = tr.id || 'row-' + Math.random().toString(36).substr(2, 6);
                        th.id = tableId + '-' + rowName;
                    }

                    if (!th.id) return;

                    var cellIndex = 0;
                    tr.querySelectorAll('td, th').forEach(function(cell) {
                        if (cell.tagName === 'TH') {
                            cellIndex++;
                            return;
                        }
                        if (!cell.hasAttribute('headers') && colIds[cellIndex]) {
                            cell.setAttribute('headers', th.id + ' ' + colIds[cellIndex]);
                        }
                        cellIndex++;
                    });
                });
            }
        });
    }

    // Lancer au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixTableAccessibility);
    } else {
        fixTableAccessibility();
    }

    // Relancer après navigation AJAX
    document.addEventListener('limesurvey:questionsLoaded', function() {
        setTimeout(fixTableAccessibility, 200);
    });

})();
