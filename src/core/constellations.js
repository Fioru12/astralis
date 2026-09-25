/**
 * @file constellations.js
 * @description Constellations & Deep Sky Objects (DSO) visualization system for Astralis 3D.
 * Renders accurate astronomical constellations and iconic Messier deep sky objects on the celestial sphere.
 */

import * as THREE from 'three';

export const CONSTELLATIONS_DATA = [
  {
    key: 'orion',
    name: { it: 'Orione (Il Cacciatore)', en: 'Orion (The Hunter)' },
    stars: [
      { name: 'Betelgeuse', ra: 5.92, dec: 7.41 },
      { name: 'Rigel', ra: 5.24, dec: -8.2 },
      { name: 'Bellatrix', ra: 5.42, dec: 6.35 },
      { name: 'Saiph', ra: 5.79, dec: -9.67 },
      { name: 'Alnitak', ra: 5.68, dec: -1.94 },
      { name: 'Alnilam', ra: 5.6, dec: -1.2 },
      { name: 'Mintaka', ra: 5.53, dec: -0.3 },
      { name: 'Meissa', ra: 5.58, dec: 9.93 },
    ],
    lines: [
      ['Betelgeuse', 'Bellatrix'],
      ['Bellatrix', 'Mintaka'],
      ['Mintaka', 'Alnilam'],
      ['Alnilam', 'Alnitak'],
      ['Alnitak', 'Saiph'],
      ['Saiph', 'Rigel'],
      ['Rigel', 'Betelgeuse'],
      ['Bellatrix', 'Meissa'],
      ['Betelgeuse', 'Meissa'],
    ],
  },
  {
    key: 'ursa_major',
    name: { it: 'Orsa Maggiore (Grande Carro)', en: 'Ursa Major (Big Dipper)' },
    stars: [
      { name: 'Dubhe', ra: 11.06, dec: 61.75 },
      { name: 'Merak', ra: 11.03, dec: 56.38 },
      { name: 'Phecda', ra: 11.9, dec: 53.69 },
      { name: 'Megrez', ra: 12.25, dec: 57.03 },
      { name: 'Alioth', ra: 12.9, dec: 55.96 },
      { name: 'Mizar', ra: 13.4, dec: 54.92 },
      { name: 'Alkaid', ra: 13.79, dec: 49.31 },
    ],
    lines: [
      ['Dubhe', 'Merak'],
      ['Merak', 'Phecda'],
      ['Phecda', 'Megrez'],
      ['Megrez', 'Dubhe'],
      ['Megrez', 'Alioth'],
      ['Alioth', 'Mizar'],
      ['Mizar', 'Alkaid'],
    ],
  },
  {
    key: 'cassiopeia',
    name: { it: 'Cassiopea (La Regina)', en: 'Cassiopeia (The Queen)' },
    stars: [
      { name: 'Caph', ra: 0.15, dec: 59.15 },
      { name: 'Schedar', ra: 0.68, dec: 56.54 },
      { name: 'Navi', ra: 0.94, dec: 60.72 },
      { name: 'Ruchbah', ra: 1.43, dec: 60.23 },
      { name: 'Segin', ra: 1.9, dec: 63.67 },
    ],
    lines: [
      ['Caph', 'Schedar'],
      ['Schedar', 'Navi'],
      ['Navi', 'Ruchbah'],
      ['Ruchbah', 'Segin'],
    ],
  },
  {
    key: 'cygnus',
    name: { it: 'Cigno (Croce del Nord)', en: 'Cygnus (Northern Cross)' },
    stars: [
      { name: 'Deneb', ra: 20.69, dec: 45.28 },
      { name: 'Sadr', ra: 20.37, dec: 40.26 },
      { name: 'Albireo', ra: 19.51, dec: 27.96 },
      { name: 'Gienah', ra: 20.77, dec: 33.97 },
      { name: 'Fawaris', ra: 19.75, dec: 45.13 },
    ],
    lines: [
      ['Deneb', 'Sadr'],
      ['Sadr', 'Albireo'],
      ['Gienah', 'Sadr'],
      ['Sadr', 'Fawaris'],
    ],
  },
  {
    key: 'scorpius',
    name: { it: 'Scorpione', en: 'Scorpius' },
    stars: [
      { name: 'Antares', ra: 16.49, dec: -26.43 },
      { name: 'Graffias', ra: 16.09, dec: -19.8 },
      { name: 'Dschubba', ra: 16.01, dec: -22.62 },
      { name: 'Sargas', ra: 17.62, dec: -43.0 },
      { name: 'Shaula', ra: 17.56, dec: -37.1 },
    ],
    lines: [
      ['Graffias', 'Dschubba'],
      ['Dschubba', 'Antares'],
      ['Antares', 'Sargas'],
      ['Sargas', 'Shaula'],
    ],
  },
  {
    key: 'crux',
    name: { it: 'Croce del Sud', en: 'Southern Cross' },
    stars: [
      { name: 'Acrux', ra: 12.44, dec: -63.1 },
      { name: 'Mimosa', ra: 12.79, dec: -59.69 },
      { name: 'Gacrux', ra: 12.52, dec: -57.11 },
      { name: 'Imai', ra: 12.25, dec: -58.75 },
    ],
    lines: [
      ['Gacrux', 'Acrux'],
      ['Mimosa', 'Imai'],
    ],
  },
];

