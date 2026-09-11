/**
 * Consentement à la politique de confidentialité (RGPD) — issue #61.
 *
 * La case `#datasecurity_accepted` (privacy_text.twig / privacy_modal.twig)
 * porte l'attribut `required` : le navigateur bloque donc nativement le
 * passage à la page suivante, y compris si JavaScript est indisponible.
 * Ce module remplace la bulle native — non stylable, non annoncée de façon
 * fiable, perdue au premier clic — par un message d'erreur DSFR :
 *
 * - `fr-checkbox-group--error` sur le groupe + `aria-invalid="true"` ;
 * - `<p class="fr-message fr-message--error">` dans le `fr-messages-group`,
 *   référencé par `aria-describedby` (RGAA 11.10) ;
 * - focus porté sur la case, message effacé dès qu'elle est cochée.
 *
 * Le libellé affiché reprend le message saisi par l'administrateur du
 * questionnaire (alerte serveur `#datasecurity_error`) quand il existe,
 * sinon un texte par défaut traduit.
 *
 * NOTE — ce blocage est un garde-fou d'interface, pas une garantie de
 * consentement : le contrôle serveur de LimeSurvey
 * (`SurveyRuntimeHelper::checkForDataSecurityAccepted()`) compare
 * `$this->param['thisstep'] === '0'` alors que `sanitize_int()` renvoie un
 * entier depuis la 5.4 — la condition est donc toujours fausse et aucune
 * vérification serveur n'a lieu. Un POST forgé reste accepté.
 */

import { tUI } from '../core/i18n.js';

const CHECKBOX_ID = 'datasecurity_accepted';
const MESSAGES_ID = 'datasecurity_accepted-messages';
const ERROR_MESSAGE_ID = 'datasecurity_accepted-message-error';

/**
 * Message à afficher : celui configuré dans les réglages du questionnaire
 * (rendu dans l'alerte serveur) s'il est renseigné, sinon le texte par défaut.
 */
function getErrorText() {
    const serverAlert = document.getElementById('datasecurity_error');
    const title = serverAlert && serverAlert.querySelector('.fr-alert__title');
    const custom = title && title.textContent ? title.textContent.trim() : '';
    return custom || tUI('datasecurity_required');
}

/**
 * Ajoute un id à la liste `aria-describedby` sans écraser ceux déjà posés.
 */
function addDescribedBy(element, id) {
    const current = (element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (current.indexOf(id) === -1) {
        current.push(id);
        element.setAttribute('aria-describedby', current.join(' '));
    }
}

function removeDescribedBy(element, id) {
    const current = (element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    const next = current.filter((value) => value !== id);
    if (next.length) {
        element.setAttribute('aria-describedby', next.join(' '));
    } else {
        element.removeAttribute('aria-describedby');
    }
}

export function initDataSecurityConsent() {
    const checkbox = document.getElementById(CHECKBOX_ID);

    if (!checkbox) {
        return; // Politique de confidentialité non activée sur ce questionnaire
    }

    // Idempotence : onReady/onPjax peuvent rejouer l'init sur la même page.
    if (checkbox.dataset.dsfrConsentInitialized) {
        return;
    }
    checkbox.dataset.dsfrConsentInitialized = 'true';

    const group = checkbox.closest('.fr-checkbox-group');
    const messagesGroup = document.getElementById(MESSAGES_ID);
    const form = checkbox.closest('form');

    function showError() {
        if (group) {
            group.classList.add('fr-checkbox-group--error');
        }
        checkbox.setAttribute('aria-invalid', 'true');

        if (messagesGroup) {
            let message = document.getElementById(ERROR_MESSAGE_ID);
            if (!message) {
                message = document.createElement('p');
                message.id = ERROR_MESSAGE_ID;
                message.className = 'fr-message fr-message--error';
                messagesGroup.appendChild(message);
            }
            message.textContent = getErrorText();
            addDescribedBy(checkbox, ERROR_MESSAGE_ID);
        }

        checkbox.focus();
    }

    function clearError() {
        if (group) {
            group.classList.remove('fr-checkbox-group--error');
        }
        checkbox.removeAttribute('aria-invalid');

        const message = document.getElementById(ERROR_MESSAGE_ID);
        if (message) {
            message.remove();
        }
        removeDescribedBy(checkbox, ERROR_MESSAGE_ID);
    }

    // 1. `invalid` est émis par la validation native (attribut `required`)
    //    au moment où le formulaire est soumis sans que la case soit cochée.
    //    `preventDefault()` supprime la bulle du navigateur ; le message DSFR
    //    la remplace.
    checkbox.addEventListener('invalid', (event) => {
        event.preventDefault();
        showError();
    });

    // 2. Filet de sécurité : formulaire marqué `novalidate`, navigateur sans
    //    validation de contraintes, ou soumission déclenchée par script.
    //    Les boutons qui ne font pas progresser le questionnaire (reprise,
    //    sauvegarde, sortie) portent `formnovalidate` et restent utilisables.
    if (form) {
        form.addEventListener('submit', (event) => {
            const submitter = event.submitter || document.activeElement;
            if (submitter && typeof submitter.hasAttribute === 'function' && submitter.hasAttribute('formnovalidate')) {
                return;
            }
            if (checkbox.checked) {
                return;
            }
            event.preventDefault();
            showError();
        });
    }

    // 3. Retrait de l'erreur dès que le consentement est donné.
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            clearError();

            // Alerte renvoyée par un précédent aller-retour serveur.
            const serverAlert = document.getElementById('datasecurity_error');
            if (serverAlert) {
                serverAlert.classList.add('ls-js-hidden');
            }
        }
    });
}
