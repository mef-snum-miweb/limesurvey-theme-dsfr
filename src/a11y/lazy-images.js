/**
 * Lazy loading et accessibilité des images de réponses.
 *
 * Ajoute `loading="lazy"` à toutes les images des zones de réponse et de
 * texte de question, et pose un attribut `alt` minimal (title ou texte
 * par défaut) quand il manque pour respecter RGAA 1.1.
 *
 * Idempotent : une classe CSS marqueur `dsfr-enhanced-image` est posée
 * pour détecter les images déjà traitées (côté styling uniquement).
 */

const IMAGE_SELECTORS = [
    '.answer-item img',
    '.fr-fieldset__content img',
    '.answertext img',
    '.fr-checkbox-group img',
    '.fr-radio-group img',
    '.question-text-container img',
    '.ls-question-text img',
    '.ls-question-help img',
];

export function enableImageLazyLoading() {
    const images = document.querySelectorAll(IMAGE_SELECTORS.join(', '));

    images.forEach(function (img) {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }

        if (!img.hasAttribute('alt') || img.getAttribute('alt').trim() === '') {
            const altText = img.hasAttribute('title') && img.getAttribute('title').trim() !== ''
                ? img.getAttribute('title')
                : 'Image de réponse';
            img.setAttribute('alt', altText);
        }

        if (!img.classList.contains('dsfr-enhanced-image')) {
            img.classList.add('dsfr-enhanced-image');
        }
    });
}
