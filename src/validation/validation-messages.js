/**
 * Transformation des messages de validation LimeSurvey en messages DSFR.
 *
 * Chaque `.ls-question-message` du core est doublé d'un miroir
 * `<p class="fr-message fr-message--<type>" id="<id>-dsfr">`, et le nœud
 * core est conservé dans le DOM mais masqué (issue #42) : l'Expression
 * Manager l'adresse par id, aussi bien pour réécrire les textes tailorés
 * (« il reste N », bornes de somme) que pour signaler la validité via
 * `$('#vmsg_…').trigger('classChangeGood'/'classChangeError')`.
 *
 * Le nœud core est neutralisé pour que ces signaux n'aient AUCUN effet
 * direct côté core (cause du revert de #29) :
 * - TOUTES ses classes sont retirées (remplacées par `dsfr-vmsg-core`) :
 *   le handler délégué de survey.js (`.ls-em-tip`) ne le matche plus, et
 *   les scripts qui réécrivent les tips par classe ne le retrouvent plus —
 *   ex. ranking.js core fait `$('.em_default').html(ancien + rankhelp)` à
 *   chaque init et DOUBLERAIT le texte d'aide à la seconde passe
 *   (initAllRankingQuestions ré-initialise à +300 ms) ;
 * - handlers directs posés par template-core.js (`triggerEmClassChangeTemplate`,
 *   qui marque `input-error` le conteneur question dès la page vierge)
 *   débranchés via jQuery `.off()`.
 *
 * Le thème relaie ensuite lui-même les signaux EM vers le miroir :
 * - MutationObserver sur le nœud core → recopie des textes tailorés ;
 * - handlers jQuery sur `classChangeGood`/`classChangeError` → bascule
 *   `fr-message--info` ↔ `fr-message--error`, mais seulement après une
 *   vraie interaction (`isTrusted`) dans la question : l'EM évalue les
 *   validations dès le chargement et signalerait sinon en erreur les
 *   questions obligatoires vides (bug « page vierge » de #29).
 *
 * Idempotent via `dataset.dsfrMirrored` / `dataset.dsfrEmWired` (le câblage
 * jQuery est retenté à chaque passe tant que jQuery n'est pas chargé).
 */

import { updateErrorSummary } from './error-summary.js';

export function transformValidationMessages() {
    // `.dsfr-vmsg-core` re-matche les nœuds déjà traités dont le câblage
    // jQuery a été différé (jQuery pas encore chargé à la passe précédente).
    const emMessages = document.querySelectorAll('.ls-question-message, .dsfr-vmsg-core');
    emMessages.forEach(message => {
        // Vérifier si le message n'a pas déjà été transformé
        if (message.classList.contains('fr-message')) {
            return;
        }

        if (message.dataset.dsfrMirrored !== '1') {
            mirrorMessage(message);
        }
        wireEmClassSync(message);
    });
}

/**
 * Crée le miroir DSFR du message core, masque l'original et recopie ses
 * textes tailorés EM à chaque mutation.
 */
function mirrorMessage(message) {
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

    message.insertAdjacentElement('afterend', dsfrMessage);

    // Masquer l'original sans le détacher : l'EM doit continuer à le
    // retrouver par id. Style inline (et non [hidden]) pour gagner contre
    // un éventuel display: posé par le CSS core. Les aria-describedby
    // pointent vers le wrapper `#vmsg_<qid>` : le texte annoncé reste
    // celui du miroir, l'original en display:none étant exclu du calcul.
    // Le strip de TOUTES les classes le rend invisible aux sélecteurs core
    // (cf. en-tête) — seul l'id reste adressable, ce que fait l'EM.
    message.className = 'dsfr-vmsg-core';
    message.style.display = 'none';
    message.dataset.dsfrMirrored = '1';

    // Textes dynamiques EM (spans tailorés réécrits par l'EM) → miroir
    const observer = new MutationObserver(() => {
        dsfrMessage.textContent = message.textContent.trim();
    });
    observer.observe(message, { childList: true, characterData: true, subtree: true });
}

/**
 * Relaie les signaux de validité EM (`classChangeGood`/`classChangeError`,
 * déclenchés en jQuery sur l'id du nœud core) vers le miroir DSFR.
 */
function wireEmClassSync(message) {
    if (message.dataset.dsfrEmWired === '1' || !message.id) {
        return;
    }
    const $ = window.jQuery || window.$;
    if (!$) {
        return; // retenté aux passes suivantes (ready+100ms, questionsLoaded)
    }
    const mirror = document.getElementById(`${message.id}-dsfr`);
    if (!mirror) {
        return;
    }
    message.dataset.dsfrEmWired = '1';

    // Débrancher les handlers directs du core (template-core.js) qui
    // marqueraient `input-error` le conteneur : l'état d'erreur des
    // conteneurs reste entièrement géré par les modules du thème.
    $(message).off('classChangeError classChangeGood');

    let interacted = false;
    let state = null;
    const apply = () => {
        if (!interacted || state === null) {
            return;
        }
        const wasError = mirror.classList.contains('fr-message--error');
        mirror.classList.toggle('fr-message--error', state === 'error');
        mirror.classList.toggle('fr-message--info', state !== 'error');
        // Le récapitulatif extrait le premier .fr-message--error de la
        // question : un miroir qui change d'état peut périmer son libellé
        // (updateErrorSummary rafraîchit en place, no-op sans récap).
        if (wasError !== (state === 'error')) {
            setTimeout(updateErrorSummary, 50);
        }
    };

    // Flag « première interaction » : seuls les événements utilisateur
    // réels comptent (isTrusted) — les change/input synthétiques émis par
    // les inits du thème ou des scripts tiers ne doivent pas révéler les
    // erreurs à froid.
    const question = message.closest('.question-container');
    if (question) {
        const markInteracted = (event) => {
            if (!event.isTrusted) {
                return;
            }
            interacted = true;
            apply(); // matérialiser l'état EM courant dès la 1re interaction
            question.removeEventListener('input', markInteracted, true);
            question.removeEventListener('change', markInteracted, true);
        };
        question.addEventListener('input', markInteracted, true);
        question.addEventListener('change', markInteracted, true);
    }

    $(message).on('classChangeError', () => {
        state = 'error';
        apply();
    });
    $(message).on('classChangeGood', () => {
        state = 'good';
        apply();
    });
}
