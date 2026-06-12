# Options de configuration du thème

Toutes les options se configurent depuis le back-office LimeSurvey :
**Configuration** > **Thèmes** > **DSFR** > **Étendre le thème** (ou **Paramètres** sur l'instance de sondage).

Les valeurs par défaut et la définition sont dans [`config.xml`](config.xml).

---

## Onglet "Options générales"

| Option | Type | Défaut | Rôle |
|---|---|---|---|
| `showclearall` | on / off | off | Affiche le bouton "Tout effacer" en bas de page |
| `fixnumauto` | enable / partial / disable | enable | Corrige automatiquement les valeurs numériques (virgule → point) |

`fixnumauto` en détail :
- **enable** : correction sur tous les champs numériques côté front
- **partial** : correction uniquement pour les expressions ExpressionScript côté serveur
- **disable** : aucune correction automatique (l'utilisateur doit saisir le format attendu)

---

## Onglet "Images"

| Option | Type | Défaut | Rôle |
|---|---|---|---|
| `brandlogo` | on / off | **off** | Activer le logo opérateur dans le header (réservé aux opérateurs autorisés, certification SIRCOM requise via `brandlogo_sircom_certified`) |
| `brandlogofile` | dropdown | `./files/logo.png` | Sélectionner le fichier logo (PNG, JPG, GIF, ICO, SVG) |

> ⚠️ **DSFR — utilisation du logo** : seuls les opérateurs et directions recevant du public sont autorisés à afficher leur logo dans l'en-tête. Si un logo est présent, le texte Marianne doit afficher "République\<br\>Française".

Taille recommandée : 6rem (96 px) de hauteur dans le header.

---

## Onglet "Header et footer"

| Option | Type | Défaut | Rôle |
|---|---|---|---|
| `dsfr_theme` | dropdown | `light` | Variante par défaut du thème (clair / sombre) |
| `show_marianne` | on / off | on | Afficher le logo Marianne |
| `show_footer_links` | on / off | on | Afficher la barre de liens du pied de page (accessibilité, mentions légales, données personnelles, cookies) |
| `showpopups` | 1 / 0 / -1 | 0 | Messages (sauvegarde, soft mandatory) : popup, sur la page, ou masqués |
| `container` | on / off | off | Conteneur centré (`fr-container`) ou pleine largeur (`fr-container--fluid`) |
| `questionhelptextposition` | top / bottom | top | Position de l'aide de question |
| `showquestioncode` | on / off | on | Afficher le numéro/code des questions (selon réglages du sondage) |
| `sanitize_rte_content` | on / off | on | Nettoyer les styles inline des titres/aides de questions (conformité DSFR) |
| `show_pdf_export` | on / off | on | Récapitulatif des réponses : bouton « Exporter en PDF » |
| `dsfr_theme` | light / dark / system | light | Schéma de couleurs (`data-fr-scheme`) |
| `rgaa_conformity` | non / partiellement / totalement | totalement | Mention de conformité affichée dans le pied de page |
| `rgaa_declaration_date` | texte | — | Date réelle de publication de la déclaration d'accessibilité |
| `accessibility_statement_url` | URL | — | Page dédiée de la déclaration (remplace la modale) |
| `marianne_text` | textarea 2 lignes | `République<br>Française` | Texte sous la Marianne |
| `header_title` | textarea 2 lignes | — | Titre du service dans l'en-tête |
| `baseline_text` | textarea 2 lignes | — | Baseline (tagline DSFR sous le titre du service, dans l'en-tête) |
| `footer_text` | textarea 3 lignes | — | Texte libre dans le footer |
| `intellectual_property` | textarea 3 lignes | — | Mention de propriété intellectuelle (copyright, licence) |

### Mode clair / sombre

`dsfr_theme` définit la **valeur par défaut**, mais l'utilisateur peut choisir via la modale "Paramètres d'affichage" accessible depuis le header. La préférence utilisateur (`localStorage.dsfr-theme`) prime sur la config du thème :
- `light` : forcé clair
- `dark` : forcé sombre
- `system` : suit la préférence système (`prefers-color-scheme`)

---

## Onglet "Accessibilité"

| Option | Type | Rôle |
|---|---|---|
| `accessibility_content` | textarea 40 lignes | Contenu affiché dans la modale "Accessibilité" (déclaration d'accessibilité type : conformité RGAA, tests, technologies, contact pour signaler un problème) |

Le titre H1 "Accessibilité" est déjà présent dans la modale — ne pas le dupliquer dans le contenu.

---

## Onglet "Mentions légales"

| Option | Type | Rôle |
|---|---|---|
| `editor` | textarea 5 lignes | Éditeur (nom, adresse, SIRET, contact) |
| `publication_director` | textarea 3 lignes | Directeur de publication (nom, fonction) |
| `host` | textarea 3 lignes | Hébergeur (nom, adresse, téléphone) |
| `legal_content` | textarea 10 lignes | Contenu personnalisé (remplace tout si rempli) |

**Comportement** :
- `legal_content` **vide** → le thème génère automatiquement les mentions avec les 3 champs ci-dessus + `intellectual_property`
- `legal_content` **rempli** → remplace entièrement le contenu par défaut (les autres champs sont ignorés)

---

## Onglet "Données personnelles"

| Option | Type | Rôle |
|---|---|---|
| `data_controller` | textarea 3 lignes | Responsable de traitement (nom, organisme, contact) |
| `survey_purpose` | textarea 3 lignes | Finalité du questionnaire |
| `data_retention` | text | Durée de conservation (ex : "12 mois") |
| `contact_email` | text | Email de contact DPO / référent RGPD |
| `privacy_content` | textarea 10 lignes | Contenu personnalisé (remplace tout si rempli) |

**Comportement** :
- `privacy_content` **vide** → génération auto (responsable de traitement, finalité, base légale, destinataires, durée, droits, contact, droit de réclamation CNIL)
- `privacy_content` **rempli** → remplace entièrement le contenu par défaut

---

## Onglet "Protection anti-bot"

Alternative accessible au CAPTCHA natif (non conforme RGAA). Active un défi texte dans le flot normal du sondage.

| Option | Type | Défaut | Rôle |
|---|---|---|---|
| `antibot_enabled` | on / off | off | Activer la protection anti-bot |
| `antibot_timer` | number | 2 | Temps minimum (secondes) avant validation |
| `antibot_custom_questions` | textarea 8 lignes | — | Questions personnalisées, une par ligne |

### Format des questions personnalisées

Une question par ligne, format `Question|Réponse` :

```
Quelle est la couleur du ciel par beau temps ?|bleu
Combien font 2 + 3 ?|5
Quel animal miaule ?|chat
```

- `antibot_custom_questions` **vide** → utilise les 15 questions par défaut du thème
- `antibot_custom_questions` **rempli** → utilise uniquement les questions personnalisées

### Recommandations `antibot_timer`

- Minimum : 2 secondes (permet aux humains rapides de répondre)
- Maximum : 10 secondes (peut frustrer les utilisateurs)
- Défaut : 2 secondes (équilibre UX / sécurité)

---

## Traductions

Les libellés d'options affichés dans l'admin sont définis en français dans les attributs `title="…"` de [`config.xml`](config.xml) (pas de mécanisme de traduction des titres d'options dans LimeSurvey 6 pour les pages d'options core).

Les messages front (validation, ranking) sont dans [`src/core/i18n.js`](src/core/i18n.js).
