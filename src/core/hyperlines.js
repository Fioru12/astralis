// src/core/hyperlines.js
// ══════════════════════════════════════════════════════════════════
// IPER-LINEE - Linee di collegamento tra sistemi stellari
// Visibili in modalità Mappa Galattica
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';

/**
 * Crea iper-linee tra i sistemi stellari
 * @param {Array} allBodies - Elenco di tutti i corpi celesti
 * @returns {THREE.Group}
 */
export function createHyperlines(allBodies) {
  const group = new THREE.Group();
  group.name = 'hyperlines';

  const stars = allBodies.filter(b => b.type === 'star' && b.galaxyPos);

  if (stars.length === 0) return group;

  // Definisci i "percorsi iperspaziali" - connessioni tra stelle
  const connections = [
    ['Sol', 'Proxima Centauri'],
    ['Sol', 'Alpha Centauri A'],
    ['Sol', 'Sirio'],
    ['Proxima Centauri', 'Alpha Centauri A'],
    ['Proxima Centauri', 'Alpha Centauri B'],
    ['Alpha Centauri A', 'Alpha Centauri B'],
    ['Alpha Centauri A', 'Stella di Barnard'],
    ['Sirio', 'Vega'],
    ['Sirio', 'Altair'],
    ['Vega', 'Altair'],
    ['Altair', 'Deneb'],
    ['TRAPPIST-1', 'Sol'],
    ['Kepler-452', 'Sirio'],
  ];

  // Crea linee per ogni connessione
  connections.forEach(([from, to]) => {
    const starFrom = stars.find(s => s.label === from);
    const starTo = stars.find(s => s.label === to);

    if (starFrom && starTo && starFrom.galaxyPos && starTo.galaxyPos) {
      const points = [
        new THREE.Vector3(starFrom.galaxyPos.x, starFrom.galaxyPos.y, starFrom.galaxyPos.z),
        new THREE.Vector3(starTo.galaxyPos.x, starTo.galaxyPos.y, starTo.galaxyPos.z),
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x00ccff,
        linewidth: 2,
        fog: false,
        transparent: true,
        opacity: 0.35,
      });

      const line = new THREE.Line(geometry, material);
      line.userData.isHyperline = true;
      group.add(line);
    }
  });

  return group;
}

/**
 * Toggles hyperlines visibility
 * @param {THREE.Group} hyperlines
 * @param {boolean} visible
 */
export function setHyperlinesVisible(hyperlines, visible) {
  if (hyperlines) {
    hyperlines.visible = visible;
  }
}
