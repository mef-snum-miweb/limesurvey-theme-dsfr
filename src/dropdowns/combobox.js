/**
 * Combobox DSFR accessible — remplacement runtime du widget bootstrap-select.
 *
 * LimeSurvey peut rendre certains `list_dropdown` via un question_theme qui
 * transforme le `<select>` en widget `bootstrap-select` (via la lib tierce
 * `$.fn.selectpicker`). Ce widget n'est pas conforme DSFR et l'accessibilité
 * clavier/lecteur d'écran est imparfaite.
 *
 * Plutôt que d'overrider un template Twig (dont le chemin dépend du
 * question_theme utilisé), on intercepte les `<select>` côté DOM juste après
 * le rendu et on les upgrade en combobox ARIA 1.2 — pattern
 * https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 *
 * Sécurité : toute construction DOM passe par `createElement` +
 * `setAttribute` + `textContent`. Pas de `innerHTML` avec données DOM (ADR-006).
 */

const ACTIVE_SELECTOR = 'select.list-question-select, select.dsfr-input[data-width]';
const UPGRADED_FLAG = 'data-dsfr-combobox';

let comboboxCounter = 0;
let globalClickHandler = null;
const registeredInstances = new Set();

/**
 * Point d'entrée à appeler dans `onReady / onQuestionsLoaded / onPjax`.
 * Idempotent : un second appel ne re-upgrade pas un select déjà traité.
 */
export function initSearchableDropdowns(root = document) {
    ensureGlobalClickHandler();

    const selects = root.querySelectorAll(ACTIVE_SELECTOR);
    selects.forEach((select) => {
        if (select.getAttribute(UPGRADED_FLAG) === '1') {
            return;
        }
        try {
            upgradeToCombobox(select);
        } catch (err) {
            // Jamais faire crasher la page pour un select impossible à upgrader.
            // eslint-disable-next-line no-console
            console.warn('[dsfr-combobox] upgrade failed, falling back to native select', err);
        }
    });
}

/**
 * Transforme un `<select>` en combobox DSFR accessible.
 * Le `<select>` est conservé caché pour la soumission et la compatibilité
 * Expression Manager (em_javascript.js écoute `change` dessus).
 *
 * @param {HTMLSelectElement} select
 */
