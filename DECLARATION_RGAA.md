# Déclaration d'accessibilité

**Ministère de l'économie et des finances** s'engage à rendre ses sites internet, intranet, extranet et ses progiciels accessibles (et ses applications mobiles et mobilier urbain numérique) conformément à l'article 47 de la loi n°2005-102 du 11 février 2005.

Cette déclaration d'accessibilité s'applique au thème  **limesurvey-theme-dsfr** évalué sur le questionnaire **/exemple/limesurvey_questionnaire_test_rgaa.lss** du dépôt actuel, tiré du questionnaire complet multilingue publié sur le dépôt ([https://github.com/LimeSurvey](https://github.com/LimeSurvey/LimeSurvey/blob/master/docs/demosurveys/ls6_sample_survey_multilingual_fr_de_en_it_ru.lss)) auquel ont été ajoutés des questions obligatoires.

## État de conformité

**Le thème Limesurvey** ([https://galileo.bercy.matge.com/index.php/282267](https://galileo.bercy.matge.com/index.php/282267)) est **partiellement conforme** avec le référentiel général d'amélioration de l'accessibilité (RGAA).

## Résultats des tests

L'audit de conformité réalisé par **Spécinov** ([https://www.specinov.fr/](https://www.specinov.fr/)) révèle que **70,49 %** des critères du RGAA version 4.1 sont respectés.

## Contenus non accessibles

### Non-conformités

- **[1.3]** Les images porteuses d'information n'ont pas toutes une alternative textuelle pertinente.
- **[1.4]** Les alternatives textuelles des CAPTCHA et images-tests ne permettent pas toujours d'identifier leur nature et fonction. *(Mitigé par l'alternative antibot, cf. ci-dessous.)*
- **[1.5]** Les CAPTCHA ne proposent pas tous une solution d'accès alternatif. *(Mitigé par l'alternative antibot, cf. ci-dessous.)*
- **[7.1]** Les scripts ne sont pas tous compatibles avec les technologies d'assistance.
- **[7.4]** Les changements de contexte ne sont pas tous signalés ou contrôlables.
- **[7.5]** Les messages de statut ne sont pas tous correctement restitués.
- **[8.9]** Les balises sont parfois utilisées uniquement à des fins de présentation.
- **[9.1]** L'information n'est pas toujours structurée par des titres appropriés.
- **[9.2]** La structure du document n'est pas toujours cohérente.
- **[10.1]** Les feuilles de styles ne sont pas toujours utilisées pour contrôler la présentation.
- **[10.8]** Les contenus cachés ne sont pas tous correctement ignorés par les technologies d'assistance.
- **[10.11]** Les contenus ne peuvent pas toujours être présentés sans défilement en responsive.
- **[11.2]** Les étiquettes de champs ne sont pas toutes pertinentes.
- **[11.10]** Le contrôle de saisie n'est pas toujours utilisé de manière pertinente.
- **[11.11]** Le contrôle de saisie n'est pas toujours accompagné de suggestions.
- **[12.6]** Les zones de regroupement ne peuvent pas toujours être atteintes ou évitées.
- **[12.9]** La navigation contient parfois des pièges au clavier.
- **[13.5]** Les contenus cryptiques n'ont pas tous une alternative.

### Mitigation des critères 1.4 et 1.5 — Alternative accessible au CAPTCHA

Le CAPTCHA visuel est généré par le cœur de LimeSurvey (widget Yii `CCaptcha`) et ne peut pas être corrigé depuis le thème sans forker l'application, ce qui est exclu par le périmètre du projet.

En mitigation, le thème fournit une **protection anti-bot accessible par conception**, activable via l'option `antibot_enabled` dans les paramètres du questionnaire (onglet *Protection anti-bot*). Cette alternative repose uniquement sur :

- une **question textuelle cognitive simple** (pas d'image) — ex. *« De quelle couleur est le soleil ? »* — tirée d'un pool par défaut ou personnalisable par l'administrateur du questionnaire ;
- un **champ honeypot** invisible pour les humains (`aria-hidden="true"`, `tabindex="-1"`) mais rempli automatiquement par les bots ;
- un **timer minimum** avant soumission (par défaut 5 secondes) pour bloquer les soumissions instantanées.

Cette alternative est **entièrement accessible** : pas d'image, pas de CAPTCHA visuel, label DSFR natif, messages d'erreur `aria-live="polite"`, navigation clavier complète. Elle est implémentée dans `views/subviews/antibot/antibot_challenge.twig`.

**Recommandation** : pour les questionnaires publics nécessitant une protection anti-bot, activer `antibot_enabled = on` et laisser le CAPTCHA LimeSurvey désactivé. La déclaration considère donc les critères 1.4 et 1.5 comme **mitigés** mais pas conformes au sens strict du RGAA (le CAPTCHA non conforme reste accessible dans les paramètres LimeSurvey ; c'est un choix de déploiement).

### Contenus non soumis à l'obligation d'accessibilité

_Aucun._

## Établissement de cette déclaration d'accessibilité

Cette déclaration a été établie le **15 avril 2026**, sur la base de la version du thème correspondant au commit [`dcef02d`](https://github.com/bmatge/limesurvey-theme-dsfr/commit/dcef02d) — état du thème au moment de la publication de la déclaration. Les corrections apportées postérieurement à cette version sont tracées via le label [`RGAA`](https://github.com/bmatge/limesurvey-theme-dsfr/labels/RGAA) et le milestone [Conformité RGAA 4.1](https://github.com/bmatge/limesurvey-theme-dsfr/milestone/1).

### Environnement de test

Les vérifications de restitution de contenus ont été réalisées sur la base de la combinaison fournie par la base de référence du RGAA, avec les versions suivantes :

- Sur mobile Android avec Google Chrome et Talkback
- Sur mobile iOS avec Safari et VoiceOver
- Sur ordinateur macOS avec Safari et VoiceOver
- Sur ordinateur Windows avec Firefox et NVDA
- Sur ordinateur Windows avec Google Chrome et NVDA

### Outils pour évaluer l'accessibilité

- HeadingsMap
- WCAG Contrast checker
- Inspecteur de composants
- Assistant RGAA
- Validateur HTML du W3C
- Kastor.green

### Pages du site ayant fait l'objet de la vérification de conformité

- [P01] Accueil (captcha & question simple) & Entrée — Question vérification humain
- [P02] Thème (pied de page et en-tête)
- [P03] Étape 2 — Zone de texte court
- [P04] Étape 2 — Zone de texte court (nombres uniquement, avec un minuteur)
- [P05] Étape 2 — Multiples zones de texte court
- [P06] Étape 2 — Tableau (texte)
- [P07] Étape 3 — Entrée numérique
- [P08] Étape 3 — Multiples entrées numériques
- [P09] Étape 3 — Multiples entrées numériques (valeur minimale de la somme : 3, valeur maximum de la somme : 10, nombre maximum de caractères : 1)
- [P10] Étape 3 — Multiples entrées numériques (utiliser un curseur, précision du curseur : 0.1, valeurs minimale et maximale, utilisation d'un séparateur de texte)
- [P11] Étape 3 — Tableau (nombres) (saisies de texte)
- [P12] Étape 4 — Genre
- [P13] Étape 4 — 5 boutons radios
- [P14] Étape 4 — 5 boutons radios (emoji)
- [P15] Étape 4 — 5 boutons radios (étoiles)
- [P16] Étape 4 — Changement de langue
- [P17] Étape 4 — Liste (menu déroulant) (avec option par défaut)
- [P18] Étape 4 — Liste (menu déroulant) (avec séparateur de catégories)
- [P19] Étape 4 — Liste (boutons radio)
- [P20] Étape 4 — Liste avec commentaire
- [P21] Étape 4 — Date
- [P22] Étape 4 — Date (afficher les boîtes de sélection, année minimale et maximale)
- [P23] Étape 4 — À la suite, les tableaux de questions à réponses uniques
- [P24] Étape 4 — Tableau
- [P25] Étape 4 — Tableau double échelle (double menu déroulant)
- [P26] Étape 5 — Multiples cases à cocher
- [P27] Étape 5 — Multiples cases à cocher (avec option d'exclusion)
- [P28] Étape 5 — Classement
- [P29] Étape 6 — Une question oui/non pour afficher ou masquer les réponses suivantes

## Retour d'information et contact

Si vous n'arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable de Ministère de l'économie et des finances pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme.

- Créer une **issue** sur le présent dépôt

## Voies de recours

Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité du site, que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse de notre part, vous êtes en droit de faire parvenir vos doléances ou une demande de saisine au Défenseur des droits.

Plusieurs moyens sont à votre disposition :

- Écrire un message au Défenseur des droits
- Contacter le délégué du Défenseur des droits dans votre région
- Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre) — Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07
