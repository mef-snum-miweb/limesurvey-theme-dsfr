/**
 * i18n minimal du thème DSFR.
 *
 * Détection de langue via `<html lang>` (2 premiers caractères).
 * Anglais si "en", sinon français (fallback).
 *
 * Deux familles indépendantes : messages de compteur obligatoires (mandatory)
 * et libellés des contrôles de ranking. Chaque helper interpole ses placeholders
 * (`%remaining%`, `%total%`, `%s`) selon les arguments fournis.
 */

export const MANDATORY_I18N_FR = {
    fields_remaining_plural: 'Veuillez compléter les %remaining% champs restants sur %total%.',
    fields_remaining_singular: 'Veuillez compléter le dernier champ.',
    fields_all_required: 'Veuillez compléter tous les champs (%total% champs requis).',
    // Variante « lignes » pour les tableaux à choix (radios) : une réponse par ligne.
    rows_remaining_plural: 'Veuillez répondre aux %remaining% lignes restantes sur %total%.',
    rows_remaining_singular: 'Veuillez répondre à la dernière ligne.',
    rows_all_required: 'Veuillez répondre à toutes les lignes (%total% lignes).',
    field_valid: 'Saisie valide',
    numeric_only: "Ce champ n'accepte que des valeurs numériques.",
};

export const MANDATORY_I18N_EN = {
    fields_remaining_plural: 'Please complete the remaining %remaining% of %total% fields.',
    fields_remaining_singular: 'Please complete the last field.',
    fields_all_required: 'Please complete all fields (%total% fields required).',
    rows_remaining_plural: 'Please answer the remaining %remaining% of %total% rows.',
    rows_remaining_singular: 'Please answer the last row.',
    rows_all_required: 'Please answer all rows (%total% rows).',
    field_valid: 'Valid input',
    numeric_only: 'This field only accepts numeric values.',
};

export function tMandatory(key, remaining, total) {
    const lang = (document.documentElement.lang || 'fr').toLowerCase().substring(0, 2);
    const dict = lang === 'en' ? MANDATORY_I18N_EN : MANDATORY_I18N_FR;
    let str = dict[key] || MANDATORY_I18N_FR[key] || key;
    if (typeof remaining !== 'undefined') {
        str = str.replace('%remaining%', remaining);
    }
    if (typeof total !== 'undefined') {
        str = str.replace('%total%', total);
    }
    return str;
}

export const RANKING_I18N_FR = {
    ranking_actions_for: 'Actions pour %s',
    ranking_add: 'Ajouter au classement',
    ranking_add_aria: 'Ajouter %s au classement',
    ranking_up: 'Monter',
    ranking_up_aria: 'Monter %s',
    ranking_down: 'Descendre',
    ranking_down_aria: 'Descendre %s',
    ranking_remove: 'Retirer',
    ranking_remove_aria: 'Retirer %s du classement',
};

export const RANKING_I18N_EN = {
    ranking_actions_for: 'Actions for %s',
    ranking_add: 'Add to ranking',
    ranking_add_aria: 'Add %s to ranking',
    ranking_up: 'Move up',
    ranking_up_aria: 'Move %s up',
    ranking_down: 'Move down',
    ranking_down_aria: 'Move %s down',
    ranking_remove: 'Remove',
    ranking_remove_aria: 'Remove %s from ranking',
};

export function tRanking(key, label) {
    const lang = (document.documentElement.lang || 'fr').toLowerCase().substring(0, 2);
    const dict = lang === 'en' ? RANKING_I18N_EN : RANKING_I18N_FR;
    let str = dict[key] || RANKING_I18N_FR[key] || key;
    if (typeof label !== 'undefined') {
        str = str.replace('%s', label);
    }
    return str;
}

export const UI_I18N_FR = {
    field_mandatory: 'Ce champ est obligatoire',
    thanks_answered: "Merci d'avoir répondu",
    numeric_chars_only: "Ce champ n'accepte que des chiffres. Les caractères non numériques sont automatiquement supprimés.",
    captcha_enter_answer: 'Veuillez saisir votre réponse',
    summary_all_fixed_title: 'Toutes les erreurs ont été corrigées',
    summary_all_fixed_desc: 'Vous pouvez maintenant soumettre le formulaire.',
    summary_one_error: 'Une erreur à corriger',
    summary_n_errors: '%n% erreurs à corriger',
    summary_fix_following: 'Veuillez corriger les erreurs suivantes :',
    summary_untitled_question: 'Question sans titre',
    summary_fixed_one: '%s corrigée.',
    summary_fixed_n: '%n% erreurs corrigées.',
    summary_new_error: 'Nouvelle erreur : %s.',
    summary_new_errors: '%n% nouvelles erreurs.',
    summary_all_fixed_announce: 'Toutes les erreurs ont été corrigées. Vous pouvez soumettre le formulaire.',
    summary_remaining_one: 'Il reste 1 erreur.',
    summary_remaining_n: 'Il reste %n% erreurs.',
    conditional_question: 'Cette question est conditionnelle.',
    conditional_a_question: 'Une question',
    conditional_revealed: 'Nouvelle question affichée : %s',
    ranking_max_reached: 'Nombre maximum de réponses atteint',
    ranking_added_at: '%s ajouté au classement en position %n%',
    ranking_moved_to: '%s déplacé en position %n%',
};

export const UI_I18N_EN = {
    field_mandatory: 'This field is mandatory',
    thanks_answered: 'Thank you for answering',
    numeric_chars_only: 'This field only accepts digits. Non-numeric characters are removed automatically.',
    captcha_enter_answer: 'Please enter your answer',
    summary_all_fixed_title: 'All errors have been fixed',
    summary_all_fixed_desc: 'You can now submit the form.',
    summary_one_error: 'One error to fix',
    summary_n_errors: '%n% errors to fix',
    summary_fix_following: 'Please fix the following errors:',
    summary_untitled_question: 'Untitled question',
    summary_fixed_one: '%s fixed.',
    summary_fixed_n: '%n% errors fixed.',
    summary_new_error: 'New error: %s.',
    summary_new_errors: '%n% new errors.',
    summary_all_fixed_announce: 'All errors have been fixed. You can submit the form.',
    summary_remaining_one: 'There is 1 error left.',
    summary_remaining_n: 'There are %n% errors left.',
    conditional_question: 'This question is conditional.',
    conditional_a_question: 'A question',
    conditional_revealed: 'New question displayed: %s',
    ranking_max_reached: 'Maximum number of answers reached',
    ranking_added_at: '%s added to ranking at position %n%',
    ranking_moved_to: '%s moved to position %n%',
};

/**
 * Chaînes d'interface générales (validation, récapitulatif, annonces SR).
 * Placeholders : %s (libellé), %n% (nombre).
 */
export function tUI(key, label, n) {
    const lang = (document.documentElement.lang || 'fr').toLowerCase().substring(0, 2);
    const dict = lang === 'en' ? UI_I18N_EN : UI_I18N_FR;
    let str = dict[key] || UI_I18N_FR[key] || key;
    if (typeof label !== 'undefined' && label !== null) {
        str = str.replace('%s', label);
    }
    if (typeof n !== 'undefined') {
        str = str.replace('%n%', n);
    }
    return str;
}
