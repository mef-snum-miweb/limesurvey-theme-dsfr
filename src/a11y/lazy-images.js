/**
 * Lazy loading et accessibilité des images de réponses.
 *
 * Ajoute `loading="lazy"` à toutes les images des zones de réponse et de
 * texte de question, et pose un attribut `alt` minimal (title ou texte
 * par défaut) quand il manque pour respecter RGAA 1.1.
 *
 * Pour le question_theme `imageselect`, le libellé admin peut contenir
 * du HTML `<img>` entier (saisie TinyMCE). Le template vanilla LS l'injecte
 * tel quel dans le `src` de l'image rendue — ce qui produit un src invalide
 * type `<img src="..." />`. On détecte ce cas et on extrait l'URL réelle.
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

const SAFE_URL_RE = /^(https?:\/\/|\/|\.\/|\.\.\/)/i;

/**
 * Whitelist de propriétés CSS autorisées dans le style extrait.
 * Le libellé admin TinyMCE pour imageselect injecte typiquement
 * `style="width:99px;height:56px"` qu'il faut conserver pour la mise en page.
 */
const ALLOWED_STYLE_PROPS = new Set([
    'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
    'object-fit', 'object-position',
]);

function sanitizeStyle(rawStyle) {
    if (typeof rawStyle !== 'string' || !rawStyle.trim()) return null;
    const safe = rawStyle
        .split(';')
        .map((decl) => decl.trim())
        .filter(Boolean)
        .map((decl) => {
            const idx = decl.indexOf(':');
            if (idx < 0) return null;
            const prop = decl.slice(0, idx).trim().toLowerCase();
            const value = decl.slice(idx + 1).trim();
            if (!ALLOWED_STYLE_PROPS.has(prop)) return null;
            // Rejette tout caractère suspect (url(), expression, etc.)
            if (/[()<>]/.test(value)) return null;
            return `${prop}: ${value}`;
        })
        .filter(Boolean)
        .join('; ');
    return safe || null;
}

/**
 * Si `rawSrc` est du HTML (ex. contient un `<img src="..." alt="..." style="...">`
 * entier collé par TinyMCE dans le libellé), parse-le et extrait les
 * attributs utiles : src, alt, style (filtré sur une whitelist de props CSS).
 * Renvoie `null` si l'entrée n'est pas du HTML ou ne contient pas d'<img>.
 *
 * Sécurité : `DOMParser.parseFromString('text/html')` isole le contenu,
 * aucun script ou handler inline ne s'exécute. On ne touche que des
 * attributs via `getAttribute`, jamais `innerHTML`. Le style est passé par
 * un filtre prop-whitelist pour neutraliser les valeurs non-présentationnelles.
 *
 * @param {string} rawSrc
 * @returns {{src: string, alt: string|null, style: string|null}|null}
 */
export function extractRealImageSrc(rawSrc) {
    if (typeof rawSrc !== 'string') return null;
    const trimmed = rawSrc.trim();
    if (!trimmed) return null;
    // Déjà décodé `<...>` ou encore encodé `&lt;...&gt;`
    if (!trimmed.startsWith('<') && !trimmed.startsWith('&lt;')) return null;

    let doc;
    try {
        doc = new DOMParser().parseFromString(rawSrc, 'text/html');
    } catch {
        return null;
    }
    const img = doc.querySelector('img');
    if (!img) return null;

    const src = (img.getAttribute('src') || '').trim();
    if (!src) return null;
    if (!SAFE_URL_RE.test(src)) return null; // rejette javascript:, data:, etc.
    const alt = img.getAttribute('alt');
    const style = sanitizeStyle(img.getAttribute('style'));
    return {
        src,
        alt: alt && alt.trim() ? alt : null,
        style,
    };
}

export function enableImageLazyLoading() {
    const images = document.querySelectorAll(IMAGE_SELECTORS.join(', '));

    images.forEach(function (img) {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }

        // Si le src contient du HTML (cas imageselect avec label TinyMCE qui
        // injecte `<img alt="…" src="…" style="width:…;height:…">` entier),
        // extraire et réappliquer les attributs utiles (src, alt, style).
        const rawSrc = img.getAttribute('src');
        if (rawSrc) {
            const extracted = extractRealImageSrc(rawSrc);
            if (extracted) {
                img.setAttribute('src', extracted.src);
                if (extracted.alt && (!img.hasAttribute('alt') || img.getAttribute('alt').trim() === '' || img.getAttribute('alt') === 'Image de réponse')) {
                    img.setAttribute('alt', extracted.alt);
                }
                if (extracted.style) {
                    // Merge avec le style existant du template (ex. `height: 200px`)
                    // sans écraser : les propriétés extraites priment sur les propriétés
                    // déjà posées par LS sur le même nom.
                    const existing = img.getAttribute('style') || '';
                    img.setAttribute('style', existing ? `${existing}; ${extracted.style}` : extracted.style);
                }
            }
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
