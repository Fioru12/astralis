// src/core/navGrid.js
// ══════════════════════════════════════════════════════════════════
// GRIGLIA DI NAVIGAZIONE - piano prospettico dell'eclittica
// Ispirata alla star map di Project Hail Mary / GAIA (valhovey).
// Riferimento visivo "computer di bordo", mostrata solo in HUD nav.
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';

const NAV_DIM = 0x5d7689;

/**
 * Costruisce la griglia di riferimento dell'eclittica.
 * @returns {THREE.Group} gruppo con griglia centrale + piani offset
 */
export function createNavGrid() {
  const group = new THREE.Group();
  group.name = 'navGrid';

  const SIZE = 6400; // ~40 AU di raggio (fino a Plutone)
  const DIVISIONS = 32; // celle da 200 unità (~2.5 AU)

  // Piano centrale sull'eclittica (y = 0)
  const main = new THREE.GridHelper(SIZE, DIVISIONS, NAV_DIM, NAV_DIM);
  main.material.transparent = true;
  main.material.opacity = 0.22;
  main.material.depthWrite = false;
  main.material.fog = false;
  group.add(main);

  // Due piani offset (sopra/sotto) per la profondità "olografica"
  [900, -900].forEach((y) => {
    const plane = new THREE.GridHelper(SIZE, DIVISIONS, NAV_DIM, NAV_DIM);
    plane.position.y = y;
    plane.material.transparent = true;
    plane.material.opacity = 0.07;
    plane.material.depthWrite = false;
    plane.material.fog = false;
    group.add(plane);
  });

  group.visible = false; // nascosta finché non si attiva l'HUD nav
  return group;
}

/**
 * Mostra/nasconde la griglia.
 * @param {THREE.Group} grid
 * @param {boolean} visible
 */
export function setNavGridVisible(grid, visible) {
  if (grid) grid.visible = visible;
}
