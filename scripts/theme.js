/**
 * JavaScript pour le thème DSFR
 * Système de Design de l'État Français
 */

(function() {
    'use strict';

    // ============================================
    // SUPPRESSION DES ERREURS BOOTSTRAP
    // ============================================

    // Capturer et ignorer les erreurs Bootstrap qui ne nous concernent pas
    window.addEventListener('error', function(e) {
        // Ignorer les erreurs Bootstrap liées aux modals/tooltips
        if (e.message && e.message.includes('bootstrap')) {
            e.preventDefault();
            return false;
        }
    }, true);

    // ============================================
    // STUBS POUR PLUGINS BOOTSTRAP MANQUANTS
    // ============================================
    // Le thème DSFR n'utilise pas Bootstrap, mais LimeSurvey appelle
    // certaines fonctions Bootstrap. Ces stubs évitent les erreurs.

    // Attendre que jQuery soit chargé
    function initBootstrapStubs() {
        if (typeof jQuery !== 'undefined' && jQuery.fn) {
            // Stub pour tooltip
            if (!jQuery.fn.tooltip) {
                jQuery.fn.tooltip = function() {
                    return this;
                };
            }

            // Stub pour selectpicker (Bootstrap Select) — neutralisation
            // inconditionnelle : on remplace la vraie lib si le core LS l'a
            // chargée avant nous, pour laisser le combobox DSFR prendre le relais.
            jQuery.fn.selectpicker = function() {
                return this;
            };

            // Stub pour popover
            if (!jQuery.fn.popover) {
                jQuery.fn.popover = function() {
                    return this;
                };
            }

            // Stub pour modal
            if (!jQuery.fn.modal) {
                jQuery.fn.modal = function() {
                    return this;
                };
            }

            // Stub pour collapse
            if (!jQuery.fn.collapse) {
                jQuery.fn.collapse = function() {
                    return this;
                };
            }

            // Stub pour dropdown
            if (!jQuery.fn.dropdown) {
                jQuery.fn.dropdown = function() {
                    return this;
                };
            }

            // Stub pour tab
            if (!jQuery.fn.tab) {
                jQuery.fn.tab = function() {
                    return this;
                };
            }

            // Stub pour alert
            if (!jQuery.fn.alert) {
                jQuery.fn.alert = function() {
                    return this;
                };
            }

            // Stub pour button (Bootstrap)
            if (!jQuery.fn.button) {
                jQuery.fn.button = function() {
                    return this;
                };
            }

            // Stub pour carousel
            if (!jQuery.fn.carousel) {
                jQuery.fn.carousel = function() {
                    return this;
                };
            }
        }
    }

    // Initialiser les stubs immédiatement si jQuery est déjà chargé
    initBootstrapStubs();

    // Réessayer après le chargement du DOM au cas où jQuery serait chargé plus tard
    document.addEventListener('DOMContentLoaded', initBootstrapStubs);

    // Et aussi après window.onload pour être sûr
    window.addEventListener('load', initBootstrapStubs);

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
                // Ex: http://localhost:8080/tmp/assets/24f866ec/scripts/theme.js
                // -> http://localhost:8080/tmp/assets/24f866ec
                const match = script.src.match(/(.*\/tmp\/assets\/[^/]+)/);
                if (match) {
                    return match[1];
                }
            }
        }

        // Fallback: chercher dans les CSS
        const styleSheets = Array.from(document.styleSheets);
        for (const sheet of styleSheets) {
            if (sheet.href && sheet.href.includes('/theme.css')) {
                // Ex: http://localhost:8080/tmp/assets/24f866ec/css/theme.css
                // -> http://localhost:8080/tmp/assets/24f866ec
                const match = sheet.href.match(/(.*\/tmp\/assets\/[^/]+)/);
                if (match) {
                    return match[1];
                }
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

    // Méthode initGlobal requise par LimeSurvey
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

        // Améliorer les composants Bootstrap avec DSFR
        enhanceBootstrapComponents();

        // Fix pour les modales Bootstrap
        initBootstrapModalFallback();

        // Système de validation DSFR
        // DÉSACTIVÉ temporairement pour tester
        // initDsfrValidation();

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
     * Améliorer les composants Bootstrap avec le style DSFR
     */
    function enhanceBootstrapComponents() {
        // Ajouter les classes DSFR aux boutons Bootstrap
        document.querySelectorAll('.btn-primary').forEach(function(btn) {
            if (!btn.classList.contains('dsfr-enhanced')) {
                btn.classList.add('dsfr-enhanced');
            }
        });

        // Ajouter les classes DSFR aux inputs
        document.querySelectorAll('.form-control').forEach(function(input) {
            if (!input.classList.contains('dsfr-input')) {
                input.classList.add('dsfr-input');
            }
        });

        // Améliorer les radio/checkbox
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(function(input) {
            const parent = input.closest('.radio-item, .checkbox-item, .answer-item');
            if (parent && !parent.classList.contains('dsfr-enhanced')) {
                parent.classList.add('dsfr-enhanced');
            }
        });

        // Ajouter des wrappers DSFR si nécessaire
        enhanceLimeSurveyQuestions();
    }

    /**
     * Améliorer l'affichage des questions LimeSurvey
     */
    function enhanceLimeSurveyQuestions() {
        // Ajouter des classes DSFR aux éléments de questions
        document.querySelectorAll('.question-container, .ls-question').forEach(function(question) {
            if (!question.classList.contains('dsfr-question')) {
                question.classList.add('dsfr-question');
            }
        });

        // Améliorer les listes de choix
        document.querySelectorAll('.answer-list, .answers-list').forEach(function(list) {
            if (!list.classList.contains('dsfr-answers')) {
                list.classList.add('dsfr-answers');
            }
        });
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
     * Validation améliorée des formulaires
     */
    function enhanceFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                // Validation personnalisée si nécessaire
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;

                requiredFields.forEach(function(field) {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');

                        // Ajouter un message d'erreur si absent
                        if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                            const errorMsg = document.createElement('p');
                            errorMsg.className = 'error-message';
                            errorMsg.textContent = 'Ce champ est obligatoire';
                            field.parentNode.insertBefore(errorMsg, field.nextSibling);
                        }
                    } else {
                        field.classList.remove('error');
                        const errorMsg = field.nextElementSibling;
                        if (errorMsg && errorMsg.classList.contains('error-message')) {
                            errorMsg.remove();
                        }
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                    // Faire défiler jusqu'au premier champ en erreur
                    const firstError = form.querySelector('.error');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstError.focus();
                    }
                }
            });
        });
    }

    // Appeler l'amélioration de la validation
    document.addEventListener('DOMContentLoaded', enhanceFormValidation);

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
     * Système de validation DSFR complet
     *
     * Remplace le système de validation Bootstrap/EM par un système DSFR
     * avec messages inline et alerte globale
     */
    function initDsfrValidation() {

        // Intercepter la soumission de tous les formulaires
        const forms = document.querySelectorAll('form#limesurvey, form[name="limesurvey"]');

        forms.forEach(function(form) {
            // Empêcher la soumission native
            form.addEventListener('submit', function(e) {

                // Nettoyer les erreurs précédentes
                clearAllErrors();

                // Valider le formulaire
                const errors = validateForm(form);

                if (errors.length > 0) {
                    // Empêcher la soumission
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();


                    // Afficher les erreurs
                    displayErrors(errors);

                    return false;
                }

                return true;
            }, true); // useCapture = true pour intercepter avant EM
        });

        /**
         * Valider le formulaire et retourner les erreurs
         */
        function validateForm(form) {
            const errors = [];

            // 1. Trouver toutes les questions obligatoires
            const questionContainers = form.querySelectorAll('.question-container');

            questionContainers.forEach(function(container) {
                // Ignorer les questions cachées par les conditions
                // LimeSurvey cache les questions avec display: none ou classe ls-hidden
                const isHidden = container.style.display === 'none' ||
                               container.classList.contains('ls-hidden') ||
                               container.classList.contains('ls-irrelevant') ||
                               !container.offsetParent; // offsetParent est null si l'élément est caché

                if (isHidden) {
                    return;
                }

                // Vérifier si la question est marquée comme obligatoire
                const isMandatory = container.querySelector('.asterisk, .mandatory') ||
                                   container.classList.contains('mandatory');

                if (!isMandatory) return;

                // Récupérer le texte de la question
                const questionText = container.querySelector('.question-text, .questiontext, h3');
                const questionLabel = questionText ? questionText.textContent.trim().substring(0, 100) : 'Question';

                // Vérifier selon le type de question
                const hasError = checkQuestionValidity(container);

                if (hasError) {
                    errors.push({
                        container: container,
                        label: questionLabel,
                        message: 'Cette question est obligatoire'
                    });
                }
            });

            return errors;
        }

        /**
         * Vérifier si une question est valide
         */
        function checkQuestionValidity(container) {
            // 1. Questions avec inputs texte
            const textInputs = container.querySelectorAll('input[type="text"]:not([id*="other"]), input[type="number"], textarea');
            if (textInputs.length > 0) {
                let allEmpty = true;
                textInputs.forEach(function(input) {
                    if (input.value && input.value.trim() !== '') {
                        allEmpty = false;
                    }
                });
                if (allEmpty) return true;
            }

            // 2. Questions radio (choix unique)
            const radios = container.querySelectorAll('input[type="radio"]');
            if (radios.length > 0) {
                let isChecked = false;
                radios.forEach(function(radio) {
                    if (radio.checked) isChecked = true;
                });
                if (!isChecked) return true;
            }

            // 3. Questions checkbox (choix multiple - au moins une option)
            const checkboxes = container.querySelectorAll('input[type="checkbox"]:not([id*="other"])');
            if (checkboxes.length > 0) {
                let isChecked = false;
                checkboxes.forEach(function(checkbox) {
                    if (checkbox.checked) isChecked = true;
                });
                if (!isChecked) return true;
            }

            // 4. Select dropdown
            const selects = container.querySelectorAll('select');
            if (selects.length > 0) {
                let allEmpty = true;
                selects.forEach(function(select) {
                    if (select.value && select.value !== '' && select.value !== '-oth-') {
                        allEmpty = false;
                    }
                });
                if (allEmpty) return true;
            }

            return false; // Pas d'erreur
        }

        /**
         * Afficher les erreurs
         */
        function displayErrors(errors) {

            // 1. Marquer visuellement les questions en erreur
            errors.forEach(function(error) {
                // Ajouter classe d'erreur au container
                error.container.classList.add('has-error', 'fr-input-group--error');

                // Cacher les messages de succès (ils ne doivent s'afficher qu'après correction)
                const validationContainer = error.container.querySelector('.dsfr-validation-container');
                if (validationContainer) {
                    const validMessage = validationContainer.querySelector('.dsfr-valid-message');
                    if (validMessage) {
                        validMessage.style.display = 'none';
                    }
                    const fileValidMessage = validationContainer.querySelector('.dsfr-file-valid-message');
                    if (fileValidMessage) {
                        fileValidMessage.style.display = 'none';
                    }
                }

                // Ajouter message d'erreur inline
                addInlineErrorMessage(error.container, error.message);

                // Marquer les inputs en erreur
                const inputs = error.container.querySelectorAll('input, textarea, select');
                inputs.forEach(function(input) {
                    input.classList.add('error', 'fr-input--error');
                });

                // Attacher les event listeners pour retirer l'erreur lors de l'interaction
                attachErrorRemovalListeners(error.container);
            });

            // 2. Afficher alerte globale en haut
            const errorSummary = errors.map(function(e, i) {
                return (i + 1) + '. ' + e.label;
            }).join('\n');

            showDsfrAlert(
                'Formulaire incomplet',
                errors.length + ' question(s) obligatoire(s) non remplie(s) :\n\n' + errorSummary,
                null
            );

            // 3. Scroll vers la première erreur
            if (errors.length > 0) {
                errors[0].container.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }

        /**
         * Afficher le message de succès après correction d'une erreur
         */
        function showSuccessMessage(container) {
            // Ne montrer le message de succès que si la question a eu une erreur auparavant
            if (!container.dataset.hadError) {
                return;
            }

            // Trouver le conteneur de validation
            const validationContainer = container.querySelector('.dsfr-validation-container');
            if (!validationContainer) {
                return;
            }

            // Afficher le message de succès
            const validMessage = validationContainer.querySelector('.dsfr-valid-message');
            if (validMessage && validMessage.textContent.trim()) {
                validMessage.style.display = 'block';
            }

            // Afficher aussi le message pour les fichiers si c'est une question de type fichier
            const fileValidMessage = validationContainer.querySelector('.dsfr-file-valid-message');
            if (fileValidMessage && fileValidMessage.textContent.trim()) {
                fileValidMessage.style.display = 'block';
            }
        }

        /**
         * Attacher des event listeners pour retirer l'erreur dès que l'utilisateur interagit
         */
        function attachErrorRemovalListeners(container) {
            // Éviter de dupliquer les listeners
            if (container.dataset.errorListenersAttached) {
                return;
            }
            container.dataset.errorListenersAttached = 'true';

            // Fonction pour retirer l'erreur
            function removeError() {
                // Marquer que cette question a eu une erreur (pour afficher le message de succès plus tard)
                container.dataset.hadError = 'true';

                container.classList.remove('has-error', 'fr-input-group--error');

                // Retirer les classes d'erreur des inputs
                const inputs = container.querySelectorAll('input, textarea, select');
                inputs.forEach(function(input) {
                    input.classList.remove('error', 'fr-input--error');
                });

                // Retirer le message d'erreur inline
                const errorMsg = container.querySelector('.fr-error-text');
                if (errorMsg) {
                    errorMsg.remove();
                }

                // Afficher le message de succès si la question a été corrigée
                showSuccessMessage(container);
            }

            // Attacher les listeners sur tous les champs de la question
            const textInputs = container.querySelectorAll('input[type="text"], input[type="number"], textarea');
            textInputs.forEach(function(input) {
                input.addEventListener('input', removeError, { once: true });
            });

            const radios = container.querySelectorAll('input[type="radio"]');
            radios.forEach(function(radio) {
                radio.addEventListener('change', removeError, { once: true });
            });

            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(function(checkbox) {
                checkbox.addEventListener('change', removeError, { once: true });
            });

            const selects = container.querySelectorAll('select');
            selects.forEach(function(select) {
                select.addEventListener('change', removeError, { once: true });
            });
        }

        /**
         * Ajouter un message d'erreur inline sous la question
         */
        function addInlineErrorMessage(container, message) {
            // Vérifier si un message existe déjà
            let errorMsg = container.querySelector('.fr-error-text');
            if (errorMsg) {
                errorMsg.textContent = message;
                return;
            }

            // Créer le message
            errorMsg = document.createElement('p');
            errorMsg.className = 'fr-error-text';
            errorMsg.textContent = message;
            errorMsg.setAttribute('role', 'alert');

            // Insérer après la question
            const answerContainer = container.querySelector('.answer, .answers');
            if (answerContainer) {
                answerContainer.parentNode.insertBefore(errorMsg, answerContainer.nextSibling);
            } else {
                container.appendChild(errorMsg);
            }
        }

        /**
         * Nettoyer toutes les erreurs
         */
        function clearAllErrors() {
            // Retirer les classes d'erreur
            document.querySelectorAll('.has-error, .fr-input-group--error').forEach(function(el) {
                el.classList.remove('has-error', 'fr-input-group--error');
            });

            // Retirer les messages d'erreur
            document.querySelectorAll('.fr-error-text').forEach(function(msg) {
                msg.remove();
            });

            // Retirer les classes des inputs
            document.querySelectorAll('input.error, textarea.error, select.error, .fr-input--error, .fr-select--error').forEach(function(input) {
                input.classList.remove('error', 'fr-input--error', 'fr-select--error');
            });

            // Supprimer l'alerte globale
            const alerts = document.querySelectorAll('.dsfr-validation-alert');
            alerts.forEach(function(alert) {
                alert.remove();
            });
        }

    }

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
            sortableScript.src = '/assets/packages/sortablejs/sortable.min.js';
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
                rankingScript.src = '/assets/packages/questions/ranking/scripts/ranking.js';
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

    // ============================================
    // GESTION DES ERREURS DE VALIDATION
    // ============================================

    /**
     * Retire les classes d'erreur quand l'utilisateur commence à saisir
     * Utilise la délégation d'événements pour fonctionner avec les éléments dynamiques
     * MODIFIÉ: Ne retire la classe input-error que s'il ne reste plus de messages d'erreur visibles
     */
    $(document).on('input change keyup', '.question-container.input-error input, .question-container.input-error textarea, .question-container.input-error select', function() {
        const $input = $(this);
        const $question = $input.closest('.question-container');

        if ($question.length) {
            // Ignorer les questions de type array (tableaux) - elles ont leur propre gestion dans custom.js
            if ($question.attr('class').match(/array-/)) {
                return;
            }

            // Retirer les classes d'erreur du groupe d'input parent
            $input.closest('.fr-input-group').removeClass('fr-input-group--error');

            // Cacher le message d'erreur initial
            $question.find('.ls-question-mandatory-initial').fadeOut(300);

            // Vérifier s'il reste des messages d'erreur visibles
            setTimeout(function() {
                const visibleErrors = $question.find('.ls-question-mandatory:visible, .ls-question-mandatory-array:visible').filter(function() {
                    return $(this).css('display') !== 'none' && $(this).is(':visible');
                });

                // Ne retirer input-error que s'il n'y a plus d'erreurs visibles
                if (visibleErrors.length === 0) {
                    $question.removeClass('input-error fr-input-group--error');
                }
            }, 50);

        }
    });

})();
