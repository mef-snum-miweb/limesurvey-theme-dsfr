/**
 * Transformation des messages de validation LimeSurvey en messages DSFR.
 *
 * Remplace les .ls-question-message du core par un <p class="fr-message
 * fr-message--info"> avec icône d'info. Idempotent (skip si déjà classe
 * fr-message).
 */

export function transformValidationMessages() {
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
