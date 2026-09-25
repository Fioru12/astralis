/**
 * @file habitableZone.js
 * @description Visualizzatore 3D della Zona Abitabile (Goldilocks Zone) per Sole e Stelle.
 * Genera anelli 3D luminescenti verdi con gradienti orbitali attorno a tutte le stelle della galassia,
 * indicando visivamente le fasce di temperatura dove l'acqua liquida può esistere.
 */

import * as THREE from 'three';
import { AU } from '../utils/constants.js';

/**
 * Parametri delle Zone Abitabili per Stella (in AU)
 * Inner = limite interno (troppo caldo), Outer = limite esterno (troppo freddo)
 */
export const HABITABLE_ZONE_DATA = {
  Sun: { innerAU: 0.95, outerAU: 1.68, label: 'Sistema Solare' },
  ProximaCentauri: { innerAU: 0.038, outerAU: 0.082, label: 'Proxima Centauri' },
  AlphaCentauriA: { innerAU: 1.1, outerAU: 1.8, label: 'Alpha Centauri A' },
  AlphaCentauriB: { innerAU: 0.7, outerAU: 1.3, label: 'Alpha Centauri B' },
  BarnardsStar: { innerAU: 0.03, outerAU: 0.07, label: 'Stella di Barnard' },
  Ross128: { innerAU: 0.04, outerAU: 0.09, label: 'Ross 128' },
  Trappist1: { innerAU: 0.024, outerAU: 0.052, label: 'TRAPPIST-1' },
  Kepler186: { innerAU: 0.35, outerAU: 0.68, label: 'Kepler-186' },
  TauCeti: { innerAU: 0.55, outerAU: 1.15, label: 'Tau Ceti' },
  Teegarden: { innerAU: 0.022, outerAU: 0.048, label: 'Stella di Teegarden' },
};

export class HabitableZoneManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'habitableZonesGroup';
    this.visible = options.visible !== undefined ? options.visible : false;
    this.group.visible = this.visible;
    this.zones = [];

    this.scene.add(this.group);
  }

  /**
   * Genera gli anelli 3D della zona abitabile per tutte le stelle registrate
   */
  init(allBodies) {
    this.allBodiesRef = allBodies;
    this.clear();
    if (this.visible) {
      this._buildZones();
    }
  }

  _buildZones() {
    if (!this.allBodiesRef) return;
    this.clear();
    const stars = this.allBodiesRef.filter((b) => b.type === 'star' && b.pivot);

    stars.forEach((star) => {
      const data = HABITABLE_ZONE_DATA[star.key] || {
        innerAU: Math.max(0.04, star.radius * 0.1),
        outerAU: Math.max(0.1, star.radius * 0.25),
        label: star.label,
      };

      const isSun = star.key === 'Sun';
      // Fattore di scala in unità Three.js
      const innerR = isSun ? data.innerAU * AU : data.innerAU * AU * 2;
      const outerR = isSun ? data.outerAU * AU : data.outerAU * AU * 2;

      const ringGeo = new THREE.RingGeometry(innerR, outerR, 96, 1);

      // Shader per gradiente di bioluminescenza
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          innerColor: { value: new THREE.Color(0x50fa7b) },
          outerColor: { value: new THREE.Color(0x00ff88) },
          opacity: { value: 0.22 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPos;
          void main() {
            vUv = uv;
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 innerColor;
          uniform vec3 outerColor;
          uniform float opacity;
          varying vec2 vUv;
          varying vec3 vPos;

          void main() {
            float dist = vUv.x;
            float alpha = sin(dist * 3.14159265);
            float pulse = 0.85 + 0.15 * sin(time * 0.002 + dist * 10.0);

            vec3 col = mix(innerColor, outerColor, dist);
            gl_FragColor = vec4(col * pulse, alpha * opacity);
          }
        `,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const mesh = new THREE.Mesh(ringGeo, mat);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.copy(star.pivot.position);

      this.group.add(mesh);
      this.zones.push({
        starKey: star.key,
        mesh,
        material: mat,
        data,
      });
    });
  }

  update(timeMs = performance.now()) {
    if (!this.visible || this.zones.length === 0) return;
    this.zones.forEach((z) => {
      if (z.material.uniforms?.time) {
        z.material.uniforms.time.value = timeMs;
      }
    });
  }

  setVisible(visible) {
    this.visible = Boolean(visible);
    this.group.visible = this.visible;
    if (this.visible && this.zones.length === 0) {
      this._buildZones();
    }
  }

  toggle() {
    this.setVisible(!this.visible);
    return this.visible;
  }

  clear() {
    this.zones.forEach((z) => {
      this.group.remove(z.mesh);
      z.mesh.geometry.dispose();
      z.mesh.material.dispose();
    });
    this.zones = [];
  }

  /**
   * Verifica se un pianeta o coordinata risiede all'interno della Zona Abitabile
   */
  isBodyHabitable(body) {
    if (!body) return false;
    if (body.habitability && body.habitability.toLowerCase().includes('abitabile')) {
      return true;
    }
    if (body.distAU) {
      const parentKey = body.parent || 'Sun';
      const data = HABITABLE_ZONE_DATA[parentKey] || HABITABLE_ZONE_DATA.Sun;
      return body.distAU >= data.innerAU && body.distAU <= data.outerAU;
    }
    return false;
  }
}
