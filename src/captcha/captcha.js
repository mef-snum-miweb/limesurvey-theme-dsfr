/**
 * Captcha LimeSurvey — rechargement et validation DSFR.
 *
 * - initCaptchaReload : attache un handler au bouton de rechargement
 *   qui met à jour le `src` de l'image captcha avec un cache-buster
 *   (paramètre `v=timestamp`) sans recharger la page.
 * - initCaptchaValidation : remplace la validation HTML5 native par
 *   une validation DSFR — intercepte le submit, affiche un message
 *   `.fr-message--error` et pose `fr-input-group--error` si le champ
 *   est vide.
 */

export function initCaptchaReload() {
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
export function initCaptchaValidation() {
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
