/**
 * Fix pour les questions Multiple Short Text avec Input On Demand.
 *
 * LimeSurvey rend ce type de question avec un bouton "Ajouter une ligne"
 * qui affiche un nouveau champ masqué (classe .d-none). Le core a son
 * propre listener qui interfère avec notre logique DSFR ; on intercepte
 * en phase capture pour le bloquer avant qu'il ne s'exécute, puis on
 * gère nous-mêmes l'affichage du prochain champ caché.
 *
 * `initMultipleShortText` appelle les 3 autres dans l'ordre :
 * restore → reinit → updateAddButtonVisibility. Idempotent via
 * `dataset.initialized` sur chaque bouton.
 */

export function reinitInputOnDemand() {
    const addButtons = document.querySelectorAll('.selector--inputondemand-addlinebutton');

    addButtons.forEach(button => {
        if (button.dataset.initialized) return;
        button.dataset.initialized = 'true';

        const container = button.closest('[id^="selector--inputondemand-"]');
        if (!container) return;

        const itemsList = container.querySelector('.selector--inputondemand-list');
        if (!itemsList) return;

        // Utiliser capture=true pour intercepter avant les autres listeners
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation(); // Bloquer les autres listeners (LimeSurvey natif)

            const hiddenItems = itemsList.querySelectorAll('.selector--inputondemand-list-item.d-none');

            if (hiddenItems.length > 0) {
                const nextItem = hiddenItems[0];
                nextItem.classList.remove('d-none');

                const input = nextItem.querySelector('input, textarea');
                if (input) setTimeout(() => input.focus(), 100);

                if (hiddenItems.length === 1) button.style.display = 'none';
            }
        }, true); // Capture phase = true pour s'exécuter avant les autres
    });
}

/**
 * Affiche les lignes visibles après validation échouée
 */
export function restoreVisibleLines() {
    const containers = document.querySelectorAll('[id^="selector--inputondemand-"]');

    containers.forEach(container => {
        const itemsList = container.querySelector('.selector--inputondemand-list');
        if (!itemsList) return;

        const allItems = itemsList.querySelectorAll('.selector--inputondemand-list-item');
        const hiddenItems = itemsList.querySelectorAll('.selector--inputondemand-list-item.d-none');

        if (hiddenItems.length === allItems.length && allItems.length > 0) {
            allItems[0].classList.remove('d-none');
        }
    });
}

/**
 * Gère l'affichage du bouton "Ajouter une ligne"
 */
export function updateAddButtonVisibility() {
    const containers = document.querySelectorAll('[id^="selector--inputondemand-"]');

    containers.forEach(container => {
        const button = container.querySelector('.selector--inputondemand-addlinebutton');
        const itemsList = container.querySelector('.selector--inputondemand-list');

        if (!button || !itemsList) return;

        const hiddenItems = itemsList.querySelectorAll('.selector--inputondemand-list-item.d-none');
        button.style.display = hiddenItems.length > 0 ? '' : 'none';
    });
}

/**
 * Initialisation
 */
export function initMultipleShortText() {
    restoreVisibleLines();
    reinitInputOnDemand();
    updateAddButtonVisibility();
}
