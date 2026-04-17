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
    field_valid: 'Saisie valide',
    numeric_only: "Ce champ n'accepte que des valeurs numériques.",
};

export const MANDATORY_I18N_EN = {
    fields_remaining_plural: 'Please complete the remaining %remaining% of %total% fields.',
    fields_remaining_singular: 'Please complete the last field.',
    fields_all_required: 'Please complete all fields (%total% fields required).',
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
