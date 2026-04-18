/**
 * Bootstrap Stubs for DSFR Theme
 * Provides minimal Bootstrap functionality for LimeSurvey components
 * that still require Bootstrap JavaScript (like file upload modals)
 *
 * Ce script DOIT être chargé AVANT tous les autres scripts
 */
(function() {
    'use strict';

    // Fonction pour initialiser les stubs
    function initStubs() {
        if (typeof jQuery === 'undefined' || !jQuery.fn) {
            return false;
        }

        var $ = jQuery;

        // ============================================
        // MODAL - Implémentation fonctionnelle
        // Ne pas écraser si Bootstrap est déjà chargé
        // ============================================
        if (!$.fn.modal && typeof bootstrap === 'undefined') {
            $.fn.modal = function(action) {
                return this.each(function() {
                    var $modal = $(this);

                    if (action === 'show') {
                        showModal($modal);
                    } else if (action === 'hide') {
                        hideModal($modal);
                    } else if (action === 'toggle') {
                        if ($modal.hasClass('show')) {
                            hideModal($modal);
                        } else {
                            showModal($modal);
                        }
                    } else if (typeof action === 'object' || action === undefined) {
                        // Initialisation - ne rien faire
                    }
                });
            };
        }

        function showModal($modal) {
            // Créer le backdrop
            var $backdrop = $('.modal-backdrop');
            if ($backdrop.length === 0) {
                $backdrop = $('<div class="modal-backdrop fade show"></div>');
                $('body').append($backdrop);
            }

            // Afficher la modale
            $modal.addClass('show').css('display', 'block');
            $('body').addClass('modal-open');

            // Charger l'iframe si nécessaire (pour file upload)
            var $uploaderFrame = $modal.find('.uploader-frame');
            if ($uploaderFrame.length > 0 && $uploaderFrame.data('src')) {
                var src = $uploaderFrame.data('src');
                if (!$uploaderFrame.find('iframe').length) {
                    var $iframe = $('<iframe></iframe>')
                        .attr('src', src)
                        .css({
                            width: '100%',
                            height: '400px',
                            border: 'none'
                        });
                    $uploaderFrame.append($iframe);
                }
            }

            // Trigger événement Bootstrap
            $modal.trigger('shown.bs.modal');
        }

        function hideModal($modal) {
            // Cacher la modale
            $modal.removeClass('show').css('display', 'none');
            $('body').removeClass('modal-open');

            // Supprimer le backdrop
            $('.modal-backdrop').remove();

            // Trigger événement Bootstrap
            $modal.trigger('hidden.bs.modal');
        }

        // ============================================
        // GESTION DES ATTRIBUTS DATA-BS-*
        // Seulement si Bootstrap n'est pas chargé
        // ============================================

        // Éviter les doublons d'event handlers et ne pas interférer avec Bootstrap
        if (!window._dsfrModalHandlersAttached && typeof bootstrap === 'undefined') {
            window._dsfrModalHandlersAttached = true;

            // Clic sur éléments avec data-bs-toggle="modal"
            $(document).on('click', '[data-bs-toggle="modal"]', function(e) {
                e.preventDefault();
                var targetSelector = $(this).data('bs-target') || $(this).attr('href');
                var $modal = $(targetSelector);
                if ($modal.length) {
                    $modal.modal('show');
                }
            });

            // Clic sur éléments avec data-bs-dismiss="modal"
            $(document).on('click', '[data-bs-dismiss="modal"]', function(e) {
                e.preventDefault();
                var $modal = $(this).closest('.modal');
                if ($modal.length) {
                    $modal.modal('hide');
                }
            });

            // Fermer avec Escape
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    var $modal = $('.modal.show');
                    if ($modal.length) {
                        $modal.modal('hide');
                    }
                }
            });

            // Fermer en cliquant sur le backdrop (zone en dehors du dialog)
            $(document).on('click', '.modal.show', function(e) {
                if (e.target === this) {
                    $(this).modal('hide');
                }
            });
        }

        // ============================================
        // AUTRES STUBS (sans fonctionnalité)
        // ============================================

        if (!$.fn.tooltip) {
            $.fn.tooltip = function() { return this; };
        }

        // bootstrap-select : neutralisation inconditionnelle.
        // Le core LimeSurvey peut charger la vraie lib bootstrap-select avant
        // nos stubs via les assets AssetsManager ; on l'écrase quand même pour
        // empêcher la construction du double dropdown (combobox DSFR à la place,
        // voir src/dropdowns/combobox.js).
        $.fn.selectpicker = function() { return this; };

        if (!$.fn.popover) {
            $.fn.popover = function() { return this; };
        }

        if (!$.fn.collapse) {
            $.fn.collapse = function() { return this; };
        }

        if (!$.fn.dropdown) {
            $.fn.dropdown = function() { return this; };
        }

        if (!$.fn.tab) {
            $.fn.tab = function() { return this; };
        }

        if (!$.fn.alert) {
            $.fn.alert = function() { return this; };
        }

        if (!$.fn.button) {
            $.fn.button = function() { return this; };
        }

        if (!$.fn.carousel) {
            $.fn.carousel = function() { return this; };
        }

        if (!$.fn.scrollspy) {
            $.fn.scrollspy = function() { return this; };
        }

        if (!$.fn.affix) {
            $.fn.affix = function() { return this; };
        }

        // ============================================
        // OBJET BOOTSTRAP GLOBAL (Bootstrap 5)
        // ============================================

        if (typeof bootstrap === 'undefined') {
            window.bootstrap = {
                Modal: {
                    getInstance: function(element) {
                        var $el = $(element);
                        return {
                            show: function() { $el.modal('show'); },
                            hide: function() { $el.modal('hide'); },
                            toggle: function() { $el.modal('toggle'); }
                        };
                    },
                    getOrCreateInstance: function(element) {
                        return this.getInstance(element);
                    }
                },
                Tooltip: function() { return { dispose: function() {} }; },
                Popover: function() { return { dispose: function() {} }; },
                Collapse: function() { return { dispose: function() {} }; },
                Dropdown: function() { return { dispose: function() {} }; }
            };
        }

        return true;
    }

    // Essayer d'initialiser immédiatement
    if (!initStubs()) {
        // Si jQuery n'est pas encore chargé, réessayer périodiquement
        var attempts = 0;
        var maxAttempts = 100; // 10 secondes max
        var interval = setInterval(function() {
            attempts++;
            if (initStubs() || attempts >= maxAttempts) {
                clearInterval(interval);
            }
        }, 100);
    }

    // Aussi initialiser sur DOMContentLoaded et load pour être sûr
    document.addEventListener('DOMContentLoaded', initStubs);
    window.addEventListener('load', initStubs);

})();
