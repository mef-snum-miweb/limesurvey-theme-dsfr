/**
 * JavaScript pour le thème DSFR
 * Système de Design de l'État Français
 */

(function() {
    'use strict';


    // ============================================
    // CHARGEMENT DU DSFR - RESSOURCES LOCALES
    // ============================================

    // Charger le JS DSFR depuis les ressources locales
    // Les fichiers sont dans le dossier js/
    // Trouver l'URL du thème en analysant le script actuel
    function getThemeUrl() {
        // Chercher le script theme.js actuel pour déduire le chemin
        const scripts = Array.from(document.scripts);
        for (const script of scripts) {
            if (script.src && script.src.includes('/theme.js')) {
                // Ex: http://host/tmp/assets/24f866ec/scripts/theme.js
                //  ou http://host/sub/themes/survey/<theme>/scripts/theme.js
                //  (mode debug LS, asset manager désactivé)
                return script.src.replace(/\/scripts\/theme\.js.*$/, '');
            }
        }

        // Fallback: chercher dans les CSS
        const styleSheets = Array.from(document.styleSheets);
        for (const sheet of styleSheets) {
            if (sheet.href && sheet.href.includes('/theme.css')) {
                return sheet.href.replace(/\/css\/theme\.css.*$/, '');
            }
        }

        // Fallback ultime
        return '';
    }

    const themeUrl = getThemeUrl();
    const dsfrPath = themeUrl + '/js/';

    const dsfrScript = document.createElement('script');
    dsfrScript.src = dsfrPath + 'dsfr.module.min.js';
    dsfrScript.type = 'module';
    document.head.appendChild(dsfrScript);

    // Version nomodule pour anciens navigateurs
    const dsfrScriptLegacy = document.createElement('script');
    dsfrScriptLegacy.src = dsfrPath + 'dsfr.nomodule.min.js';
    dsfrScriptLegacy.setAttribute('nomodule', '');
    document.head.appendChild(dsfrScriptLegacy);

    // ============================================
    // OBJETS REQUIS PAR LIMESURVEY
    // ============================================

    // Créer les objets que LimeSurvey attend
    window.ThemeScripts = window.ThemeScripts || {};
    window.basicThemeScripts = window.basicThemeScripts || {};

    // Initialiser basicThemeScripts avec TOUTES les méthodes requises
    window.basicThemeScripts.init = function() {
    };

    // Méthode initGlobal requise par LimeSurvey.
    // Volontairement vide : le vanilla y appelle
    // templateCore.hideQuestionWithRelevanceSubQuestion() — réimplémenté
    // dans src/relevance/relevance-jquery.js — et
    // templateCore.hideMultipleColumn(), qui masque une COLONNE (ul
    // .list-unstyled) de choix multiple quand tous ses items sont cachés
    // par relevance. Sans objet ici : le thème DSFR rend les choix
    // multiples dans UNE grille CSS (ls-columns), pas en listes par
    // colonne — chaque item masqué l'est individuellement (revue 2026-06, #33).
    window.basicThemeScripts.initGlobal = function() {
    };

    // Autres méthodes potentiellement requises
    window.basicThemeScripts.initTopMenuLanguageChanger = function() {};
    window.basicThemeScripts.initQuestionIndex = function() {};
    window.basicThemeScripts.initNavigator = function() {};

    /**
     * Activation du soft mandatory (obligatoire souple)
     * Fonction globale requise par LimeSurvey pour gérer le "Continuer sans répondre"
     * Appelée par bootstrap_alert_modal.twig via registerScript
     */
    window.activateSoftMandatory = function() {
        // Cette fonction est appelée par le template bootstrap_alert_modal.twig
        // Elle attache un handler sur le lien "Continuer sans répondre" de la modal
        var softMandatoryLink = document.getElementById('mandatory-soft-modal');
        if (softMandatoryLink) {
            // Retirer les anciens listeners pour éviter les doublons
            var newLink = softMandatoryLink.cloneNode(true);
            softMandatoryLink.parentNode.replaceChild(newLink, softMandatoryLink);

            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                handleSoftMandatoryClick();
            });
        }
    };

    /**
     * Handler pour le clic sur "Continuer sans répondre"
     * Extrait en fonction séparée pour être réutilisable par l'alerte DSFR
     */
    window.handleSoftMandatoryClick = function() {
        // Cocher toutes les cases soft mandatory
        var checkboxes = document.querySelectorAll('.ls-mandSoft-checkbox');
        checkboxes.forEach(function(checkbox) {
            checkbox.checked = true;
        });

        // Fermer l'alerte DSFR si elle existe
        var dsfrAlert = document.querySelector('.dsfr-validation-alert');
        if (dsfrAlert) {
            dsfrAlert.remove();
        }

        // Fermer la modal Bootstrap si elle existe encore
        var modal = document.getElementById('bootstrap-alert-box-modal');
        if (modal) {
            modal.classList.remove('show', 'in');
            modal.style.display = 'none';
        }

        // Retirer le backdrop
        var backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        document.body.classList.remove('modal-open');

        // Soumettre le formulaire après un court délai pour laisser les checkboxes se mettre à jour
        setTimeout(function() {
            var submitBtn = document.getElementById('ls-button-submit');
            if (submitBtn) {
                submitBtn.click();
            }
        }, 50);
    };

    /**
     * Changement de langue
     * Fonction globale pour gérer le changement de langue
     * IMPORTANT: Cette fonction attache un event listener, elle ne doit PAS changer la langue immédiatement
     */
    window.activateLanguageChanger = function() {
        const selects = document.querySelectorAll('select[name="lang"]');
        selects.forEach(function(select) {
            // Éviter de dupliquer les listeners
            if (select.dataset.langChangerAttached) {
                return;
            }
            select.dataset.langChangerAttached = 'true';

            // Écouter le changement (pas exécuter immédiatement !)
            select.addEventListener('change', function() {
                const targetUrl = this.getAttribute('data-targeturl');
                if (targetUrl && this.value) {
                    // Construire l'URL avec le paramètre lang
                    const separator = targetUrl.indexOf('?') > -1 ? '&' : '?';
                    window.location.href = targetUrl + separator + 'lang=' + this.value;
                }
            });

        });
    };

    // Initialisation après le chargement du DOM
    document.addEventListener('DOMContentLoaded', function() {

        // Initialiser les scripts de base
        if (window.basicThemeScripts && window.basicThemeScripts.init) {
            window.basicThemeScripts.init();
        }

        // Amélioration de l'accessibilité
        initAccessibility();

        // Gestion du thème clair/sombre (si configuré)
        initThemeToggle();

        // Fix pour les modales Bootstrap
        initBootstrapModalFallback();

        // Initialiser les questions de classement (ranking)
        initRankingQuestions();
    });

    /**
     * Amélioration de l'accessibilité
     */
    function initAccessibility() {
        // Ajouter des labels ARIA si manquants
        const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        inputs.forEach(function(input) {
            const label = input.closest('label') || document.querySelector('label[for="' + input.id + '"]');
            if (label && !input.getAttribute('aria-label')) {
                input.setAttribute('aria-label', label.textContent.trim());
            }
        });

        // Améliorer les boutons de navigation
        const navButtons = document.querySelectorAll('.survey-navigation button');
        navButtons.forEach(function(button) {
            if (!button.getAttribute('aria-label')) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });
    }

    /**
     * Gestion du thème clair/sombre DSFR
     */
    function initThemeToggle() {
        const THEME_KEY = 'dsfr-theme';
        const THEME_LIGHT = 'light';
        const THEME_DARK = 'dark';

        /**
         * Récupérer le thème actuel
         * Priorité: localStorage > préférence système > défaut (clair)
         */
        function getCurrentTheme() {
            // 1. Vérifier localStorage
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (savedTheme === THEME_LIGHT || savedTheme === THEME_DARK) {
                return savedTheme;
            }

            // 2. Vérifier préférence système
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return THEME_DARK;
            }

            // 3. Défaut: clair
            return THEME_LIGHT;
        }

        /**
         * Appliquer le thème au DOM
         */
        function applyTheme(theme) {
            const htmlElement = document.documentElement;

            if (theme === THEME_DARK) {
                htmlElement.setAttribute('data-fr-scheme', 'dark');
                htmlElement.classList.add('fr-scheme-dark');
                htmlElement.classList.remove('fr-scheme-light');
            } else {
                htmlElement.setAttribute('data-fr-scheme', 'light');
                htmlElement.classList.add('fr-scheme-light');
                htmlElement.classList.remove('fr-scheme-dark');
            }

            // Sauvegarder dans localStorage
            localStorage.setItem(THEME_KEY, theme);

        }

        /**
         * Basculer entre clair et sombre
         */
        function toggleTheme() {
            const currentTheme = getCurrentTheme();
            const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
            applyTheme(newTheme);
        }

        // Appliquer le thème au chargement
        const initialTheme = getCurrentTheme();
        applyTheme(initialTheme);

        // Gérer les boutons toggle (fallback si modale pas disponible ou pour usage direct)
        const toggleButtons = document.querySelectorAll('[aria-controls="fr-theme-modal"]');
        toggleButtons.forEach(function(button) {
            if (button) {
                // Si la modale n'existe pas, faire un toggle simple
                button.addEventListener('click', function(e) {
                    const modal = document.getElementById('fr-theme-modal');
                    if (!modal) {
                        // Fallback: toggle simple si pas de modale
                        e.preventDefault();
                        toggleTheme();
                    }
                    // Sinon, le DSFR gère l'ouverture de la modale automatiquement
                });
            }
        });

        // Gérer les changements dans la modale DSFR (si elle existe)
        const radios = document.querySelectorAll('input[name="fr-radios-theme"]');
        if (radios.length > 0) {
            radios.forEach(function(radio) {
                radio.addEventListener('change', function() {
                    if (this.checked) {
                        const selectedTheme = this.value;
                        if (selectedTheme === 'system') {
                            // Option système : utiliser la préférence OS
                            localStorage.setItem(THEME_KEY, 'system');
                            const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_DARK : THEME_LIGHT;
                            applyTheme(systemTheme);
                        } else {
                            // Thème explicite (light ou dark)
                            applyTheme(selectedTheme);
                        }
                    }
                });
            });

            // Mettre à jour l'état initial des radios selon la préférence actuelle
            const currentSavedTheme = localStorage.getItem(THEME_KEY);
            if (currentSavedTheme === 'system' || !currentSavedTheme) {
                const systemRadio = document.getElementById('fr-radios-theme-system');
                if (systemRadio) systemRadio.checked = true;
            } else if (currentSavedTheme === THEME_LIGHT) {
                const lightRadio = document.getElementById('fr-radios-theme-light');
                if (lightRadio) lightRadio.checked = true;
            } else if (currentSavedTheme === THEME_DARK) {
                const darkRadio = document.getElementById('fr-radios-theme-dark');
                if (darkRadio) darkRadio.checked = true;
            }
        }

        // Écouter les changements de préférence système
        // (uniquement si l'utilisateur a choisi "Système")
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                const saved = localStorage.getItem(THEME_KEY);
                // Ne réagir que si l'utilisateur a choisi "Système" ou n'a pas de préférence
                if (saved === 'system' || !saved) {
                    const newTheme = e.matches ? THEME_DARK : THEME_LIGHT;
                    applyTheme(newTheme);
                }
            });
        }

    }

    /**
     * Convertir les modales Bootstrap en alertes DSFR
     */
    function initBootstrapModalFallback() {

        /**
         * Vérifier si le contenu de la modale est valide
         */
        function isValidContent(content) {
            if (!content || content.length < 3) return false;
            // Exclure les contenus vides ou avec uniquement des espaces
            return content.trim().length > 0;
        }

        /**
         * Intercepter l'affichage de la modale Bootstrap
         */
        function interceptModalShow(modal) {
            // Ne pas intercepter les modales file-upload (elles doivent fonctionner)
            if (modal.classList.contains('file-upload-modal') ||
                modal.id.includes('file-upload') ||
                modal.querySelector('.uploader-frame')) {
                return; // Laisser le polyfill Bootstrap gérer cette modale
            }

            // Vérifier si la modale a du contenu
            const modalBody = modal.querySelector('.modal-body');
            if (!modalBody) {
                cleanupModal(modal);
                return;
            }

            const content = modalBody.textContent.trim();
            if (!isValidContent(content)) {
                cleanupModal(modal);
                return;
            }


            // Récupérer le titre
            const titleElement = modal.querySelector('.modal-title, .modal-header h4, .modal-header h5');
            const title = titleElement ? titleElement.textContent.trim() : '';

            // Détecter le type de modale : validation douce (soft mandatory) ou erreur simple
            const modalFooter = modal.querySelector('.modal-footer');
            const footerLinks = modalFooter ? modalFooter.querySelectorAll('a') : [];

            // Détecter si c'est une modale soft mandatory (a un lien avec id mandatory-soft-modal)
            const softMandatoryLink = modal.querySelector('#mandatory-soft-modal');
            const hasSoftMandatory = softMandatoryLink !== null;

            if (hasSoftMandatory) {
                // Modale soft mandatory - créer des actions spéciales
                const actions = [];

                footerLinks.forEach(function(link) {
                    const isSoftMandatoryAction = link.id === 'mandatory-soft-modal';
                    actions.push({
                        text: link.textContent.trim(),
                        id: link.id || '',
                        href: link.getAttribute('href') || '#',
                        // Pour le bouton soft mandatory, on utilise notre handler global
                        isSoftMandatory: isSoftMandatoryAction,
                        dataAttributes: {
                            dismiss: link.getAttribute('data-bs-dismiss') || link.getAttribute('data-dismiss')
                        }
                    });
                });

                showDsfrAlert(title, content, actions);
            } else if (footerLinks.length > 0) {
                // Modale avec liens d'action standard (non soft mandatory)
                const actions = [];
                footerLinks.forEach(function(link) {
                    actions.push({
                        text: link.textContent.trim(),
                        id: link.id || '',
                        href: link.getAttribute('href') || '#',
                        onclick: link.onclick,
                        dataAttributes: {
                            dismiss: link.getAttribute('data-bs-dismiss') || link.getAttribute('data-dismiss')
                        }
                    });
                });

                showDsfrAlert(title, content, actions);
            } else {
                // Modale d'erreur simple
                showDsfrAlert(title, content);
            }

            // Toujours masquer la modale Bootstrap
            cleanupModal(modal);
        }

        /**
         * Observer les changements de classe sur les modales
         * Pour détecter quand Bootstrap ajoute 'show' ou 'in'
         */
        const classObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const modal = mutation.target;

                    // Vérifier si c'est une modale Bootstrap qui devient visible
                    if (modal.classList.contains('modal') &&
                        (modal.classList.contains('show') || modal.classList.contains('in'))) {

                        interceptModalShow(modal);
                    }
                }
            });
        });

        /**
         * Nettoyer complètement une modale
         */
        function cleanupModal(modal) {
            if (!modal) return;

            // Retirer TOUTES les classes Bootstrap
            modal.classList.remove('show', 'in', 'fade', 'modal');
            modal.setAttribute('aria-hidden', 'true');
            modal.style.display = 'none';

            // Supprimer le backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }

            // Retirer modal-open du body
            document.body.classList.remove('modal-open');

        }

        // Observer toutes les modales existantes
        const observeModals = function() {
            document.querySelectorAll('.modal').forEach(function(modal) {
                // Ne pas nettoyer les modales file-upload
                const isFileUpload = modal.classList.contains('file-upload-modal') ||
                                    modal.id.includes('file-upload') ||
                                    modal.querySelector('.uploader-frame');

                if (!isFileUpload) {
                    // Nettoyer immédiatement les modales de validation au chargement
                    cleanupModal(modal);
                }

                // Observer les changements de classe pour détecter quand Bootstrap les affiche
                if (!modal.hasAttribute('data-dsfr-observed')) {
                    modal.setAttribute('data-dsfr-observed', 'true');
                    classObserver.observe(modal, {
                        attributes: true,
                        attributeFilter: ['class']
                    });
                }
            });

            // Nettoyer le backdrop et modal-open si présents
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            document.body.classList.remove('modal-open');
        };

        // Observer les modales existantes
        observeModals();

        // Observer l'ajout de nouvelles modales dans le DOM
        const bodyObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('modal')) {
                        // Ne pas nettoyer les modales file-upload
                        const isFileUpload = node.classList.contains('file-upload-modal') ||
                                            node.id.includes('file-upload') ||
                                            node.querySelector('.uploader-frame');

                        if (!isFileUpload) {
                            cleanupModal(node);
                        }

                        if (!node.hasAttribute('data-dsfr-observed')) {
                            node.setAttribute('data-dsfr-observed', 'true');
                            classObserver.observe(node, {
                                attributes: true,
                                attributeFilter: ['class']
                            });
                        }
                    }
                });
            });
        });

        bodyObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Nettoyer au chargement ET après de courts délais
        setTimeout(observeModals, 100);
        setTimeout(observeModals, 500);
    }

    /**
     * Afficher une alerte DSFR en haut de page
     *
     * @param {string} title - Titre de l'alerte
     * @param {string} message - Message de l'alerte
     * @param {Array} actions - Tableau d'objets décrivant les boutons d'action (optionnel)
     *                          Chaque action : { text, id, href, onclick, dataAttributes }
     */
    function showDsfrAlert(title, message, actions) {
        // Trouver le conteneur principal (après le header)
        const container = document.querySelector('#outerframeContainer, main, .container-fluid');
        if (!container) {
            return;
        }

        // Supprimer les anciennes alertes DSFR de validation
        const oldAlerts = document.querySelectorAll('.dsfr-validation-alert');
        oldAlerts.forEach(function(alert) {
            alert.remove();
        });

        // Créer l'alerte DSFR
        const alert = document.createElement('div');
        alert.className = 'fr-alert fr-alert--error dsfr-validation-alert';
        alert.setAttribute('role', 'alert');

        // Structure de l'alerte DSFR
        let alertHtml = '<div class="fr-container">';

        if (title) {
            alertHtml += '<h3 class="fr-alert__title">' + escapeHtml(title) + '</h3>';
        }

        alertHtml += '<p>' + escapeHtml(message) + '</p>';

        // Boutons d'action (si fournis)
        if (actions && actions.length > 0) {
            alertHtml += '<div class="fr-btns-group fr-btns-group--inline-sm fr-mt-2w">';

            actions.forEach(function(action, index) {
                // Premier bouton = primaire, les autres = secondaires
                const btnClass = index === 0 ? 'fr-btn' : 'fr-btn fr-btn--secondary';
                const actionId = action.id ? 'id="dsfr-action-' + action.id + '"' : '';

                alertHtml += '<button type="button" class="' + btnClass + '" ' + actionId + ' data-action-index="' + index + '">';
                alertHtml += escapeHtml(action.text);
                alertHtml += '</button>';
            });

            alertHtml += '</div>';
        }

        // Bouton de fermeture (uniquement si pas de boutons d'action)
        if (!actions || actions.length === 0) {
            alertHtml += '<button class="fr-btn--close fr-btn fr-mt-2w" title="Masquer le message" aria-label="Masquer le message">Fermer</button>';
        }

        alertHtml += '</div>';

        alert.innerHTML = alertHtml;

        // Insérer en haut du conteneur
        container.insertBefore(alert, container.firstChild);

        // Ajouter les événements sur les boutons d'action
        if (actions && actions.length > 0) {
            actions.forEach(function(action, index) {
                const btn = alert.querySelector('[data-action-index="' + index + '"]');
                if (btn) {
                    btn.addEventListener('click', function() {

                        // Cas spécial : action soft mandatory
                        if (action.isSoftMandatory && typeof window.handleSoftMandatoryClick === 'function') {
                            window.handleSoftMandatoryClick();
                            return;
                        }

                        // Exécuter l'onclick original si présent
                        if (action.onclick && typeof action.onclick === 'function') {
                            action.onclick.call(btn);
                        }

                        // Fermer l'alerte après l'action
                        alert.remove();

                        // Si l'action demande de fermer la modale (dismiss)
                        if (action.dataAttributes && action.dataAttributes.dismiss) {
                            const modal = document.querySelector('.modal');
                            if (modal) {
                                modal.classList.remove('show', 'in');
                                modal.style.display = 'none';
                                document.body.classList.remove('modal-open');

                                const backdrop = document.querySelector('.modal-backdrop');
                                if (backdrop) backdrop.remove();
                            }
                        }
                    });
                }
            });
        } else {
            // Ajouter l'événement de fermeture sur le bouton Fermer
            const closeBtn = alert.querySelector('.fr-btn--close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    alert.remove();
                });
            }
        }

        // Faire défiler jusqu'à l'alerte
        alert.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Auto-masquage après 15 secondes (plus long si actions)
        const autoCloseDelay = actions && actions.length > 0 ? 15000 : 10000;
        setTimeout(function() {
            if (alert.parentNode) {
                alert.classList.add('fr-alert--fade-out');
                setTimeout(function() {
                    alert.remove();
                }, 500);
            }
        }, autoCloseDelay);

    }

    /**
     * Échapper les caractères HTML pour éviter XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }


    /**
     * SOLUTION SIMPLE: Nettoyer les classes problématiques
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Supprimer answer-item, radio-item, checkbox-item dans les tableaux
        document.querySelectorAll('table td.answer-item, table td.radio-item, table td.checkbox-item').forEach(function(td) {
            td.classList.remove('answer-item', 'radio-item', 'checkbox-item', 'dsfr-enhanced');
            td.style.display = 'table-cell';
        });

    });

    // NOTE: Le code qui appelait checkconditions() directement a été supprimé
    // car il créait une double exécution avec em_javascript.js et causait des
    // problèmes de réactivité. em_javascript.js gère déjà les événements change
    // sur les radio/checkbox via ses propres sélecteurs jQuery.

    /**
     * Validation des champs numériques (data-number)
     * Ajoute la classe error si la saisie n'est pas numérique
     */
    document.addEventListener('DOMContentLoaded', function() {

        // Trouver tous les inputs avec data-number
        const numberInputs = document.querySelectorAll('input[data-number="1"]');

        numberInputs.forEach(function(input) {

            // Valider à chaque frappe
            input.addEventListener('input', function() {
                validateNumberInput(this);
            });

            // Valider au blur
            input.addEventListener('blur', function() {
                validateNumberInput(this);
            });

            // Valider à chaque changement (keyup)
            input.addEventListener('keyup', function() {
                validateNumberInput(this);
            });

            // Valider au chargement si déjà rempli
            if (input.value) {
                validateNumberInput(input);
            }
        });

        function validateNumberInput(input) {
            const value = input.value.trim();

            // Nettoyer les anciens messages d'erreur
            removeErrorMessage(input);

            // Si vide, pas d'erreur
            if (value === '') {
                input.classList.remove('error');
                return;
            }

            // Vérifier si c'est un nombre (accepte aussi virgule)
            const isNumber = /^-?\d*[.,]?\d*$/.test(value);

            if (!isNumber) {
                // Ajouter la classe error
                input.classList.add('error');

                // Créer le message d'erreur
                const parentLi = input.closest('li.question-item');
                const gridRow = input.closest('.fr-grid-row');

                // Ne pas ajouter de message externe pour les questions multiple-short-txt
                // car elles sont gérées par handleMultipleShortTextErrors() dans custom.js
                const questionContainer = input.closest('.question-container');
                const isMultipleShortText = questionContainer && questionContainer.classList.contains('multiple-short-txt');

                if (gridRow && parentLi && !isMultipleShortText) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'ls-em-error dsfr-validation-error';
                    errorMsg.textContent = "Ce champ n'accepte que des chiffres. Les caractères non numériques sont automatiquement supprimés.";
                    errorMsg.style.marginTop = '0.25rem';

                    // Insérer après la grid-row
                    gridRow.parentElement.appendChild(errorMsg);
                }
            } else {
                // Retirer la classe error
                input.classList.remove('error');
            }
        }

        function removeErrorMessage(input) {
            const parentLi = input.closest('li.question-item');
            if (parentLi) {
                const errorMsgs = parentLi.querySelectorAll('.dsfr-validation-error');
                errorMsgs.forEach(function(msg) {
                    msg.remove();
                });
            }
        }
    });

    /**
     * Initialisation manuelle des questions de classement (ranking)
     *
     * Charge les scripts nécessaires et initialise RankingQuestion
     * car registerPackage() ne fonctionne pas dans notre thème
     */
    function initRankingQuestions() {
        // Vérifier s'il y a des questions de classement sur la page
        const rankingQuestions = document.querySelectorAll('.ranking-question-dsfr, [id^="sortable-choice-"]');

        if (rankingQuestions.length === 0) {
            return;
        }


        // Charger SortableJS si pas déjà chargé
        if (typeof Sortable === 'undefined') {
            const sortableScript = document.createElement('script');
            // Racine du site déduite de l'URL du thème (installations en
            // sous-répertoire) ; '' = racine.
            const lsRootUrl = themeUrl.replace(/\/(tmp\/assets|upload\/themes|themes)\/.*$/, '');
            sortableScript.src = lsRootUrl + '/assets/packages/sortablejs/sortable.min.js';
            sortableScript.onload = function() {
                loadRankingScript();
            };
            sortableScript.onerror = function() {
            };
            document.head.appendChild(sortableScript);
        } else {
            loadRankingScript();
        }

        function loadRankingScript() {
            // Charger RankingQuestion si pas déjà chargé
            if (typeof RankingQuestion === 'undefined') {
                const rankingScript = document.createElement('script');
                const lsRootUrl2 = themeUrl.replace(/\/(tmp\/assets|upload\/themes|themes)\/.*$/, '');
                rankingScript.src = lsRootUrl2 + '/assets/packages/questions/ranking/scripts/ranking.js';
                rankingScript.onload = function() {
                    initializeRankingInstances();
                };
                rankingScript.onerror = function() {
                };
                document.head.appendChild(rankingScript);
            } else {
                initializeRankingInstances();
            }
        }

        function initializeRankingInstances() {

            // Définir la traduction
            if (typeof LSvar === 'undefined') {
                window.LSvar = {};
            }
            if (typeof LSvar.lang === 'undefined') {
                LSvar.lang = {};
            }
            LSvar.lang.rankhelp = "Double-cliquez ou glissez-déposez les éléments de la liste de gauche pour les déplacer vers la droite - votre élément le mieux classé doit être en haut à droite, jusqu'à votre élément le moins bien classé.";

            // Trouver toutes les questions de classement et les initialiser
            document.querySelectorAll('.ranking-question-dsfr').forEach(function(container) {
                // Récupérer les options depuis les data attributes
                const qId = container.dataset.rankingQid;
                const rankingName = container.dataset.rankingName;
                const maxAnswers = container.dataset.maxAnswers || "";
                const minAnswers = container.dataset.minAnswers || "";
                const showpopups = container.dataset.showpopups || "1";
                const samechoiceheight = container.dataset.samechoiceheight || "1";
                const samelistheight = container.dataset.samelistheight || "1";


                // Créer les options pour RankingQuestion
                const options = {
                    max_answers: maxAnswers,
                    min_answers: minAnswers,
                    showpopups: showpopups,
                    samechoiceheight: samechoiceheight,
                    samelistheight: samelistheight,
                    rankingName: rankingName,
                    questionId: qId
                };

                try {
                    const rankingInstance = new RankingQuestion(options);
                    rankingInstance.init();
                } catch(e) {
                }
            });
        }
    }

})();