export function upgradeToCombobox(select) {
    if (!(select instanceof HTMLSelectElement)) return;
    if (select.multiple) return; // Hors scope : multi-select pas encore supporté.
    if (select.getAttribute(UPGRADED_FLAG) === '1') return;

    // Si un wrapper bootstrap-select a déjà été construit autour, l'unwrap.
    unwrapBootstrapSelect(select);

    comboboxCounter += 1;
    const uid = `dsfr-cb-${comboboxCounter}`;
    const listboxId = `${uid}-listbox`;
    const inputId = `${uid}-input`;

    const options = Array.from(select.options).map((opt, index) => ({
        value: opt.value,
        label: opt.textContent || '',
        selected: opt.selected,
        disabled: opt.disabled,
        index,
    }));

    const selectedOption = options.find((o) => o.selected) || options[0] || null;
    const placeholder = options.length > 0 && options[0].value === ''
        ? options[0].label
        : '';

    // --- Wrapper ---
    const wrapper = document.createElement('div');
    wrapper.className = 'dsfr-combobox fr-select-group';
    wrapper.setAttribute('data-dsfr-combobox-wrapper', '1');

    // --- Input combobox ---
    const input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('role', 'combobox');
    input.className = 'fr-select dsfr-combobox-input';
    input.id = inputId;
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', listboxId);
    input.setAttribute('autocomplete', 'off');
    if (placeholder) {
        input.setAttribute('placeholder', placeholder);
    }
    // Reprendre aria-labelledby / aria-describedby du select source
    const ariaLabelledBy = select.getAttribute('aria-labelledby');
    if (ariaLabelledBy) input.setAttribute('aria-labelledby', ariaLabelledBy);
    const ariaDescribedBy = select.getAttribute('aria-describedby');
    if (ariaDescribedBy) input.setAttribute('aria-describedby', ariaDescribedBy);
    if (selectedOption && selectedOption.value !== '') {
        input.value = selectedOption.label;
    }

    // --- Bouton toggle ---
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'dsfr-combobox-toggle fr-icon-arrow-down-s-line';
    toggle.setAttribute('aria-label', 'Ouvrir la liste');
    toggle.setAttribute('tabindex', '-1');

    // --- Listbox ---
    const listbox = document.createElement('ul');
    listbox.setAttribute('role', 'listbox');
    listbox.id = listboxId;
    listbox.className = 'dsfr-combobox-listbox';
    listbox.hidden = true;

    options.forEach((opt, index) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.id = `${uid}-opt-${index}`;
        li.className = 'dsfr-combobox-option';
        li.dataset.value = opt.value;
        li.dataset.label = opt.label;
        li.textContent = opt.label;
        if (opt.disabled) {
            li.setAttribute('aria-disabled', 'true');
        }
        if (opt.selected && opt.value !== '') {
            li.setAttribute('aria-selected', 'true');
        } else {
            li.setAttribute('aria-selected', 'false');
        }
        listbox.appendChild(li);
    });

    // --- Status aria-live ---
    const status = document.createElement('div');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.className = 'fr-sr-only dsfr-combobox-status';

    // --- Assemblage ---
    wrapper.appendChild(input);
    wrapper.appendChild(toggle);
    wrapper.appendChild(listbox);
    wrapper.appendChild(status);

    // --- Caché : le <select> d'origine reste pour le submit ---
    select.setAttribute(UPGRADED_FLAG, '1');
    select.setAttribute('aria-hidden', 'true');
    select.setAttribute('tabindex', '-1');
    // Classes de compat : certains scripts LS (em_sq_validation etc.) cherchent
    // le select via des sélecteurs fonctionnels, on les laisse en place.
    select.style.position = 'absolute';
    select.style.width = '1px';
    select.style.height = '1px';
    select.style.padding = '0';
    select.style.margin = '-1px';
    select.style.overflow = 'hidden';
    select.style.clip = 'rect(0, 0, 0, 0)';
    select.style.whiteSpace = 'nowrap';
    select.style.border = '0';

    if (select.parentNode) {
        select.parentNode.insertBefore(wrapper, select);
    }

    // --- État interne ---
    const instance = {
        uid,
        select,
        wrapper,
        input,
        toggle,
        listbox,
        status,
        options,
        activeIndex: -1,
        open: false,
    };

    registeredInstances.add(instance);

    // --- Handlers ---
    input.addEventListener('input', () => onInput(instance));
    input.addEventListener('keydown', (e) => onKeyDown(instance, e));
    input.addEventListener('focus', () => {
        // N'ouvre pas automatiquement à focus (UX moins intrusive)
    });
    input.addEventListener('click', () => openListbox(instance));
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (instance.open) {
            closeListbox(instance);
        } else {
            openListbox(instance);
            input.focus();
        }
    });

    listbox.addEventListener('mousedown', (e) => {
        // mousedown avant blur pour éviter que l'input ne perde le focus.
        const li = e.target.closest('li[role="option"]');
        if (!li) return;
        e.preventDefault();
        const index = instance.options.findIndex((o) => o.value === li.dataset.value);
        if (index >= 0) {
            selectOption(instance, index);
        }
    });

    // Sélection initiale cohérente avec le select source.
    const initialIndex = options.findIndex((o) => o.selected);
    if (initialIndex >= 0 && options[initialIndex].value !== '') {
        setActiveOption(instance, initialIndex, { scroll: false });
    }
}

function unwrapBootstrapSelect(select) {
    const bsWrapper = select.closest('.bootstrap-select');
    if (!bsWrapper || !bsWrapper.parentNode) return;
    // Remonte le select à l'emplacement du wrapper bootstrap et retire le reste.
    bsWrapper.parentNode.insertBefore(select, bsWrapper);
    bsWrapper.parentNode.removeChild(bsWrapper);
    // Retire les classes spécifiques à la lib pour éviter les styles orphelins.
    select.classList.remove('form-control', 'bs-select-hidden');
}

function onInput(instance) {
    const query = instance.input.value;
    filterOptions(instance, query);
    openListbox(instance);
}

function filterOptions(instance, query) {
    const normalized = normalize(query);
    let visibleCount = 0;
    Array.from(instance.listbox.children).forEach((li, index) => {
        const label = instance.options[index].label;
        const match = normalize(label).includes(normalized);
        li.hidden = !match;
        if (match) visibleCount += 1;
    });
    announceStatus(instance, visibleCount);

    // Réaligne l'activeIndex sur la première option visible si l'actuelle est masquée.
    if (instance.activeIndex >= 0) {
        const active = instance.listbox.children[instance.activeIndex];
        if (active && active.hidden) {
            const firstVisible = Array.from(instance.listbox.children).findIndex((li) => !li.hidden);
            setActiveOption(instance, firstVisible);
        }
    }
}

function normalize(str) {
    return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
}

function announceStatus(instance, count) {
    if (count === 0) {
        instance.status.textContent = 'Aucun résultat';
    } else if (count === 1) {
        instance.status.textContent = '1 résultat disponible';
    } else {
        instance.status.textContent = `${count} résultats disponibles`;
    }
}

