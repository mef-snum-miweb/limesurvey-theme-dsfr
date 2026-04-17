/**
 * Bannière console à l'ouverture du thème DSFR.
 *
 * Side-effect à l'import : affiche un ASCII-art dans la console navigateur
 * qui signale l'origine du thème (Mission Ingénierie du Web — Bercy).
 * Exécutée une seule fois, au chargement du bundle.
 */

console.log(
    '%c\n' +
    '             Développé avec ❤️ par la                   \n' +
    '                                                        \n' +
    '       ███╗   ███╗██╗██╗    ██╗███████╗██████╗           \n' +
    '       ████╗ ████║██║██║    ██║██╔════╝██╔══██╗          \n' +
    '       ██╔████╔██║██║██║ █╗ ██║█████╗  ██████╔╝          \n' +
    '       ██║╚██╔╝██║██║██║███╗██║██╔══╝  ██╔══██╗          \n' +
    '       ██║ ╚═╝ ██║██║╚███╔███╔╝███████╗██████╔╝          \n' +
    '       ╚═╝     ╚═╝╚═╝ ╚══╝╚══╝ ╚══════╝╚═════╝           \n' +
    '                                                        \n' +
    '           Mission Ingénierie du Web                   \n' +
    '    Ministère de l\'Économie et des Finances         \n' +
    '    https://github.com/bmatge/limesurvey-theme-dsfr  \n' +
    '    Thème DSFR pour LimeSurvey - 2025 - Etalab 2.0    \n',
    'color: #000091; font-weight: bold;'
);
