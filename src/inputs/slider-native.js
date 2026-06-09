/**
 * Sliders multiplenumeric (type K) en range HTML5 natif.
 *
 * Reproduit le contrat du LSSlider core (6.16.16) avec un <input type=range> :
 *
 * - Le champ RÉPONSE est `#answer{myfname}` (name={myfname}, texte masqué
 *   par .ls-js-hidden, visible sans JS) : il reste VIDE tant que le curseur
 *   n'a pas été touché — un range natif ayant toujours une valeur, c'est ce
 *   champ séparé qui porte la sémantique « non répondu ».
 * - Le range (`#answer{myfname}slid`, sans name) n'est que l'UI : sa position
 *   initiale est purement visuelle (slider_position / milieu de plage).
 * - `slider_default_set` : la valeur par défaut pré-remplit le champ réponse
 *   (équivalent du setPosition/setVal de LSSlider).
 * - Reset : champ réponse revidé (état « non répondu »), pas (min+max)/2.
 * - prefix/suffix/séparateur décimal appliqués à l'affichage (fr-range__output),
 *   séparateur appliqué à la valeur soumise (convention des champs numériques LS).
 * - Notifie l'Expression Manager via checkconditions() + trigger jQuery keyup,
 *   comme les champs numériques core.
 *
 * Données portées par le range en data-attributes (cf. horizontal_slider.twig
 * et vertical_slider.twig) : data-ls-slider (myfname), data-separator,
 * data-prefix, data-suffix, data-reset-position.
 */

const EMPTY_DISPLAY = '–'; // tiret demi-cadratin : « pas encore de réponse »

function notifyExpressionManager(answerField) {
    if (typeof window.$ !== 'undefined') {
        window.$(answerField).trigger('keyup');
    }
    if (typeof window.checkconditions === 'function') {
        window.checkconditions(answerField.value, answerField.name, 'text');
    }
}

function initOneSlider(range) {
    if (range.dataset.lsSliderInit) {
        return;
    }
    range.dataset.lsSliderInit = '1';

    const myfname = range.dataset.lsSlider;
    const answerField = document.getElementById('answer' + myfname);
    const output = document.getElementById('output-' + myfname);
    if (!answerField) {
        return;
    }

    const separator = range.dataset.separator || '.';
    const prefix = range.dataset.prefix || '';
    const suffix = range.dataset.suffix || '';

    const updateOutput = () => {
        if (!output) {
            return;
        }
        output.textContent = answerField.value === ''
            ? EMPTY_DISPLAY
            : prefix + answerField.value + suffix;
    };

    // Synchronise l'UI avec une valeur existante (reprise de session,
    // valeur par défaut posée côté Twig).
    if (answerField.value !== '') {
        const numeric = answerField.value.replace(separator, '.');
        if (numeric !== '' && !isNaN(Number(numeric))) {
            range.value = numeric;
        }
        range.classList.remove('slider-untouched');
        answerField.classList.remove('slider-untouched');
    }
    updateOutput();

    // Toute manipulation du curseur écrit la réponse (input = temps réel).
    range.addEventListener('input', () => {
        answerField.value = String(range.value).replace('.', separator);
        range.classList.remove('slider-untouched');
        answerField.classList.remove('slider-untouched');
        updateOutput();
    });
    range.addEventListener('change', () => {
        notifyExpressionManager(answerField);
    });

    // Saisie directe dans le champ texte (mode no-JS devenu visible, ou
    // écriture par l'EM) : on resynchronise l'UI au change.
    answerField.addEventListener('change', () => {
        const numeric = answerField.value.replace(separator, '.');
        if (numeric !== '' && !isNaN(Number(numeric))) {
            range.value = numeric;
            range.classList.remove('slider-untouched');
        }
        updateOutput();
    });

    // Reset : retour à l'état « non répondu » (champ vide), position
    // du curseur purement visuelle.
    const resetBtn = document.getElementById('answer' + myfname + '_resetslider');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            answerField.value = '';
            range.classList.add('slider-untouched');
            answerField.classList.add('slider-untouched');
            const resetPosition = range.dataset.resetPosition;
            if (resetPosition !== undefined && resetPosition !== '') {
                range.value = resetPosition;
            }
            updateOutput();
            notifyExpressionManager(answerField);
        });
    }
}

/**
 * Initialise tous les sliders natifs de la page (idempotent).
 */
export function initNativeSliders() {
    document.querySelectorAll('input[type="range"][data-ls-slider]').forEach(initOneSlider);
}
