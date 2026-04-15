# Thème DSFR pour LimeSurvey

[![DSFR](https://img.shields.io/badge/DSFR-v1.11-blue)](https://www.systeme-de-design.gouv.fr/)
[![LimeSurvey](https://img.shields.io/badge/LimeSurvey-6.0+-green)](https://www.limesurvey.org/)

Thème LimeSurvey conforme au [Système de Design de l'État Français (DSFR)](https://www.systeme-de-design.gouv.fr/).


#### ⚠️ Utilisation interdite en dehors des sites Internet de l'État

>Il est formellement interdit à tout autre acteur d’utiliser le Système de Design de l’État (les administrations territoriales ou tout autre acteur privé) pour des sites web ou des applications. Le Système de Design de l’État représente l’identité numérique de l’État. En cas d’usage à des fins trompeuses ou frauduleuses, l'État se réserve le droit d’entreprendre les actions nécessaires pour y mettre un terme.

Voir les [conditions générales d'utilisation](https://github.com/GouvernementFR/dsfr/blob/main/doc/legal/cgu.md).


## ✨ Caractéristiques

- ✅ **Conforme DSFR** - aucune classe Bootstrap, uniquement DSFR
- ♿ **Partiellement conforme RGAA 4.1** (70,49 %) - audit Spécinov, voir [déclaration d'accessibilité](DECLARATION_RGAA.md)
- 🎨 **Mode clair/sombre** natif DSFR avec sélecteur utilisateur
- 📱 **Responsive** adapté à l'usage mobile (linéarisation des tableaux)
- 🖨️ **Impression optimisée** avec styles dédiés
- 🔌 **DSFR local** - Toutes les ressources DSFR locales (pas de CDN)
- 📚 **36 types de questions** supportés avec templates DSFR

---

## ♿ Accessibilité (RGAA)

Ce thème a fait l'objet d'un audit RGAA 4.1 réalisé par [Spécinov](https://www.specinov.fr/). L'application est **partiellement conforme** avec un taux de **70,49 %** de critères respectés.

👉 **Déclaration complète** : [`DECLARATION_RGAA.md`](DECLARATION_RGAA.md)

Les non-conformités sont suivies sous forme d'issues avec le label [`RGAA`](../../labels/RGAA) et regroupées dans le milestone [Conformité RGAA 4.1](../../milestone/1).

### Critères non conformes et issues associées

| Critère RGAA | Intitulé | Issue(s) |
|---|---|---|
| **1.3** | Images porteuses d'information sans alternative textuelle pertinente | ✅ [#7](../../issues/7) |
| **1.4** | CAPTCHA : alternative textuelle n'identifiant pas nature/fonction | ⛔ [#8](../../issues/8) *wontfix — cf. alternative antibot* |
| **1.5** | CAPTCHA : absence de solution d'accès alternatif | ⛔ [#8](../../issues/8) *wontfix — cf. alternative antibot* |
| **7.1** | Scripts non compatibles avec les technologies d'assistance | ✅ [#9](../../issues/9) |
| **7.4** | Changements de contexte non signalés ou contrôlables | [#18](../../issues/18) |
| **7.5** | Messages de statut non correctement restitués | [#17](../../issues/17) |
| **8.9** | Balises utilisées à des fins de présentation | [#16](../../issues/16) |
| **9.1** | Information non structurée par des titres appropriés | ✅ [#10](../../issues/10) |
| **9.2** | Structure du document non cohérente | [#11](../../issues/11) |
| **10.1** | Feuilles de styles non utilisées pour contrôler la présentation | [#15](../../issues/15) |
| **10.8** | Contenus cachés non correctement ignorés par les technologies d'assistance | [#14](../../issues/14) |
| **10.11** | Contenus non présentables sans défilement en responsive | [#13](../../issues/13) |
| **11.2** | Étiquettes de champs non pertinentes | [#21](../../issues/21), [#22](../../issues/22) |
| **11.10** | Contrôle de saisie non pertinent | [#19](../../issues/19) |
| **11.11** | Contrôle de saisie non accompagné de suggestions | [#20](../../issues/20) |
| **12.6** | Zones de regroupement non atteignables ou évitables | [#12](../../issues/12) |
| **12.9** | Pièges au clavier dans la navigation | [#24](../../issues/24) |
| **13.5** | Contenus cryptiques sans alternative | [#23](../../issues/23) |

### Corrections complémentaires issues de l'audit

Des issues supplémentaires couvrent des critères identifiés lors des corrections, non listés explicitement dans la déclaration :

| Critère RGAA | Intitulé | Issue |
|---|---|---|
| **5.1** | Tableau complexe : ajout d'un résumé | [#25](../../issues/25) |
| **5.7** | Tableau double échelle : association headers/cellules | [#26](../../issues/26) |
| **8.7** | Changement de langue du placeholder (cases à cocher) | [#27](../../issues/27) |
| **9.3** | Liste ordonnée : utiliser `ol` au lieu de `ul` (classement) | [#29](../../issues/29) |
| **13.1** | Classement : alternative au drag and drop | [#28](../../issues/28) |

---

## 🎯 Fonctionnalités Supportées

### Types de Questions (36 types)

Tous les types de questions LimeSurvey sont supportés avec templates DSFR :

#### Questions à choix

- ✅ **Choix multiple** (M) - Checkboxes DSFR natives
- ✅ **Choix multiple avec commentaires** (P) - Checkboxes + textarea DSFR
- ✅ **Liste (Radio)** (L) - Radio buttons DSFR
- ✅ **Liste (Dropdown)** (!) - Select DSFR
- ✅ **Liste avec commentaire** (O) - Radio + textarea DSFR
- ✅ **Oui/Non** (Y) - Radio DSFR 2 options
- ✅ **Genre** (G) - Radio DSFR 3 options

#### Questions numériques

- ✅ **Numérique** (N) - Input type="number" DSFR
- ✅ **Équation** (*)  - Calculs automatiques
- ✅ **Saisie numérique multiple** (K) - Tableau de champs numériques

#### Questions texte

- ✅ **Texte court** (S) - Input text DSFR
- ✅ **Texte long** (T) - Textarea DSFR
- ✅ **Texte libre énorme** (U) - Textarea étendu DSFR

#### Questions de type tableau

- ✅ **Tableau** (Array) (F) - Grille radio DSFR
- ✅ **Tableau (5 points)** (5) - Échelle Likert DSFR
- ✅ **Tableau (10 points)** (B) - Échelle 1-10 DSFR
- ✅ **Tableau (Augmenter/Identique/Diminuer)** (E) - 3 options DSFR
- ✅ **Tableau (Oui/Incertain/Non)** (C) - 3 options DSFR
- ✅ **Tableau (colonne)** (H) - Tableau avec saisie libre
- ✅ **Tableau (nombres)** (;) - Tableau de champs numériques
- ✅ **Tableau (textes)** (:) - Tableau de champs texte
- ✅ **Tableau double échelle** (1) - 2 échelles de notation
- ✅ **Tableau de textes multi-colonnes** - Lignes/colonnes personnalisées

#### Questions avancées

- ✅ **Classement** (R) - Drag & drop DSFR
- ✅ **Date** (D) - Date picker DSFR
- ✅ **Fichier** (|) - Upload DSFR
- ✅ **Curseur** (Slider) - Range input DSFR
- ✅ **Langue** (I) - Sélecteur de langue DSFR

### Fonctionnalités LimeSurvey

#### Navigation et progression

- ✅ **Stepper DSFR** - Indicateur de progression avec étapes
- ✅ **Boutons de navigation** - Précédent/Suivant/Soumettre (fr-btn)
- ✅ **Index des questions** - Modale DSFR avec liste des questions

#### Validation et messages

- ✅ **Validation en temps réel** - Messages d'erreur DSFR (fr-alert--error)
- ✅ **Messages de succès** - Alertes DSFR (fr-alert--success)
- ✅ **Récapitulatif progressif** - Feedback ERROR → WARNING → SUCCESS
- ✅ **Messages d'aide** - Callouts DSFR (fr-callout)

#### Accessibilité et utilisabilité

- 🟡 **Conformité RGAA 4.1** - partiellement conforme (70,49 %), audit Spécinov — voir [section Accessibilité](#-accessibilité-rgaa) et [`DECLARATION_RGAA.md`](DECLARATION_RGAA.md)
- ✅ **CAPTCHA** - page CAPTCHA native LimeSurvey stylisée en DSFR
- ✅ **Mode sombre/clair** - Toggle utilisateur avec localStorage
- ✅ **Multilingue** - Sélecteur de langue DSFR (fr-translate)
- ✅ **RGPD** - Modales conformité, cookies, données personnelles
- ✅ **Questions obligatoires** - Indicateur visuel DSFR

#### Impression et export

- ✅ **Impression réponses** - Layout dédié avec styles print
- ✅ **En-tête d'impression** - Logo, titre, informations enquête
- ✅ **Optimisation print** - Masquage navigation, ajustements mise en page

#### Responsive et grille

- ✅ **Grille DSFR responsive** - Mobile-first avec breakpoints
- ✅ **Linéarisation tableaux** - Tableaux adaptés mobile 
- ✅ **20 helpers grille** - Gutters, alignements, offset (dsfr-grid-helpers.css)
- ✅ **Images responsives** - fr-responsive-img

#### Personnalisation

- ✅ **Logo opérateur** - Attention, des condition d'utilisation s'appliquent
- ✅ **Texte personnalisable** - Header, footer, Marianne
- ✅ **Modales légales** - Accessibilité, Mentions légales, RGPD

#### Compatibilité

- ✅ **LimeSurvey 6.0+** - Compatible dernières versions
- ✅ **Navigateurs modernes** - Chrome, Firefox, Edge, Safari

### Composants DSFR utilisés

- **Grille** : `fr-grid-row`, `fr-col-*`, `fr-container`
- **Boutons** : `fr-btn`, `fr-btn--secondary`, `fr-btn--lg`, `fr-btns-group`
- **Formulaires** : `fr-input`, `fr-input-group`, `fr-label`, `fr-select`
- **Checkboxes** : `fr-checkbox-group`, `fr-checkbox-input`
- **Radios** : `fr-radio-group`, `fr-radio-input`
- **Alertes** : `fr-alert`, `fr-alert--error`, `fr-alert--success`, `fr-alert--info`
- **Callouts** : `fr-callout`, `fr-callout--brown-caramel`
- **Navigation** : `fr-header`, `fr-footer`, `fr-stepper`
- **Modales** : `fr-modal`, `fr-modal__header`, `fr-modal__body`
- **Icônes** : 400+ icônes système et utilitaires DSFR

---

## 🔌 Autonomie du Thème

### Indépendance vis-à-vis de Bootstrap

Ce thème est totalement autonome et ne dépend d'aucun autre thème LimeSurvey ni de Bootstrap :

#### 1. Suppression complète de Bootstrap

Le fichier `config.xml` désactive explicitement les CSS Bootstrap du core LimeSurvey :

```xml
<css>
    <!-- Supprimer les CSS Bootstrap du core LimeSurvey -->
    <remove>template-core.css</remove>
    <remove>awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css</remove>
    <remove>awesome-bootstrap-checkbox/awesome-bootstrap-checkbox-rtl.css</remove>
</css>
```

**Résultat** : Aucune classe Bootstrap n'est chargée, le thème fonctionne en isolation totale.

#### 2. Tous les composants sont DSFR

- **Grille** : `fr-grid-row`, `fr-col-*` (au lieu de `row`, `col-*` de Bootstrap)
- **Boutons** : `fr-btn`, `fr-btn--secondary` (au lieu de `btn`, `btn-primary`)
- **Formulaires** : `fr-input`, `fr-checkbox-group`, `fr-radio-group` (au lieu de `form-control`, `form-check`)
- **Alertes** : `fr-alert`, `fr-alert--error` (au lieu de `alert`, `alert-danger`)
- **Navigation** : `fr-stepper`, `fr-header`, `fr-footer` (composants DSFR natifs)

#### 3. Ressources 100% locales

Toutes les ressources DSFR sont **incluses dans le thème** :

```
dsfr/
├── css/
│   ├── dsfr-no-datauri.min.css    # Framework DSFR complet
│   ├── icons-system.min.css        # Icônes système DSFR
│   ├── icons-utility.min.css       # Icônes utilitaires DSFR
│   └── icons.min.css               # Index icônes
├── icons/
│   ├── system/                     # 400+ icônes système SVG
│   └── utility/                    # Icônes utilitaires SVG
├── fonts/
│   ├── Marianne-*.woff2            # Police Marianne (officielle)
│   └── Spectral-*.woff2            # Police Spectral (titres)
└── scripts/
    ├── dsfr.module.min.js          # JS DSFR (modules ES6)
    └── dsfr.nomodule.min.js        # JS DSFR (fallback)
```

**Aucun CDN externe** : Le thème fonctionne entièrement hors ligne.

#### 4. Compatibilité avec le core LimeSurvey

Le fichier `css/theme.css` contient des **styles de compatibilité** pour les éléments générés par le core LimeSurvey qui utilisent encore des classes Bootstrap :

```css
/* Compatibilité Bootstrap → DSFR */
.btn:not(.fr-btn) { /* Style DSFR pour boutons non-DSFR */ }
.form-control:not(.fr-input) { /* Style DSFR pour inputs non-DSFR */ }
.alert:not(.fr-alert) { /* Conversion alertes Bootstrap → DSFR */ }
```

Ces styles permettent au thème de fonctionner même si le core LimeSurvey génère occasionnellement des classes Bootstrap.

---

## 🎨 Intégration et Fusion des Ressources DSFR

### Architecture d'intégration

Les ressources DSFR v1.11.2 ont été fusionnées directement dans le thème pour garantir l'autonomie :

### 1. CSS DSFR

#### Fichiers principaux intégrés

| Fichier | Rôle | Taille |
|---------|------|--------|
| `css/dsfr-no-datauri.min.css` | Framework CSS DSFR complet (sans data-URI) | ~200 KB |
| `css/icons-system.min.css` | Icônes système (mask-image vers SVG externes) | ~180 KB |
| `css/icons-utility.min.css` | Icônes utilitaires | ~50 KB |
| `css/icons.min.css` | Index icônes | 2 KB |
| `css/dsfr-grid-helpers.css` | Helpers grille custom (20 utilitaires) | 8 KB |

#### Ordre de chargement CSS (défini dans `config.xml`)

```xml
<css>
    <replace>css/dsfr-no-datauri.min.css</replace>  <!-- 1. Base DSFR -->
    <replace>css/icons.min.css</replace>            <!-- 2. Icônes -->
    <replace>css/dsfr-grid-helpers.css</replace>    <!-- 3. Helpers grille -->
    <replace>css/theme.css</replace>                <!-- 4. Styles principaux -->
    <replace>css/custom.css</replace>               <!-- 5. Personnalisations -->
</css>
```

#### Pourquoi `dsfr-no-datauri.min.css` ?

Le fichier standard `dsfr.min.css` contient des data-URI (SVG encodés en base64) qui peuvent être bloqués par les Content Security Policy (CSP) strictes en production.

La version `-no-datauri` utilise des références externes vers les fichiers SVG :

```css
/* dsfr.min.css (bloqué par CSP) */
.fr-icon-arrow-right-line:before {
    -webkit-mask-image: url("data:image/svg+xml;charset=utf8,...");
}

/* dsfr-no-datauri.min.css (compatible CSP) */
.fr-icon-arrow-right-line:before {
    -webkit-mask-image: url(../icons/system/arrow-right-line.svg);
}
```

### 2. Icônes DSFR

#### Structure des icônes

```
icons/
├── system/          # 400+ icônes système
│   ├── arrow-right-line.svg
│   ├── arrow-left-line.svgz
│   └── ...
├── business/        # Icônes métier
│   └── attachment-line.svg
└── utility/         # Icônes utilitaires
```

#### Correction des chemins CSS

Les fichiers CSS DSFR originaux référencent les icônes avec des chemins relatifs incorrects. Tous les chemins ont été corrigés :

```css
/* Original DSFR (incorrect pour LimeSurvey) */
-webkit-mask-image: url(../../icons/system/arrow-right-line.svg);

/* Corrigé pour LimeSurvey */
-webkit-mask-image: url(../icons/system/arrow-right-line.svg);
```

**Fichiers CSS corrigés** :
- `css/icons-system.min.css`
- `css/icons-utility.min.css`
- `css/dsfr-no-datauri.min.css`

### 3. Polices Marianne et Spectral

#### Polices intégrées

```
fonts/
├── Marianne-Light.woff2           # Marianne Light
├── Marianne-Light_Italic.woff2
├── Marianne-Regular.woff2         # Marianne Regular (corps de texte)
├── Marianne-Regular_Italic.woff2
├── Marianne-Medium.woff2          # Marianne Medium
├── Marianne-Medium_Italic.woff2
├── Marianne-Bold.woff2            # Marianne Bold (titres)
├── Marianne-Bold_Italic.woff2
├── Spectral-Regular.woff2         # Spectral Regular (titres optionnels)
└── Spectral-ExtraBold.woff2       # Spectral ExtraBold
```

#### Déclaration @font-face

Les polices sont déclarées dans `css/dsfr-no-datauri.min.css` :

```css
@font-face {
    font-family: Marianne;
    src: url(../fonts/Marianne-Regular.woff2) format('woff2');
    font-weight: 400;
    font-style: normal;
}
```

### 4. JavaScript DSFR

#### Fichiers JS intégrés

```
scripts/
├── dsfr.module.min.js      # Version ES6 modules (navigateurs modernes)
└── dsfr.nomodule.min.js    # Version fallback (IE11, anciens navigateurs)
```

#### Chargement dans `config.xml`

Les fichiers JS DSFR ne sont **pas chargés via config.xml** mais directement dans les templates Twig pour un meilleur contrôle :

```twig
{# Dans subviews/footer/footer.twig #}
<script type="module" src="{{ templatepath }}/scripts/dsfr.module.min.js"></script>
<script nomodule src="{{ templatepath }}/scripts/dsfr.nomodule.min.js"></script>
```

### 5. Logo Marianne

#### SVG externes pour le logo Marianne

Le logo Marianne (République Française) est composé de 2 SVG :

```
files/logos/
├── marianne-flag.svg       # Drapeau tricolore (44x18)
└── marianne-block.svg      # Bloc "Liberté Égalité Fraternité" (252x180)
```

#### Intégration dans `custom.css`

```css
/* Drapeau tricolore */
.fr-logo:before {
    background-image: url(../files/logos/marianne-flag.svg),
                      linear-gradient(90deg, #000091, #000091 50%, #e1000f 0, #e1000f),
                      linear-gradient(90deg, #000, #000);
    /* ... */
}

/* Bloc Marianne (Liberté Égalité Fraternité) */
.fr-logo:after {
    background-image: url(../files/logos/marianne-block.svg);
    /* ... */
}
```

---

## ⚙️ Guide de Configuration Back-Office

### Accès aux paramètres du thème

1. Connectez-vous à l'interface d'administration LimeSurvey
2. Allez dans **Configuration** → **Thèmes**
3. Trouvez le thème **"DSFR"**
4. Cliquez sur **"Paramètres du thème"** ou l'icône ⚙️

### Organisation par onglets

Les options du thème sont organisées en **6 onglets** :

1. **Options générales**
2. **Images**
3. **Header et footer**
4. **Accessibilité**
5. **Mentions légales**
6. **Données personnelles**

---

### 📋 Onglet : Options générales

#### Bouton 'Tout effacer'

- **Nom du champ** : `showclearall`
- **Type** : Boutons radio (Oui/Non)
- **Valeur par défaut** : `off` (Non)
- **Rôle** : Affiche ou masque le bouton "Tout effacer" permettant aux répondants de réinitialiser toutes leurs réponses.

**Utilisation recommandée** : Désactivé par défaut pour éviter les effacements accidentels.

---

#### Correction automatique des valeurs numériques

- **Nom du champ** : `fixnumauto`
- **Type** : Boutons radio (3 options)
- **Options** :
  - `enable` : **Oui** - Corrige automatiquement les valeurs numériques (virgule → point)
  - `partial` : **Pour expression** - Correction uniquement pour les expressions
  - `disable` : **Non** - Aucune correction
- **Valeur par défaut** : `enable` (Oui)
- **Rôle** : Convertit automatiquement les virgules en points dans les champs numériques pour faciliter la saisie (format français → format international).

**Exemple** : L'utilisateur tape "3,14" → Converti automatiquement en "3.14"

---

### 🖼️ Onglet : Images

#### ⚠️ AVERTISSEMENT DSFR

**Message affiché** :

> Seuls les opérateurs et directions recevant du public sont autorisés à afficher leur logo dans l'en-tête. Si un logo est utilisé, vous devez modifier le texte Marianne (onglet 'Header et footer') pour qu'il affiche 'République<br>Française'

---

#### Afficher le logo

- **Nom du champ** : `brandlogo`
- **Type** : Boutons radio (Oui/Non)
- **Valeur par défaut** : `on` (Oui)
- **Rôle** : Active ou désactive l'affichage du logo opérateur dans le header DSFR (zone `.fr-header__operator`).

**Comportement** :
- **Si activé** : Affiche le logo uploadé à côté du logo Marianne (si fichier fourni)
- **Si désactivé** : Pas de logo opérateur, uniquement Marianne (si activée)

**Important** : Selon les règles DSFR, seuls les opérateurs publics peuvent afficher leur logo.

---

#### Fichier logo

- **Nom du champ** : `brandlogofile`
- **Type** : Liste déroulante (sélection fichier)
- **Valeur par défaut** : `./files/logo.png`
- **Dépendance** : Dépend de `brandlogo` (parent)
- **Rôle** : Sélectionne le fichier image à utiliser comme logo opérateur.

**Formats acceptés** :
- PNG, JPG, JPEG, GIF, ICO
- **SVG** (si autorisé dans `application/config/config.php` : `$config['allowedthemeimageformats'] = 'gif,ico,jpg,jpeg,png,svg';`)

**Taille recommandée** : Le logo s'affiche avec `width: 6rem` (96px) dans le header. Privilégiez une image carrée ou horizontale en haute résolution.

**Upload d'un nouveau logo** :
1. Cliquez sur le champ "Fichier logo"
2. Cliquez sur "Upload files" (bouton en haut de la liste)
3. Sélectionnez votre fichier
4. Validez et sélectionnez le fichier uploadé dans la liste

---

### 🎨 Onglet : Header et footer

#### Variante du thème

- **Nom du champ** : `dsfr_theme`
- **Type** : Liste déroulante
- **Options** :
  - `light` : **Clair** - Thème clair par défaut
  - `dark` : **Sombre** - Thème sombre par défaut
- **Valeur par défaut** : `light`
- **Rôle** : Définit le thème de couleur **par défaut** au chargement de la page.

**Comportement** :
- L'utilisateur peut toujours basculer entre clair/sombre via le bouton dans le header (icône 🌓)
- Le choix de l'utilisateur est sauvegardé dans `localStorage` et prioritaire sur cette option

---

#### Afficher Marianne

- **Nom du champ** : `show_marianne`
- **Type** : Boutons radio (Oui/Non)
- **Valeur par défaut** : `on` (Oui)
- **Rôle** : Affiche ou masque le logo **Marianne** (République Française) dans le header.

**Comportement** :
- **Si activé** : Logo Marianne affiché dans `.fr-header__logo` avec texte "République<br>Française"
- **Si désactivé** : Pas de logo Marianne dans le header

**Important** : Selon les règles DSFR, si un logo opérateur est utilisé, le texte Marianne doit afficher "République<br>Française" (voir champ suivant).

---

#### Texte Marianne

- **Nom du champ** : `marianne_text`
- **Type** : Zone de texte (textarea, 2 lignes)
- **Valeur par défaut** : Vide (utilise "République<br>Française" par défaut)
- **Rôle** : Personnalise le texte affiché sous le logo Marianne.

**Valeur par défaut (si vide)** :
```html
République<br>Française
```

**Valeurs possibles** :
- **Si logo opérateur utilisé** : `République<br>Française` (obligatoire DSFR)
- **Si pas de logo opérateur** : Nom du ministère/organisation (ex: `Ministère<br>de l'Intérieur`)

**Rendu dans le header** :
```html
<p class="fr-logo">
    République<br>Française
</p>
```

---

#### Titre dans l'en-tête

- **Nom du champ** : `header_title`
- **Type** : Zone de texte (textarea, 2 lignes)
- **Valeur par défaut** : Vide (utilise le nom de l'enquête par défaut)
- **Rôle** : Personnalise le titre affiché dans le header (zone `.fr-header__service-tagline`).

**Comportement** :
- **Si vide** : Affiche le nom de l'enquête (variable `aSurveyInfo.name`)
- **Si rempli** : Affiche le texte personnalisé (peut contenir du HTML)

**Exemple** :
```
Enquête de satisfaction 2025
```

---

#### Liens de pied de page

- **Nom du champ** : `show_footer_links`
- **Type** : Boutons radio (Oui/Non)
- **Valeur par défaut** : `on` (Oui)
- **Rôle** : Affiche ou masque les liens "Accessibilité", "Mentions légales" et "Données personnelles" dans le footer.

**Comportement** :
- **Si activé** : 3 modales DSFR accessibles depuis le footer
- **Si désactivé** : Footer simplifié sans liens légaux

**Liens affichés** :
1. **Accessibilité** → Ouvre la modale avec le contenu de l'onglet "Accessibilité"
2. **Mentions légales** → Ouvre la modale avec le contenu de l'onglet "Mentions légales"
3. **Données personnelles** → Ouvre la modale avec le contenu de l'onglet "Données personnelles"

---

#### Texte dans le pied de page

- **Nom du champ** : `footer_text`
- **Type** : Zone de texte (textarea, 3 lignes)
- **Valeur par défaut** : Vide
- **Rôle** : Ajoute du texte personnalisé dans le footer (au-dessus des liens légaux).

**Utilisation** : Coordonnées de contact, message de l'administration, etc.

**Exemple** :
```
Pour toute question, contactez-nous à contact@ministere.gouv.fr
```

---

#### Propriété intellectuelle

- **Nom du champ** : `intellectual_property`
- **Type** : Zone de texte (textarea, 3 lignes)
- **Valeur par défaut** : Vide
- **Rôle** : Affiche une mention de propriété intellectuelle dans le footer (zone `.fr-footer__bottom-copy`).

**Exemple** :
```
© 2025 Ministère de l'Intérieur - Tous droits réservés
```

---

### ♿ Onglet : Accessibilité

#### Contenu Accessibilité

- **Nom du champ** : `accessibility_content`
- **Type** : Zone de texte (textarea, 40 lignes)
- **Valeur par défaut** : Vide
- **Rôle** : Définit le contenu de la modale "Accessibilité" accessible depuis le footer.

**Note importante** : Le titre H1 "Accessibilité" est déjà dans le template de la modale. **Ne pas répéter le titre H1** dans ce champ.

**Contenu recommandé** :
```html
<h2>Déclaration d'accessibilité</h2>
<p>[Nom de l'organisation] s'engage à rendre son service accessible conformément à l'article 47 de la loi n° 2005-102 du 11 février 2005.</p>

<h2>État de conformité</h2>
<p>Ce site est [totalement conforme / partiellement conforme / non conforme] au Référentiel Général d'Amélioration de l'Accessibilité (RGAA) version 4.1.</p>

<h2>Résultats des tests</h2>
<p>L'audit de conformité réalisé le [date] révèle que :</p>
<ul>
    <li>[X]% des critères RGAA sont respectés.</li>
</ul>

<h2>Contenus non accessibles</h2>
<p>[Description des contenus non accessibles et raisons]</p>

<h2>Amélioration et contact</h2>
<p>Si vous rencontrez un défaut d'accessibilité, contactez-nous à [email]</p>

<h2>Voie de recours</h2>
<p>Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité du site,
que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse rapide de notre part,
vous êtes en droit de faire parvenir vos doléances au Défenseur des droits.</p>
```

**Variables disponibles** : Texte brut ou HTML. Supporte les balises `<h2>`, `<h3>`, `<p>`, `<ul>`, `<li>`, etc.

---

### ⚖️ Onglet : Mentions légales

#### Éditeur

- **Nom du champ** : `editor`
- **Type** : Zone de texte (textarea, 5 lignes)
- **Valeur par défaut** : Vide
- **Rôle** : Définit les informations sur l'éditeur du site (personne morale responsable).

**Contenu recommandé** :
```
[Nom de l'organisation]
[Adresse complète]
Téléphone : [numéro]
Email : [email]
SIRET : [numéro]
```

---

#### Directeur de publication

- **Nom du champ** : `publication_director`
- **Type** : Zone de texte (textarea, 3 lignes)
- **Valeur par défaut** : Vide
- **Rôle** : Nom et fonction du directeur de publication.

**Exemple** :
```
M. [Prénom Nom]
[Fonction]
```

---

#### Hébergeur

- **Nom du champ** : `host`
- **Type** : Zone de texte (textarea, 3 lignes)
- **Valeur par défaut** : Vide
- **Rôle** : Informations sur l'hébergeur du site.

**Contenu recommandé** :
```
[Nom de l'hébergeur]
[Adresse]
Téléphone : [numéro]
```

---

#### Contenu personnalisé

- **Nom du champ** : `legal_content`
- **Type** : Zone de texte (textarea, 10 lignes)
- **Valeur par défaut** : Vide
- **Rôle** : **Remplace tout le contenu par défaut** de la modale "Mentions légales" si rempli.

**Comportement** :
- **Si vide** : La modale affiche le contenu par défaut généré à partir des champs `editor`, `publication_director`, `host`
- **Si rempli** : Ce contenu remplace **entièrement** le contenu par défaut

**Utilisation** : Pour un contrôle total du contenu de la modale, avec structure HTML personnalisée.

---

### 🔒 Onglet : Données personnelles

#### Responsable de traitement

- **Nom du champ** : `data_controller`
- **Type** : Zone de texte (textarea, 3 lignes)
- **Valeur par défaut** : Vide
- **Rôle** : Identifie le responsable de traitement des données personnelles (RGPD).

**Exemple** :
```
[Nom de l'organisation]
[Adresse]
Contact DPO : dpo@organisation.gouv.fr
```

---

#### Objectif du questionnaire

- **Nom du champ** : `survey_purpose`
- **Type** : Zone de texte (textarea, 3 lignes)
- **Valeur par défaut** : Vide
- **Rôle** : Décrit la finalité du traitement des données (obligation RGPD).

**Exemple** :
```
Les données collectées via ce questionnaire sont utilisées pour [objectif précis].
Base légale : [mission d'intérêt public / consentement / etc.]
```

---

#### Durée de conservation

- **Nom du champ** : `data_retention`
- **Type** : Champ texte (1 ligne)
- **Valeur par défaut** : Vide
- **Rôle** : Indique la durée de conservation des données collectées.

**Exemple** :
```
12 mois à compter de la fin de l'enquête
```

---

#### Email de contact

- **Nom du champ** : `contact_email`
- **Type** : Champ texte (1 ligne)
- **Valeur par défaut** : Vide
- **Rôle** : Email de contact pour les questions relatives aux données personnelles.

**Exemple** :
```
dpo@ministere.gouv.fr
```

---

## 🏗️ Structure du Projet

```
dsfr/
├── config.xml                 # Configuration thème
│                              # - Packages CSS/JS
│                              # - Suppression Bootstrap (<remove>)
│                              # - Options configurables
│
├── css/                       # Feuilles de style
│   ├── dsfr-no-datauri.min.css    # Framework DSFR complet (200 KB)
│   ├── icons-system.min.css       # Icônes système (180 KB)
│   ├── icons-utility.min.css      # Icônes utilitaires (50 KB)
│   ├── icons.min.css              # Index icônes (2 KB)
│   ├── dsfr-grid-helpers.css      # Helpers grille DSFR (20 utilitaires)
│   ├── theme.css                  # Styles principaux + compatibilité Bootstrap
│   ├── custom.css                 # Personnalisations LimeSurvey
│   └── print_theme.css            # Styles impression
│
├── icons/                     # Icônes DSFR (SVG externes)
│   ├── system/                # 400+ icônes système
│   ├── business/              # Icônes métier
│   └── utility/               # Icônes utilitaires
│
├── fonts/                     # Polices DSFR locales
│   ├── Marianne-*.woff2       # Police Marianne (officielle)
│   └── Spectral-*.woff2       # Police Spectral (titres)
│
├── scripts/                   # JavaScript
│   ├── dsfr.module.min.js     # DSFR JS (ES6 modules)
│   ├── dsfr.nomodule.min.js   # DSFR JS (fallback IE11)
│   ├── theme.js               # Init DSFR, dark mode, modales
│   └── custom.js              # Scripts personnalisés
│
├── views/                     # Templates Twig
│   ├── layout_global.twig         # Layout principal
│   ├── layout_printanswers.twig   # Layout impression
│   ├── subviews/
│   │   ├── header/                # Navigation DSFR, stepper
│   │   ├── footer/                # Footer DSFR, modales légales
│   │   ├── content/               # Contenu principal
│   │   ├── navigation/            # Boutons navigation DSFR
│   │   ├── messages/              # Alertes DSFR
│   │   ├── privacy/               # RGPD, cookies
│   │   └── printanswers/
│   │       ├── partials/
│   │       │   └── _question_header.twig  # Partial réutilisable
│   │       └── question_types/    # 32 templates printanswers DSFR
│   └── survey/
│       └── questions/
│           └── answer/            # Templates questions (36 types)
│               ├── multiplechoice/
│               ├── listradio/
│               ├── arrays/
│               └── ...
│
├── files/                     # Assets
│   ├── logo.png               # Logo par défaut
│   └── logos/
│       ├── marianne-flag.svg      # Drapeau Marianne (44x18)
│       └── marianne-block.svg     # Bloc Marianne (252x180)
│
└── docs/                      # Documentation
    ├── VERIFICATION_CONFORMITE_DSFR.md     # Rapport conformité 100%
    ├── EPIC-100-PERCENT-DSFR-COMPLIANCE.md # Plan d'action 160h
    ├── RAPPORT-ANALYSE-COMPLETE-THEME-DSFR.md
    ├── DSFR_GRID_PATTERNS.md               # 9 patterns grille
    ├── DSFR_INPUT_PATTERNS.md              # 10 patterns inputs
    └── archive/                             # Docs historiques
```

---

## 📝 Licence

[Licence Ouverte v2.0 (Etalab)](https://www.etalab.gouv.fr/licence-ouverte-open-licence/)



---

## 👤 Auteur

**Mission Ingénierie du Web, Service du Numérique**
- Email: conseil.miweb@finances.gouv.fr
- GitHub: [@bmatge](https://github.com/snum-miweb)

**Bertrand Matge**
- Email: bertrand.matge@finances.gouv.fr
- GitHub: [@bmatge](https://github.com/bmatge)

---

## 🐳 Développement avec Docker

Ce thème fait partie de la suite [limesurvey-dsfr-suite](https://github.com/bmatge/limesurvey-dsfr-suite), qui fournit un environnement Docker complet pour le développement local et le déploiement en production.

```bash
# Cloner les repos au même niveau
cd ~/GitHub
git clone https://github.com/bmatge/limesurvey-dsfr-suite.git
git clone https://github.com/bmatge/limesurvey-theme-dsfr.git
git clone https://github.com/bmatge/limesurvey-email-dsfr.git
git clone https://github.com/bmatge/limesurvey-conversation-albert.git

# Lancer l'environnement de développement
cd limesurvey-dsfr-suite
docker compose -f docker-compose.dev.yml up -d
# → http://localhost:8080 (admin / admin)
```

Les fichiers du thème sont montés en direct : toute modification est visible après un rafraîchissement du navigateur.

## 🔗 Ressources

- [Système de Design de l'État (DSFR)](https://www.systeme-de-design.gouv.fr/)
- [Documentation DSFR](https://www.systeme-de-design.gouv.fr/composants/)
- [RGAA - Référentiel Général d'Amélioration de l'Accessibilité](https://accessibilite.numerique.gouv.fr/)
