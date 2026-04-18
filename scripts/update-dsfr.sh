#!/usr/bin/env bash
# =============================================================================
# update-dsfr.sh — Met à jour les ressources DSFR packagées dans le thème
# depuis une release GitHub officielle de GouvernementFR/dsfr.
#
# Usage :
#   ./scripts/update-dsfr.sh [version]
#
# Si `version` est omise, récupère la dernière release publiée via l'API
# GitHub (ex: "v1.14.4").
#
# Mise à jour :
#   - CSS framework (dsfr.min.css, icons.min.css, icons-system.min.css)
#   - JS DSFR (dsfr.module.min.js, dsfr.nomodule.min.js + .map)
#   - Polices (Marianne + Spectral en WOFF/WOFF2)
#   - Icônes SVG : TOUTES les catégories présentes dans dist/icons/.
#     Depuis DSFR 1.13+, les icônes sont réparties en ~18 catégories
#     (arrows, buildings, business, communication, design, development,
#     device, document, editor, finance, health, logo, map, media,
#     others, system, user, weather). Le CSS `dsfr.min.css` référence
#     des icônes dans plusieurs d'entre elles — si on en exclut, on
#     obtient des 404 sur les pages qui utilisent ces composants.
#   - Badge version dans README.md
#
# Fichiers PAS touchés :
#   - scripts/theme.js et custom.js  (JS custom du thème)
#   - css/theme.css, custom.css, print_theme.css, dsfr-grid-helpers.css  (custom)
#   - css/dsfr-no-datauri.min.css, icons-embedded.min.css  (héritage v1.11,
#     à ré-évaluer manuellement s'ils sont encore nécessaires)
#
# Le script n'effectue AUCUN commit. Vérifier les changements avec git diff,
# lancer la suite de tests (cf. TESTING.md du repo parent), puis commiter.
# =============================================================================
set -euo pipefail

THEME_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

