/**
 * Récapitulatif DSFR des erreurs de validation en haut de page (RGAA 9.3).
 *
 * - `createErrorSummary()` : parcourt toutes les questions en erreur, construit
 *   un `<div id="dsfr-error-summary">` avec titre + liste d'ancres vers chaque
 *   champ en erreur. Supprime l'ancien récapitulatif s'il existe (idempotent).
 *   Pose `tabindex="-1"` pour permettre un focus programmatique.
 *
 * - `updateErrorSummary()` : met à jour le récapitulatif existant sans le
 *   détruire, pour préserver le focus si l'utilisateur y est déjà.
 *
 * - `initErrorSummaryObserver()` : instancie un MutationObserver sur
 *   `document.body` qui recrée le récapitulatif dès qu'une question passe
 *   en erreur (par exemple après une validation AJAX). À appeler une seule
 *   fois au `onReady` depuis `src/index.js` pour éviter la double observation.
 *
 * Appelés depuis `src/index.js` au chargement (setTimeout 100 ms pour laisser
 * LimeSurvey finir de poser les classes `input-error`), sur
 * `limesurvey:questionsLoaded`, et après chaque submit de formulaire.
 */

export function createErrorSummary() {

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

    // Construction via API DOM : error.label et error.id proviennent du textContent
    // de labels/messages contrôlés par l'admin du sondage. innerHTML les
    // réinterpréterait comme HTML et permettrait un XSS stocké.
    const title = document.createElement('h3');
    title.className = 'fr-alert__title';
    title.textContent = errorList.length === 1
        ? 'Une erreur a été détectée'
        : errorList.length + ' erreurs ont été détectées';
    summary.appendChild(title);

    const description = document.createElement('p');
    description.textContent = 'Veuillez corriger les erreurs suivantes :';
    summary.appendChild(description);

    const list = document.createElement('ul');
    list.className = 'fr-mb-0';

    errorList.forEach(function(error) {
        const item = document.createElement('li');
        item.className = 'error-item';
        item.setAttribute('data-question-id', error.id);

        const link = document.createElement('a');
        link.setAttribute('href', '#' + error.id);
        link.className = 'fr-link fr-icon-error-warning-line fr-link--icon-left';
        link.textContent = error.label;

        item.appendChild(link);
        list.appendChild(item);
    });

    summary.appendChild(list);

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

export function updateErrorSummary() {
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

export function initErrorSummaryObserver() {
    if (!document.body) return;
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList && target.classList.contains('question-container') && target.classList.contains('input-error')) {
                    setTimeout(createErrorSummary, 100);
                }
            }
        });
    });
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true,
    });
}
