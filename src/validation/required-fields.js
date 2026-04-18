/**
 * Gestion des champs obligatoires (RGAA 10.8, 11.10).
 *
 * - Ajoute la classe `has-required-field` sur les labels/legends des champs
 *   obligatoires (attribut `required`, `aria-required`, classe `.mandatory`).
 * - Injecte un astérisque rouge `<span class="required-asterisk">*</span>` dans
 *   les titres des questions `.mandatory` (marqueur `asterisk-injected` pour
 *   idempotence).
 * - Ajoute `aria-required="true"` sur les inputs non-hidden.
 * - Injecte une mention "Les champs marqués d'un * sont obligatoires" en
 *   haut de page selon plusieurs stratégies de placement (antibot, welcome,
 *   save, captcha, groupe de questions, fallback).
 */
export function handleRequiredFields() {
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