export const DEEP_SKY_OBJECTS = [
  {
    key: 'M31',
    name: { it: 'M31 - Galassia di Andromeda', en: 'M31 - Andromeda Galaxy' },
    type: { it: 'Galassia a spirale (2.5 mln a.l.)', en: 'Spiral galaxy (2.5 Mly)' },
    ra: 0.71,
    dec: 41.27,
    color: '#8be9fd',
    icon: '🌀',
  },
  {
    key: 'M42',
    name: { it: 'M42 - Nebulosa di Orione', en: 'M42 - Orion Nebula' },
    type: { it: 'Nebulosa a emissione e riflessione', en: 'Emission & reflection nebula' },
    ra: 5.59,
    dec: -5.39,
    color: '#ff79c6',
    icon: '✨',
  },
  {
    key: 'M45',
    name: { it: 'M45 - Le Pleiadi', en: 'M45 - The Pleiades' },
    type: { it: 'Ammasso aperto (Le Sette Sorelle)', en: 'Open star cluster (Seven Sisters)' },
    ra: 3.79,
    dec: 24.11,
    color: '#50fa7b',
    icon: '🌟',
  },
  {
    key: 'M1',
    name: { it: 'M1 - Nebulosa del Granchio', en: 'M1 - Crab Nebula' },
    type: { it: 'Resto di supernova del 1054', en: 'Supernova remnant from 1054' },
    ra: 5.58,
    dec: 22.01,
    color: '#bd93f9',
    icon: '💥',
  },
  {
    key: 'M57',
    name: { it: 'M57 - Nebulosa Anello', en: 'M57 - Ring Nebula' },
    type: { it: 'Nebulosa planetaria in Lyra', en: 'Planetary nebula in Lyra' },
    ra: 18.89,
    dec: 33.03,
    color: '#f1fa8c',
    icon: '⭕',
  },
  {
    key: 'M104',
    name: { it: 'M104 - Galassia Sombrero', en: 'M104 - Sombrero Galaxy' },
    type: { it: 'Galassia lenticolare in Vergine', en: 'Lenticular galaxy in Virgo' },
    ra: 12.67,
    dec: -11.62,
    color: '#ffb86c',
    icon: '🌌',
  },
];

/**
 * Converte coordinate celesti RA (ore) e Dec (gradi) in coordinate cartesiane 3D
 */
export function raDecToVector3(raHours, decDeg, radius = 7000) {
  const raRad = (raHours * 15 * Math.PI) / 180;
  const decRad = (decDeg * Math.PI) / 180;

  const x = radius * Math.cos(decRad) * Math.cos(raRad);
  const y = radius * Math.sin(decRad);
  const z = radius * Math.cos(decRad) * Math.sin(raRad);

  return new THREE.Vector3(x, y, z);
}

export class ConstellationManager {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'constellationsGroup';
    this.visible = false;
    this.dsoVisible = true;
    this.labels = [];

    this._buildConstellations();
    this._buildDeepSkyObjects();
    this.scene.add(this.group);
    this.group.visible = this.visible;
  }

  setVisible(visible) {
    this.visible = Boolean(visible);
    this.group.visible = this.visible;
  }

  toggle() {
    this.setVisible(!this.visible);
    return this.visible;
  }

  _buildConstellations() {
    const linePositions = [];
    const starRadius = 7200;

    CONSTELLATIONS_DATA.forEach((constellation) => {
      const starMap = new Map();
      constellation.stars.forEach((star) => {
        const pos = raDecToVector3(star.ra, star.dec, starRadius);
        starMap.set(star.name, pos);
      });

      constellation.lines.forEach(([startName, endName]) => {
        const p1 = starMap.get(startName);
        const p2 = starMap.get(endName);
        if (p1 && p2) {
          linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      });
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0x5bc4cf,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(geometry, material);
    lines.name = 'constellationLines';
    this.group.add(lines);
  }

  _buildDeepSkyObjects() {
    const dsoGroup = new THREE.Group();
    dsoGroup.name = 'deepSkyObjects';

    DEEP_SKY_OBJECTS.forEach((dso) => {
      const pos = raDecToVector3(dso.ra, dso.dec, 7150);

      // DSO sprite / beacon
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
        grad.addColorStop(0, dso.color);
        grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 32, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(pos);
      sprite.scale.set(160, 160, 1);
      sprite.userData = { isDSO: true, dsoData: dso };
      dsoGroup.add(sprite);
    });

    this.group.add(dsoGroup);
  }
}
