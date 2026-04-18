#!/usr/bin/env bash
#
# release.sh — Prépare une release du thème DSFR pour LimeSurvey
#
# Usage :
#   ./release.sh <version>                  Bump config.xml, commit, tag, crée le ZIP
#   ./release.sh <version> --dry            Affiche ce qui serait fait, sans rien modifier
#   ./release.sh <version> --package-only   Produit uniquement le ZIP
#                                           (bump config.xml si différent, pas de
#                                           commit/tag). À utiliser quand le tag
#                                           existe déjà (release déjà créée).
#
# Exemple :
#   ./release.sh 1.1.0
#   ./release.sh 1.2.0 --dry
#   ./release.sh 1.2.0 --package-only

set -euo pipefail

THEME_NAME="dsfr"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_XML="$SCRIPT_DIR/config.xml"
DIST_DIR="$SCRIPT_DIR/dist"

# --- Couleurs ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

# --- Fonctions utilitaires ---
info()  { echo -e "${GREEN}✓${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠${NC} $*"; }
error() { echo -e "${RED}✗${NC} $*" >&2; exit 1; }

usage() {
    echo "Usage : $0 <version> [--dry]"
    echo ""
    echo "  <version>  Numéro de version semver (ex: 1.1.0)"
    echo "  --dry      Affiche ce qui serait fait sans rien modifier"
    exit 1
}

# --- Validation des arguments ---
[[ $# -lt 1 ]] && usage
VERSION="$1"
DRY_RUN=false
PACKAGE_ONLY=false
case "${2:-}" in
    --dry)          DRY_RUN=true ;;
    --package-only) PACKAGE_ONLY=true ;;
    "")             ;;
    *)              error "Option inconnue : ${2}" ;;
esac

# Valider le format semver
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    error "Version invalide : '$VERSION'. Format attendu : X.Y.Z (ex: 1.1.0)"
fi

# Vérifier qu'on est bien dans le repo git du thème
cd "$SCRIPT_DIR"
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Ce script doit être exécuté dans le dépôt git du thème"
fi

if ! $PACKAGE_ONLY; then
    # Mode complet : working tree propre requis
    if [[ -n "$(git diff --name-only)" ]] || [[ -n "$(git diff --cached --name-only)" ]]; then
        error "Le working tree contient des modifications non committées. Committez ou stashez avant de releaser."
    fi

    # Mode complet : tag ne doit pas exister
    if git tag -l "v$VERSION" | grep -q "v$VERSION"; then
        error "Le tag v$VERSION existe déjà. Utilisez --package-only pour produire juste le ZIP."
    fi
fi

# Lire la version actuelle
CURRENT_VERSION=$(sed -n 's/.*<version>\([^<]*\)<\/version>.*/\1/p' "$CONFIG_XML" | head -1)
TODAY=$(date +%Y-%m-%d)
LAST_UPDATE="$TODAY 00:00:00"

echo ""
echo -e "${BOLD}Release du thème $THEME_NAME${NC}"
echo -e "  Version actuelle : ${YELLOW}$CURRENT_VERSION${NC}"
echo -e "  Nouvelle version : ${GREEN}$VERSION${NC}"
echo -e "  Date             : $TODAY"
echo ""

if $DRY_RUN; then
    warn "Mode dry-run — aucune modification ne sera effectuée"
    echo ""
    echo "Actions qui seraient effectuées :"
    echo "  1. Mettre à jour config.xml : version $CURRENT_VERSION → $VERSION"
    echo "  2. Mettre à jour config.xml : lastUpdate → $LAST_UPDATE"
    echo "  3. Créer le commit : chore(release): v$VERSION"
    echo "  4. Créer le tag : v$VERSION"
    echo "  5. Créer le ZIP : dist/${THEME_NAME}-${VERSION}.zip"
    echo ""
    exit 0
fi

# --- 1. Mettre à jour config.xml ---
if [[ "$CURRENT_VERSION" != "$VERSION" ]]; then
    info "Mise à jour de config.xml..."
    sed -i '' "s|<version>${CURRENT_VERSION}</version>|<version>${VERSION}</version>|" "$CONFIG_XML"
    sed -i '' "s|<lastUpdate>[^<]*</lastUpdate>|<lastUpdate>${LAST_UPDATE}</lastUpdate>|" "$CONFIG_XML"

    NEW_VERSION=$(sed -n 's/.*<version>\([^<]*\)<\/version>.*/\1/p' "$CONFIG_XML" | head -1)
    NEW_UPDATE=$(sed -n 's/.*<lastUpdate>\([^<]*\)<\/lastUpdate>.*/\1/p' "$CONFIG_XML")
    if [[ "$NEW_VERSION" != "$VERSION" ]]; then
        error "Échec de la mise à jour de la version dans config.xml"
    fi
    info "  version: $CURRENT_VERSION → $NEW_VERSION"
    info "  lastUpdate: → $NEW_UPDATE"
