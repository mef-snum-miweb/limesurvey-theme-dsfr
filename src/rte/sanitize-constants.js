/**
 * Constantes du nettoyage RTE (conformité DSFR).
 *
 * Les propriétés listées ici sont retirées des attributs `style` inline ;
 * les propriétés fonctionnelles (display, visibility, position, top/left,
 * width/height, transform, opacity, z-index, overflow, etc.) sont préservées.
 *
 * Les sélecteurs définissent le périmètre du nettoyage — on ne touche pas
 * au contenu des réponses, uniquement aux titres et aux aides.
 */

export const RTE_STYLE_PROPERTIES = [
    'color',
    'background-color',
    'background',
    'font-size',
    'font-family',
    'font-weight',
    'font-style',
    'text-decoration',
    'text-align',
    'line-height',
    'letter-spacing',
    'text-transform',
    'text-indent',
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border',
    'border-color',
    'border-width',
    'border-style',
];

export const RTE_CONTENT_SELECTORS = [
    '.question-title-container',
    '.question-help-container',
];
