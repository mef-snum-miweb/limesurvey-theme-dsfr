/**
 * Transformation des messages de validation LimeSurvey en messages DSFR.
 *
 * Transforme les .ls-question-message du core SUR PLACE (ajout des classes
 * DSFR), sans replaceWith ni changement d'id :
 *  - l'Expression Manager met à jour ces nœuds par référence/id (textes
 *    dynamiques type « il reste N caractères », bornes de somme) — un
 *    remplacement perdait ces mises à jour ;
 *  - les aria-describedby posés par described-by.js pointent vers ces ids.
 * Idempotent (skip si déjà classe fr-message).
 */

export function transformValidationMessages() {
    const emMessages = document.querySelectorAll('.ls-question-message');
    emMessages.forEach(message => {
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

        message.classList.add('fr-message', 'fr-message--' + messageType);
    });
}
