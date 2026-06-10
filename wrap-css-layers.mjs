#!/usr/bin/env node
// =============================================================================
// wrap-css-layers.mjs
//
// Enveloppe les CSS vendorés DSFR dans une cascade layer (`@layer dsfr { … }`)
// pour que l'ordre des couches remplace la guerre de spécificité avec les
// styles du thème (issue #41). Les feuilles maintenues à la main (theme.css,
// custom.css) sont wrappées directement à la source — ce script ne traite que
// les fichiers regénérés par scripts/update-dsfr.sh.
//
// Ordre de cascade déclaré : `overrides, theme, dsfr, custom` — fidèle à
// l'ordre de chargement réel (theme.css remplace bootstrap.css et charge
// AVANT dsfr.min.css ; custom.css charge en dernier).
// - déclarations normales : custom > dsfr > theme (équivalent de l'ancien
//   ordre de chargement, sans dépendre de la spécificité) ;
// - déclarations !important : l'ordre s'INVERSE — les !important du DSFR
//   (utilitaires fr-m*/fr-p*, fr-hidden…) battent ceux de theme/custom.
//   La couche `overrides`, déclarée en premier, sert d'échappatoire : ses
//   !important battent ceux du DSFR.
//
// Idempotent : un fichier déjà wrappé (préambule détecté) est laissé tel quel.
// Le `@charset` de tête est retiré (l'UTF-8 est l'encodage par défaut servi
// par le serveur ; `@charset` doit être strictement en tête de fichier, ce
// qui est incompatible avec le préambule @layer).
//
// Usage :
//   node modules/theme-dsfr/wrap-css-layers.mjs
//
// Chaîné dans `build:theme` (repo parent) et scripts/update-dsfr.sh.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LAYER_ORDER = '@layer overrides, theme, dsfr, custom;';

// Fichiers vendorés à wrapper, avec leur couche cible.
const FILES = [
  { path: 'css/dsfr.min.css', layer: 'dsfr' },
  { path: 'css/icons.min.css', layer: 'dsfr' },
];

let changed = 0;
for (const { path, layer } of FILES) {
  const abs = resolve(__dirname, path);
  let css = readFileSync(abs, 'utf8');

  const preamble = `${LAYER_ORDER}\n@layer ${layer} {\n`;
  if (css.startsWith(preamble)) {
    console.log(`[wrap-css-layers] déjà wrappé : ${path}`);
    continue;
  }

  // @charset doit être le tout premier byte d'une feuille — incompatible
  // avec le préambule. L'encodage reste UTF-8 (défaut HTTP/HTML).
  css = css.replace(/^@charset\s+"[^"]*";\s*/i, '');

  writeFileSync(abs, `${preamble}${css}\n}\n`);
  console.log(`[wrap-css-layers] wrappé en @layer ${layer} : ${path}`);
  changed++;
}

console.log(`[wrap-css-layers] terminé (${changed} fichier(s) modifié(s))`);
