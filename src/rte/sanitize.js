/**
 * Nettoyage du contenu RTE pour conformité DSFR.
 *
 * Supprime uniquement les styles inline de mise en forme ajoutés par les
 * contributeurs via l'éditeur de texte riche de LimeSurvey. Conserve les
 * styles fonctionnels injectés par JavaScript.
 *
 * L'exécution est conditionnée par l'option de thème `sanitize_rte_content`
 * exposée via `window.LSThemeOptions` par le template Twig.
 *
 * L'orchestration (DOMContentLoaded, pjax:complete, exposition sur window)
 * vit dans `src/index.js` — ce module n'expose que les fonctions pures.
 */

import { RTE_STYLE_PROPERTIES, RTE_CONTENT_SELECTORS } from './sanitize-constants.js';

export function shouldSkipElement(element) {
    if (!element) return true;

    if (element.classList && (
        element.classList.contains('required-asterisk') ||
        element.classList.contains('asterisk')
    )) return true;

    if (element.tagName === 'IMG') return true;

    if (element.querySelector && element.querySelector('img')) return true;

    if (element.closest && element.closest('[class*="upload"]')) return true;
    if (element.closest && element.closest('[class*="file"]')) return true;

    return false;
}

export function sanitizeElementStyles(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

    if (shouldSkipElement(element)) return;

    if (!element.hasAttribute('style')) return;

    RTE_STYLE_PROPERTIES.forEach((prop) => {
        element.style.removeProperty(prop);
    });

    if (element.getAttribute('style') === '' || element.style.cssText.trim() === '') {
        element.removeAttribute('style');
    }
}

export function removeDeprecatedAttributes(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    if (shouldSkipElement(element)) return;

    ['align', 'bgcolor', 'color', 'face', 'size'].forEach((attr) => {
        if (element.hasAttribute(attr)) {
            element.removeAttribute(attr);
        }
    });
}

export function sanitizeTree(root) {
    if (!root) return;

    sanitizeElementStyles(root);

    const children = root.querySelectorAll('*');
    children.forEach((child) => {
        sanitizeElementStyles(child);
    });
}

export function sanitizeRTEContent() {
    if (typeof window.LSThemeOptions === 'undefined' ||
        window.LSThemeOptions.sanitize_rte_content !== 'on') {
        return;
    }

    console.log('[DSFR] Nettoyage du contenu RTE...');

    RTE_CONTENT_SELECTORS.forEach((selector) => {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
                sanitizeTree(element);
            });
        } catch (e) {
            // Sélecteur invalide — ignoré
        }
    });

    console.log('[DSFR] Contenu RTE nettoyé');
}
