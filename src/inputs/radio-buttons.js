/**
 * Boutons radio DSFR — état visuel et gestion "Autre".
 *
 * - initBootstrapButtonsRadio : gère la classe .active sur les conteneurs
 *   .form-check quand un radio est coché, pour permettre un styling DSFR
 *   qui mime le comportement Bootstrap Buttons sans la lib.
 * - initRadioOtherField : affiche le champ "Autre" quand le radio
 *   correspondant est coché au chargement, et restaure la valeur depuis
 *   le champ hidden (`othertextaux`).
 */

export function initBootstrapButtonsRadio() {
    // Trouver tous les groupes de boutons radio
    const radioGroups = document.querySelectorAll('.radio-list[data-bs-toggle="buttons"]');

    radioGroups.forEach(function(group) {
        // Trouver tous les inputs radio dans ce groupe
        const radios = group.querySelectorAll('input[type="radio"]');

        radios.forEach(function(radio) {
            // Ajouter un event listener sur chaque radio
            radio.addEventListener('change', function() {
                if (this.checked) {
                    // Retirer la classe "active" de tous les conteneurs du même groupe
                    const allContainers = group.querySelectorAll('.bootstrap-buttons-div .form-check');
                    allContainers.forEach(function(container) {
                        container.classList.remove('active');
                    });

                    // Ajouter la classe "active" au conteneur du radio sélectionné
                    const currentContainer = this.closest('.form-check');
                    if (currentContainer) {
                        currentContainer.classList.add('active');
                    }
                }
            });

            // Initialiser l'état au chargement
            if (radio.checked) {
                const container = radio.closest('.form-check');
                if (container) {
                    container.classList.add('active');
                }
            }
        });
    });
}

/**
 * Initialise le champ "Autre" des radio buttons au chargement
 * - Affiche le champ si "autre" est sélectionné
 * - Restaure la valeur depuis le champ caché
 */
export function initRadioOtherField() {
    // Trouver tous les boutons radio "autre"
    const otherRadios = document.querySelectorAll('input[type="radio"][value="-oth-"]');

    otherRadios.forEach(function(radio) {
        const name = radio.name;
        const otherDiv = document.getElementById('div' + name + 'other');
        const otherInput = document.getElementById('answer' + name + 'othertext');
        const hiddenInput = document.getElementById('answer' + name + 'othertextaux');

        if (!otherDiv || !otherInput) return;

        // Si "autre" est sélectionné au chargement, afficher le champ et restaurer la valeur
        if (radio.checked) {
            otherDiv.classList.remove('ls-js-hidden');

            // Restaurer la valeur depuis le champ caché si elle existe
            if (hiddenInput && hiddenInput.value) {
                otherInput.value = hiddenInput.value;
            }
        }
    });
}