function openListbox(instance) {
    if (instance.open) return;
    instance.open = true;
    instance.listbox.hidden = false;
    instance.input.setAttribute('aria-expanded', 'true');
    instance.toggle.setAttribute('aria-label', 'Fermer la liste');
    if (instance.activeIndex < 0) {
        const firstVisible = Array.from(instance.listbox.children).findIndex((li) => !li.hidden);
        if (firstVisible >= 0) {
            setActiveOption(instance, firstVisible);
        }
    }
}

function closeListbox(instance) {
    if (!instance.open) return;
    instance.open = false;
    instance.listbox.hidden = true;
    instance.input.setAttribute('aria-expanded', 'false');
    instance.input.removeAttribute('aria-activedescendant');
    instance.toggle.setAttribute('aria-label', 'Ouvrir la liste');
    // Réinitialise la visibilité des options
    Array.from(instance.listbox.children).forEach((li) => {
        li.hidden = false;
    });
}

function setActiveOption(instance, index, { scroll = true } = {}) {
    const previous = instance.listbox.children[instance.activeIndex];
    if (previous) {
        previous.classList.remove('is-active');
    }
    instance.activeIndex = index;
    const current = instance.listbox.children[index];
    if (!current) {
        instance.input.removeAttribute('aria-activedescendant');
        return;
    }
    current.classList.add('is-active');
    instance.input.setAttribute('aria-activedescendant', current.id);
    if (scroll) {
        if (typeof current.scrollIntoView === 'function') {
            current.scrollIntoView({ block: 'nearest' });
        }
    }
}

function moveActive(instance, delta) {
    const visibleIndexes = Array.from(instance.listbox.children)
        .map((li, i) => (li.hidden ? -1 : i))
        .filter((i) => i >= 0);
    if (visibleIndexes.length === 0) return;
    const currentPos = visibleIndexes.indexOf(instance.activeIndex);
    let nextPos = currentPos + delta;
    if (nextPos < 0) nextPos = visibleIndexes.length - 1;
    if (nextPos >= visibleIndexes.length) nextPos = 0;
    setActiveOption(instance, visibleIndexes[nextPos]);
}

function selectOption(instance, index) {
    const opt = instance.options[index];
    if (!opt || opt.disabled) return;
    instance.input.value = opt.value === '' ? '' : opt.label;
    // Met à jour le select caché + dispatch change pour Expression Manager.
    instance.select.value = opt.value;
    instance.select.dispatchEvent(new Event('change', { bubbles: true }));
    // aria-selected : un seul à la fois
    Array.from(instance.listbox.children).forEach((li, i) => {
        li.setAttribute('aria-selected', i === index && opt.value !== '' ? 'true' : 'false');
    });
    closeListbox(instance);
    instance.input.focus();
}

function onKeyDown(instance, event) {
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            if (!instance.open) openListbox(instance);
            else moveActive(instance, 1);
            break;
        case 'ArrowUp':
            event.preventDefault();
            if (!instance.open) openListbox(instance);
            else moveActive(instance, -1);
            break;
        case 'Enter':
            if (instance.open && instance.activeIndex >= 0) {
                event.preventDefault();
                selectOption(instance, instance.activeIndex);
            }
            break;
        case 'Escape':
            if (instance.open) {
                event.preventDefault();
                closeListbox(instance);
            } else if (instance.input.value !== '') {
                event.preventDefault();
                instance.input.value = '';
                filterOptions(instance, '');
            }
            break;
        case 'Home':
            if (instance.open) {
                event.preventDefault();
                const firstVisible = Array.from(instance.listbox.children).findIndex((li) => !li.hidden);
                if (firstVisible >= 0) setActiveOption(instance, firstVisible);
            }
            break;
        case 'End':
            if (instance.open) {
                event.preventDefault();
                const visible = Array.from(instance.listbox.children)
                    .map((li, i) => (li.hidden ? -1 : i))
                    .filter((i) => i >= 0);
                if (visible.length > 0) setActiveOption(instance, visible[visible.length - 1]);
            }
            break;
        case 'Tab':
            closeListbox(instance);
            break;
        default:
            break;
    }
}

function ensureGlobalClickHandler() {
    if (globalClickHandler) return;
    globalClickHandler = (event) => {
        registeredInstances.forEach((instance) => {
            if (!instance.open) return;
            if (!instance.wrapper.contains(event.target)) {
                closeListbox(instance);
            }
        });
    };
    document.addEventListener('click', globalClickHandler, { capture: true });
}
