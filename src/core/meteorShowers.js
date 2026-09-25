/**
 * @file meteorShowers.js
 * @description Dynamic Meteor Showers & Shooting Stars generator for Astralis 3D.
 * Procedurally generates subtle streaking shooting stars with fading tails across the sky.
 */

import * as THREE from 'three';

export class MeteorShowerManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'meteorShowersGroup';
    this.visible = true;
    this.maxMeteors = options.maxMeteors || 6;
    this.meteors = [];
    this.spawnTimer = 0;
    this.spawnInterval = options.spawnInterval || 2.5; // seconds between meteors

    this.scene.add(this.group);
  }

  setVisible(visible) {
    this.visible = Boolean(visible);
    this.group.visible = this.visible;
  }

  toggle() {
    this.setVisible(!this.visible);
    return this.visible;
  }

  update(dt = 0.016, date = new Date()) {
    if (!this.visible) return;

    // Seasonal activity boost (Perseids in August, Geminids in Dec)
    const month = date.getUTCMonth();
    const rateMultiplier = month === 7 ? 2.5 : month === 11 ? 2.0 : 1.0;

    this.spawnTimer += dt * rateMultiplier;
    if (this.spawnTimer >= this.spawnInterval && this.meteors.length < this.maxMeteors) {
      this.spawnTimer = 0;
      this.spawnMeteor();
    }

    // Update active meteors
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.progress += dt / m.lifetime;

      if (m.progress >= 1.0) {
        // Remove completed meteor
        this.group.remove(m.mesh);
        m.mesh.geometry.dispose();
        m.mesh.material.dispose();
        this.meteors.splice(i, 1);
      } else {
        // Animate line positions
        const head = m.start.clone().lerp(m.end, m.progress);
        const tailProgress = Math.max(0, m.progress - m.tailLength);
        const tail = m.start.clone().lerp(m.end, tailProgress);

        const posAttr = m.mesh.geometry.attributes.position;
        posAttr.setXYZ(0, head.x, head.y, head.z);
        posAttr.setXYZ(1, tail.x, tail.y, tail.z);
        posAttr.needsUpdate = true;

        // Fade in & out
        const fade = Math.sin(m.progress * Math.PI);
        m.mesh.material.opacity = fade * 0.9;
      }
    }
  }

  spawnMeteor(customStart = null, customEnd = null) {
    const r = 5500 + Math.random() * 1500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const start =
      customStart ||
      new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );

    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize();

    const streakLength = 600 + Math.random() * 800;
    const end = customEnd || start.clone().addScaledVector(dir, streakLength);

    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array([start.x, start.y, start.z, start.x, start.y, start.z]);
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0x99ffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mesh = new THREE.Line(geom, mat);
    this.group.add(mesh);

    this.meteors.push({
      mesh,
      start,
      end,
      progress: 0,
      lifetime: 0.6 + Math.random() * 0.5, // 0.6 to 1.1s
      tailLength: 0.35,
    });
  }

  clear() {
    for (const m of this.meteors) {
      this.group.remove(m.mesh);
      m.mesh.geometry.dispose();
      m.mesh.material.dispose();
    }
    this.meteors = [];
  }
}