else
    info "config.xml déjà en version $VERSION, pas de bump nécessaire."
fi

# --- 2. Commit + Tag (sauf en mode --package-only) ---
if ! $PACKAGE_ONLY; then
    info "Création du commit..."
    git add config.xml
    git commit -m "chore(release): v$VERSION"

    info "Création du tag v$VERSION..."
    git tag -a "v$VERSION" -m "Release v$VERSION"
fi

# --- 3. Créer le ZIP ---
info "Création du ZIP de distribution..."
mkdir -p "$DIST_DIR"
ZIP_FILE="$DIST_DIR/${THEME_NAME}-${VERSION}.zip"

# Créer le ZIP avec la structure attendue par LimeSurvey :
#   dsfr/              ← racine = <name> dans config.xml
#   ├── config.xml
#   ├── css/
#   ├── ...
#
# Le dossier sur disque peut s'appeler différemment (ex: theme-dsfr),
# on utilise un lien symbolique temporaire pour que le ZIP ait le bon nom racine.
TMPDIR_ZIP=$(mktemp -d)
ln -s "$SCRIPT_DIR" "$TMPDIR_ZIP/$THEME_NAME"

cd "$TMPDIR_ZIP"
# Exclusions : tout ce qui ne sert QU'au développement du thème (pas à son
# fonctionnement côté LimeSurvey). Garde :
#   - README.md, DECLARATION_RGAA.md, THEME_COVERAGE.md, THEME_OPTIONS.md
#     (utiles comme référence pour les admins LimeSurvey)
# Exclut :
#   - git, DS_Store, dist, release.sh, exemple
#   - src/ + esbuild.config.mjs (sources JS — le bundle scripts/custom.js est déjà là)
#   - scripts/update-dsfr.sh (outil de maintenance, pas de prod)
#   - .github/ (workflows, pas utiles dans le ZIP)
#   - CONTRIBUTING.md, DECLARATION_RGAA_AUDIT_INITIAL.md (dev-only)
#   - DOCUMENTATION.md, DECLARATION_RGAA_INITIALE.md (obsolètes depuis la réorg doc)
zip -r "$ZIP_FILE" "$THEME_NAME/" \
    -x "${THEME_NAME}/.git" \
    -x "${THEME_NAME}/.git/*" \
    -x "${THEME_NAME}/.github/*" \
    -x "${THEME_NAME}/.gitignore" \
    -x "${THEME_NAME}/.DS_Store" \
    -x "${THEME_NAME}/**/.DS_Store" \
    -x "${THEME_NAME}/dist/*" \
    -x "${THEME_NAME}/release.sh" \
    -x "${THEME_NAME}/exemple/*" \
    -x "${THEME_NAME}/src/*" \
    -x "${THEME_NAME}/esbuild.config.mjs" \
    -x "${THEME_NAME}/scripts/update-dsfr.sh" \
    -x "${THEME_NAME}/CONTRIBUTING.md" \
    -x "${THEME_NAME}/DECLARATION_RGAA_AUDIT_INITIAL.md" \
    -x "${THEME_NAME}/DOCUMENTATION.md" \
    -x "${THEME_NAME}/DECLARATION_RGAA_INITIALE.md" \
    > /dev/null

rm -rf "$TMPDIR_ZIP"
cd "$SCRIPT_DIR"

# Afficher la taille du ZIP
ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
info "ZIP créé : $ZIP_FILE ($ZIP_SIZE)"

# --- Résumé ---
echo ""
echo -e "${BOLD}Release v$VERSION prête !${NC}"
echo ""
echo "Fichiers :"
echo "  📦 $ZIP_FILE"
echo ""
echo "Prochaines étapes :"
echo "  1. Vérifier le contenu du ZIP :"
echo "       unzip -l $ZIP_FILE"
echo ""
echo "  2. Pousser le commit et le tag :"
echo "       git push origin main --tags"
echo ""
echo "  3. Créer la GitHub Release :"
echo "       gh release create v$VERSION $ZIP_FILE \\"
echo "         --title \"v$VERSION\" \\"
echo "         --generate-notes"
echo ""
