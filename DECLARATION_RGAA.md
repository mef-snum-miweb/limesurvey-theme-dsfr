# Déclaration d'accessibilité

**Ministère de l'économie et des finances** s'engage à rendre ses sites internet, intranet, extranet et ses progiciels accessibles (et ses applications mobiles et mobilier urbain numérique) conformément à l'article 47 de la loi n°2005-102 du 11 février 2005.

Cette déclaration d'accessibilité s'applique au thème **limesurvey-theme-dsfr** évalué sur le questionnaire **/exemple/limesurvey_questionnaire_test_rgaa.lss** du dépôt actuel, tiré du questionnaire complet multilingue publié sur le dépôt ([https://github.com/LimeSurvey](https://github.com/LimeSurvey/LimeSurvey/blob/master/docs/demosurveys/ls6_sample_survey_multilingual_fr_de_en_it_ru.lss)) auquel ont été ajoutés des questions obligatoires.

## État de conformité

**Le thème LimeSurvey** ([https://github.com/bmatge/limesurvey-theme-dsfr/](https://github.com/bmatge/limesurvey-theme-dsfr/)) est **totalement conforme** avec le référentiel général d'amélioration de l'accessibilité (RGAA), hors page CAPTCHA.

## Résultats des tests

Un audit initial de conformité a été réalisé par **Spécinov** ([https://www.specinov.fr/](https://www.specinov.fr/)) et a révélé un taux de conformité de **70,49 %** des critères du RGAA version 4.1. La déclaration issue de cet audit est consultable dans [`DECLARATION_RGAA_INITIALE.md`](DECLARATION_RGAA_INITIALE.md).

À la suite de cet audit, **l'ensemble des 16 non-conformités imputables au thème ont été corrigées**. Les corrections sont tracées via le label [`RGAA`](https://github.com/bmatge/limesurvey-theme-dsfr/labels/RGAA) et le milestone [Conformité RGAA 4.1](https://github.com/bmatge/limesurvey-theme-dsfr/milestone/1).

### Scores de conformité post-corrections

| Périmètre | Critères applicables | Conformes | Score |
|---|---|---|---|
| **Hors page CAPTCHA** | 59 | 59 | **100 %** |
| **Incluant la page CAPTCHA** | 61 | 58 | **95,08 %** |

Les 3 critères restants (1.4, 1.5, 8.9) sont des *wontfix* documentés ci-dessous.

## Contenus non accessibles

### Non-conformités résiduelles

Seuls 3 critères restent non conformes, aucun n'étant imputable au thème :

| Critère | Intitulé | Statut | Cause |
|---|---|---|---|
| **1.4** | CAPTCHA : alternative textuelle | wontfix | Widget CAPTCHA généré par le core LimeSurvey (Yii `CCaptcha`), non modifiable depuis le thème |
| **1.5** | CAPTCHA : solution d'accès alternatif | wontfix | Idem |
| **8.9** | Balises à des fins de présentation | wontfix | Balises `<p>` vides générées par l'éditeur TinyMCE du back-office, pas par le thème |

### Non-conformités corrigées depuis l'audit

Les 15 non-conformités suivantes, identifiées par l'audit Spécinov, ont été intégralement corrigées :

| Critère | Intitulé | Issue |
|---|---|---|
| **1.3** | Images porteuses d'information sans alternative textuelle pertinente | [#7](https://github.com/bmatge/limesurvey-theme-dsfr/issues/7) |
| **7.1** | Scripts non compatibles avec les technologies d'assistance | [#9](https://github.com/bmatge/limesurvey-theme-dsfr/issues/9) |
| **7.4** | Changements de contexte non signalés ou contrôlables | [#18](https://github.com/bmatge/limesurvey-theme-dsfr/issues/18) |
| **7.5** | Messages de statut non correctement restitués | [#17](https://github.com/bmatge/limesurvey-theme-dsfr/issues/17) |
| **9.1** | Information non structurée par des titres | [#10](https://github.com/bmatge/limesurvey-theme-dsfr/issues/10) |
| **9.2** | Structure du document non cohérente | [#11](https://github.com/bmatge/limesurvey-theme-dsfr/issues/11) |
| **10.1** | Feuilles de styles non utilisées pour la présentation | [#15](https://github.com/bmatge/limesurvey-theme-dsfr/issues/15) |
| **10.8** | Contenus cachés non ignorés par les technologies d'assistance | [#14](https://github.com/bmatge/limesurvey-theme-dsfr/issues/14) |
| **10.11** | Contenus non présentables sans défilement en responsive | [#13](https://github.com/bmatge/limesurvey-theme-dsfr/issues/13) |
| **11.2** | Étiquettes de champs non pertinentes | [#21](https://github.com/bmatge/limesurvey-theme-dsfr/issues/21), [#22](https://github.com/bmatge/limesurvey-theme-dsfr/issues/22) |
| **11.10** | Contrôle de saisie non pertinent | [#19](https://github.com/bmatge/limesurvey-theme-dsfr/issues/19) |
| **11.11** | Contrôle de saisie sans suggestions | [#20](https://github.com/bmatge/limesurvey-theme-dsfr/issues/20) |
| **12.6** | Zones de regroupement non atteignables ou évitables | [#12](https://github.com/bmatge/limesurvey-theme-dsfr/issues/12) |
| **12.9** | Pièges au clavier dans la navigation | [#24](https://github.com/bmatge/limesurvey-theme-dsfr/issues/24) |
| **13.5** | Contenus cryptiques sans alternative | [#23](https://github.com/bmatge/limesurvey-theme-dsfr/issues/23) |

### Corrections complémentaires

Des critères supplémentaires, identifiés lors des corrections, ont également été traités :

| Critère | Intitulé | Issue |
|---|---|---|
| **5.1** | Tableau complexe : ajout d'un résumé | [#25](https://github.com/bmatge/limesurvey-theme-dsfr/issues/25) |
| **5.7** | Tableau double échelle : association headers/cellules | [#26](https://github.com/bmatge/limesurvey-theme-dsfr/issues/26) |
| **8.7** | Changement de langue du placeholder | [#27](https://github.com/bmatge/limesurvey-theme-dsfr/issues/27) |
| **9.3** | Liste ordonnée pour le classement | [#29](https://github.com/bmatge/limesurvey-theme-dsfr/issues/29) |
| **13.1** | Classement : alternative au drag and drop | [#28](https://github.com/bmatge/limesurvey-theme-dsfr/issues/28) |

## Mitigation des critères 1.4 et 1.5 — Alternative accessible au CAPTCHA

Le CAPTCHA visuel est généré par le cœur de LimeSurvey (widget Yii `CCaptcha`) et ne peut pas être corrigé depuis le thème sans forker l'application.

En mitigation, le thème fournit une **protection anti-bot accessible par conception**, activable via l'option `antibot_enabled` dans les paramètres du questionnaire. Cette alternative repose sur :

- une **question textuelle cognitive simple** (pas d'image) — ex. *« De quelle couleur est le soleil ? »* ;
- un **champ honeypot** invisible pour les humains (`aria-hidden="true"`, `tabindex="-1"`) ;
- un **timer minimum** avant soumission (5 secondes par défaut).

**Recommandation** : pour les questionnaires publics, activer `antibot_enabled = on` et laisser le CAPTCHA LimeSurvey désactivé. Dans cette configuration, le questionnaire est **conforme à 100 %**.

## Note sur le critère 8.9 — Balises `<p>` vides

Les balises `<p>&nbsp;</p>` vides relevées par l'audit proviennent du **contenu saisi en back-office** via l'éditeur TinyMCE de LimeSurvey. Le thème ne génère aucune balise `<p>` vide. Le questionnaire de référence a été nettoyé. Les administrateurs sont invités à vérifier les textes saisis via TinyMCE.

## Établissement de cette déclaration d'accessibilité

Cette déclaration a été mise à jour le **16 avril 2026**, sur la base de l'audit initial réalisé par Spécinov (15 avril 2026, commit [`dcef02d`](https://github.com/bmatge/limesurvey-theme-dsfr/commit/dcef02d)) et des corrections apportées jusqu'au commit [`7f5e996`](https://github.com/bmatge/limesurvey-theme-dsfr/commit/7f5e996).

### Environnement de test

Les vérifications de restitution de contenus ont été réalisées avec les combinaisons suivantes :

- Android : Google Chrome + Talkback
- iOS : Safari + VoiceOver
- macOS : Safari + VoiceOver
- Windows : Firefox + NVDA
- Windows : Google Chrome + NVDA

### Outils pour évaluer l'accessibilité

- HeadingsMap
- WCAG Contrast checker
- Inspecteur de composants
- Assistant RGAA
- Validateur HTML du W3C
- Kastor.green

### Pages du site ayant fait l'objet de la vérification de conformité

- [P01] Accueil (captcha & question simple) & Entrée
- [P02] Thème (pied de page et en-tête)
- [P03–P04] Zones de texte court
- [P05] Multiples zones de texte court
- [P06] Tableau (texte)
- [P07–P10] Entrées numériques (simples, multiples, curseur)
- [P11] Tableau (nombres)
- [P12–P18] Questions à choix (genre, radios, dropdowns, langue)
- [P19–P22] Listes et dates
- [P23–P25] Tableaux de questions
- [P26–P27] Cases à cocher multiples
- [P28] Classement
- [P29] Conditions (oui/non)

## Retour d'information et contact

Si vous n'arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable du Ministère de l'économie et des finances pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme.

- Créer une **issue** sur le présent dépôt

## Voies de recours

Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité du site, que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse de notre part, vous êtes en droit de faire parvenir vos doléances ou une demande de saisine au Défenseur des droits.

Plusieurs moyens sont à votre disposition :

- Écrire un message au Défenseur des droits
- Contacter le délégué du Défenseur des droits dans votre région
- Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre) — Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07
