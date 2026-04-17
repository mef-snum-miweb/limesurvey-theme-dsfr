/**
 * Correction de l'affichage mobile des tableaux dropdown-array.
 *
 * Le core LimeSurvey applique des styles inline sur les <td> des
 * dropdown-array qui empêchent la linéarisation mobile. On les retire au
 * chargement (< 768px), et on instancie un MutationObserver qui continue
 * à les retirer quand ils sont réappliqués dynamiquement.
 *
 * L'observer est partagé au niveau du module (singleton) — il est
 * créé/déconnecté par setupStyleObserver selon la largeur de la fenêtre.
 */

let styleObserver = null;

export function fixDropdownArrayInlineStyles() {
    // Seulement sur mobile (< 768px)
    if (window.innerWidth >= 768) {
        return;
    }

    // Cibler les tableaux dropdown-array
    const dropdownArrays = document.querySelectorAll('table.dropdown-array');

    dropdownArrays.forEach((table) => {
        // Trouver tous les td avec style inline
        const cells = table.querySelectorAll('tbody tr td[style*="display"]');

        cells.forEach(cell => {
            // Supprimer complètement l'attribut style
            cell.removeAttribute('style');
        });
    });
}

export function setupStyleObserver() {
    // Ne surveiller que sur mobile
    if (window.innerWidth >= 768) {
        if (styleObserver) {
            styleObserver.disconnect();
            styleObserver = null;
        }
        return;
    }

    // Si déjà actif, ne rien faire
    if (styleObserver) {
        return;
    }

    // Créer l'observer
    styleObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.tagName === 'TD' && target.closest('table.dropdown-array')) {
                    target.removeAttribute('style');
                }
            }
        });
    });

    // Observer tous les tableaux dropdown-array
    const dropdownArrays = document.querySelectorAll('table.dropdown-array');
    dropdownArrays.forEach(function(table) {
        styleObserver.observe(table, {
            attributes: true,
            attributeFilter: ['style'],
            subtree: true
        });
    });
}

// Helpers exposés pour les tests unitaires — ne pas utiliser en production.
export function __getStyleObserverForTest() {
    return styleObserver;
}

export function __resetStyleObserverForTest() {
    if (styleObserver) {
        styleObserver.disconnect();
        styleObserver = null;
    }
}
