/**
 * Questions date (type D, mode selector) en input natif date/datetime-local.
 *
 * Le serveur LimeSurvey parse la réponse au FORMAT D'AFFICHAGE du
 * questionnaire (dateformatdetails, ex. « DD/MM/YYYY HH:mm ») — pas en ISO.
 * Le champ réponse est donc un champ texte `#answer{name}` (name={name},
 * masqué via .ls-js-hidden, saisissable sans JS comme le core 6.16.16) qui
 * porte la valeur au format du sondage ; l'input natif (sans name) n'est
 * que l'UI, et ce module convertit dans les deux sens.
 *
 * Conversion par tokens (YYYY, MM, DD, HH, mm, ss) à partir du format JS
 * fourni par le renderer (dateformatdetailsjs, conventions moment.js du
 * core) — générique, contrairement à l'ancien script inline qui ne savait
 * convertir que DD/MM/YYYY.
 */

const TOKENS = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss'];
const TOKEN_PATTERN = '(\\d{1,4})';

/** Décompose un format en suite de tokens et littéraux. */
function tokenizeFormat(fmt) {
    const parts = [];
    for (let i = 0; i < fmt.length;) {
        const token = TOKENS.find((t) => fmt.startsWith(t, i));
        if (token) {
            parts.push({ token });
            i += token.length;
        } else {
            parts.push({ literal: fmt[i] });
            i += 1;
        }
    }
    return parts;
}

/** Format d'affichage → composantes {YYYY,MM,DD,HH,mm,ss} (null si non parsable). */
function parseDisplayValue(value, fmt) {
    const parts = tokenizeFormat(fmt);
    const order = [];
    let re = '^\\s*';
    parts.forEach((p) => {
        if (p.token) {
            order.push(p.token);
            re += TOKEN_PATTERN;
        } else {
            re += '\\' + p.literal;
        }
    });
    re += '\\s*$';
    const m = value.match(new RegExp(re));
    if (!m) {
        return null;
    }
    const comp = { YYYY: '', MM: '01', DD: '01', HH: '00', mm: '00', ss: '00' };
    order.forEach((token, idx) => {
        comp[token] = m[idx + 1].padStart(token === 'YYYY' ? 4 : 2, '0');
    });
    return comp.YYYY ? comp : null;
}

/** Composantes → format d'affichage. */
function formatDisplayValue(comp, fmt) {
    return tokenizeFormat(fmt)
        .map((p) => (p.token ? comp[p.token] : p.literal))
        .join('');
}

/** Valeur d'input natif (ISO) → composantes. */
function parseNativeValue(value) {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!m) {
        return null;
    }
    return { YYYY: m[1], MM: m[2], DD: m[3], HH: m[4] || '00', mm: m[5] || '00', ss: m[6] || '00' };
}

/** Composantes → valeur d'input natif (ISO), avec ou sans heure. */
function formatNativeValue(comp, withTime) {
    const date = comp.YYYY + '-' + comp.MM + '-' + comp.DD;
    return withTime ? date + 'T' + comp.HH + ':' + comp.mm : date;
}

function notifyExpressionManager(answerField) {
    if (typeof window.$ !== 'undefined') {
        window.$(answerField).trigger('change');
    }
    if (typeof window.checkconditions === 'function') {
        window.checkconditions(answerField.value, answerField.name, 'text');
    }
}

function initOneDateInput(native) {
    if (native.dataset.lsDateInit) {
        return;
    }
    native.dataset.lsDateInit = '1';

    const name = native.dataset.lsDate;
    const fmt = native.dataset.format || 'YYYY-MM-DD';
    const withTime = native.type === 'datetime-local';
    const answerField = document.getElementById('answer' + name);
    if (!answerField) {
        return;
    }

    // Pré-remplissage : la valeur stockée (format d'affichage) pilote l'UI.
    if (answerField.value) {
        const comp = parseDisplayValue(answerField.value, fmt);
        if (comp) {
            native.value = formatNativeValue(comp, withTime);
        }
    }

    // Saisie via l'UI native → réécrit la réponse au format du sondage.
    native.addEventListener('change', () => {
        if (native.value === '') {
            answerField.value = '';
        } else {
            const comp = parseNativeValue(native.value);
            if (comp) {
                answerField.value = formatDisplayValue(comp, fmt);
            }
        }
        notifyExpressionManager(answerField);
    });

    // Écriture côté EM / saisie no-JS devenue visible → resynchronise l'UI.
    answerField.addEventListener('change', () => {
        if (answerField.value === '') {
            native.value = '';
            return;
        }
        const comp = parseDisplayValue(answerField.value, fmt);
        if (comp) {
            native.value = formatNativeValue(comp, withTime);
        }
    });
}

/**
 * Initialise tous les inputs date natifs de la page (idempotent).
 */
export function initNativeDateInputs() {
    document.querySelectorAll('input[data-ls-date]').forEach(initOneDateInput);
}

// Exposé pour les tests unitaires.
export { parseDisplayValue, formatDisplayValue, parseNativeValue, formatNativeValue };
