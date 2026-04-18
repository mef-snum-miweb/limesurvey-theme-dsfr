/**
 * Synchronisation `aria-invalid` (RGAA 11.10).
 *
 * Pose systématiquement `aria-invalid="true"` sur les inputs des questions
 * `.input-error`, et `aria-invalid="false"` (ou retire l'attribut) quand
 * l'erreur est résolue. Observe les mutations de classes sur le body pour
 * rester synchrone avec les changements dynamiques de LimeSurvey Expression
 * Manager, qui ne manipule pas `aria-invalid` lui-même.
 *
 * `syncAriaInvalidInContainer` et `syncAllErrorFields` sont exportés
 * séparément pour être testables unitairement sans instancier l'observer.
 *
 * Un MutationObserver est instancié en continu par `initAriaInvalidSync` ;
 * l'orchestration évite la double instanciation en ne l'appelant qu'une
 * fois au chargement.
 */

/**
 * Pose ou retire `aria-invalid` sur tous les champs visibles d'un conteneur.
 * Ignore les inputs hidden et les hiddens internes LimeSurvey (id `java*`).
 */
export function syncAriaInvalidInContainer(container, hasError) {
    var fields = container.querySelectorAll('input, textarea, select');
    fields.forEach(function (field) {
        if (field.type === 'hidden' || (field.id && field.id.indexOf('java') === 0)) return;
        if (hasError) {
            field.setAttribute('aria-invalid', 'true');
        } else {
            field.removeAttribute('aria-invalid');
        }
    });
}

/**
 * Parcourt tout le document et pose `aria-invalid="true"` sur chaque champ ou
 * conteneur déjà marqué en erreur au moment de l'appel.
 */
export function syncAllErrorFields() {
    document.querySelectorAll('.fr-input--error, input.error, textarea.error, select.error').forEach(function (input) {
        input.setAttribute('aria-invalid', 'true');
    });
    document.querySelectorAll('.question-container.input-error, .fr-input-group--error').forEach(function (container) {
        syncAriaInvalidInContainer(container, true);
    });
}

export function initAriaInvalidSync() {
    // Exécuter immédiatement, après un tick, et après un court délai
    // pour couvrir les handlers EM et MutationObserver qui peuvent
    // modifier les classes d'erreur après DOMContentLoaded.
    syncAllErrorFields();
    setTimeout(syncAllErrorFields, 0);
    setTimeout(syncAllErrorFields, 50);

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') return;
            var el = mutation.target;

            if (el.matches && el.matches('input, textarea, select')) {
                var hasFieldError = el.classList.contains('fr-input--error') || el.classList.contains('error');
                var parentContainer = el.closest('.question-container');
                var hasContainerError = parentContainer && parentContainer.classList.contains('input-error');
                if (hasFieldError || hasContainerError) {
                    el.setAttribute('aria-invalid', 'true');
                } else {
                    el.removeAttribute('aria-invalid');
                }
            }

            if (el.classList && el.classList.contains('question-container')) {
                var containerError = el.classList.contains('input-error');
                syncAriaInvalidInContainer(el, containerError);
            }

            if (el.classList && el.classList.contains('fr-input-group')) {
                var groupError = el.classList.contains('fr-input-group--error');
                syncAriaInvalidInContainer(el, groupError);
            }
        });
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true,
    });
}