# --- Détermination de la version cible ------------------------------------
if [[ $# -ge 1 ]]; then
    VERSION="$1"
    [[ "$VERSION" =~ ^v ]] || VERSION="v$VERSION"
else
    echo "▶ Récupération de la dernière release DSFR via GitHub..."
    VERSION="$(curl -sL https://api.github.com/repos/GouvernementFR/dsfr/releases/latest \
               | python3 -c "import json, sys; print(json.load(sys.stdin)['tag_name'])")"
fi
VERSION_NUM="${VERSION#v}"
ZIP_URL="https://github.com/GouvernementFR/dsfr/releases/download/${VERSION}/dsfr-${VERSION}.zip"

echo "▶ Version cible : ${VERSION} (${VERSION_NUM})"
echo "▶ URL : ${ZIP_URL}"

# --- Téléchargement + extraction ------------------------------------------
echo "▶ Téléchargement..."
curl -sL -o "${TMP_DIR}/dsfr.zip" "${ZIP_URL}" || {
    echo "ERREUR : impossible de télécharger ${ZIP_URL}" >&2
    exit 2
}

echo "▶ Extraction..."
unzip -q "${TMP_DIR}/dsfr.zip" -d "${TMP_DIR}" || {
    echo "ERREUR : archive invalide" >&2
    exit 2
}

SRC="${TMP_DIR}/dist"
[[ -d "$SRC" ]] || {
    echo "ERREUR : structure inattendue, pas de dossier dist/ à la racine de l'archive" >&2
    exit 2
}

# --- Vérification de la version dans les fichiers -------------------------
ACTUAL_VERSION="$(head -c 200 "${SRC}/dsfr/dsfr.min.css" | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | head -1)"
if [[ "$ACTUAL_VERSION" != "$VERSION" ]]; then
    echo "⚠️  Le CSS extrait mentionne ${ACTUAL_VERSION}, demandé ${VERSION}. Arrêt." >&2
    exit 3
fi

# --- Copie des ressources -------------------------------------------------
echo ""
echo "▶ Mise à jour des CSS..."
cp -v "${SRC}/dsfr/dsfr.min.css"                              "${THEME_DIR}/css/dsfr.min.css"
cp -v "${SRC}/utility/icons/icons.min.css"                    "${THEME_DIR}/css/icons.min.css"
cp -v "${SRC}/utility/icons/icons-system/icons-system.min.css" "${THEME_DIR}/css/icons-system.min.css"

echo ""
echo "▶ Mise à jour du JS DSFR..."
mkdir -p "${THEME_DIR}/js"
cp -v "${SRC}/dsfr/dsfr.module.min.js"                        "${THEME_DIR}/js/dsfr.module.min.js"
cp -v "${SRC}/dsfr/dsfr.module.min.js.map"                    "${THEME_DIR}/js/dsfr.module.min.js.map"
cp -v "${SRC}/dsfr/dsfr.nomodule.min.js"                      "${THEME_DIR}/js/dsfr.nomodule.min.js"
cp -v "${SRC}/dsfr/dsfr.nomodule.min.js.map"                  "${THEME_DIR}/js/dsfr.nomodule.min.js.map"

echo ""
echo "▶ Mise à jour des polices (Marianne + Spectral)..."
cp -v "${SRC}/fonts/"*.woff  "${THEME_DIR}/fonts/" 2>/dev/null || true
cp -v "${SRC}/fonts/"*.woff2 "${THEME_DIR}/fonts/" 2>/dev/null || true

echo ""
echo "▶ Mise à jour des icônes SVG (toutes les catégories de la release)..."
# On purge d'abord l'ancien répertoire `icons/` pour éviter de conserver
# des SVG orphelins d'une release précédente. Puis on copie toutes les
# catégories fournies par DSFR.
rm -rf "${THEME_DIR}/icons"
mkdir -p "${THEME_DIR}/icons"
total_svg=0
for cat_dir in "${SRC}/icons/"*/; do
    cat="$(basename "$cat_dir")"
    cp -R "$cat_dir" "${THEME_DIR}/icons/${cat}"
    count="$(find "${THEME_DIR}/icons/${cat}" -name "*.svg" | wc -l | tr -d ' ')"
    total_svg=$((total_svg + count))
    printf "  %-16s : %4d SVG\n" "${cat}/" "${count}"
done
echo "  ───────────────────────"
printf "  %-16s : %4d SVG\n" "TOTAL" "${total_svg}"

# --- Mise à jour du badge de version dans README.md ------------------------
echo ""
echo "▶ Mise à jour du badge DSFR dans README.md..."
# On garde major.minor dans le badge pour éviter du churn sur chaque patch.
VERSION_MM="${VERSION_NUM%.*}"     # ex: 1.14.4 → 1.14
BADGE_NEW="DSFR-v${VERSION_MM}-blue"
if grep -qE 'DSFR-v[0-9]+\.[0-9]+(\.[0-9]+)?-blue' "${THEME_DIR}/README.md"; then
    sed -E -i.bak "s|DSFR-v[0-9]+\.[0-9]+(\.[0-9]+)?-blue|${BADGE_NEW}|g" "${THEME_DIR}/README.md"
    rm -f "${THEME_DIR}/README.md.bak"
    echo "  → badge mis à jour en ${BADGE_NEW}"
else
    echo "  → aucun badge DSFR détecté dans README.md"
fi

# --- Résumé ---------------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Mise à jour DSFR ${VERSION} terminée"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Prochaines étapes :"
echo "  1. Vérifier les changements : git diff --stat"
echo "  2. Lancer les tests : ./run_tests.sh --full   (depuis le repo parent)"
echo "  3. Tester visuellement : docker compose -f docker-compose.dev.yml restart"
echo "     + purge cache : npm run dev:purge-cache"
echo "  4. Mettre à jour DECLARATION_RGAA.md si la version DSFR y est citée"
echo "  5. Commiter : git add -A && git commit -m \"chore(dsfr): bump to ${VERSION}\""
echo ""
