// src/bodies/creator.js
// ══════════════════════════════════════════════════════════════════
// CREAZIONE CORPI CELESTI (pianeti, lune, asteroidi, comete)
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { SUN_R, SEG } from '../utils/constants.js';
import { makeCanvasSprite } from '../utils/helpers.js';
import { textureLoader as defaultTextureLoader } from '../utils/textureLoader.js';

/**
 * Crea il Sole
 */
export function createSun(textureLoader, scene) {
  const texL = textureLoader || defaultTextureLoader;
  const sunTex = texL.load('./assets/textures/optimized/2k_sun.webp');
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_R, 64, 64),
    new THREE.MeshStandardMaterial({
      map: sunTex,
      emissiveMap: sunTex,
      emissive: new THREE.Color(0xffaa00),
      emissiveIntensity: 2.5,
      roughness: 1,
      metalness: 0,
    })
  );
  scene.add(sun);

  // Glow del Sole
  [
    [8, 128, 'rgba(255,200,50,0.9)', 'rgba(255,120,0,0.4)', SUN_R * 6],
    [2, 128, 'rgba(255,240,100,0.5)', 'rgba(255,160,0,0.1)', SUN_R * 14],
    [0, 128, 'rgba(255,180,30,0.18)', 'rgba(255,80,0,0)', SUN_R * 30],
  ].forEach(([iR, , cIn, cOut, sc]) => {
    const sp = makeCanvasSprite(
      (ctx, s) => {
        const g = ctx.createRadialGradient(s / 2, s / 2, iR, s / 2, s / 2, 128);
        g.addColorStop(0, cIn);
        g.addColorStop(0.45, cOut);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s, s);
      },
      256,
      sc
    );
    scene.add(sp);
    sp._isSunGlow = true;
  });

  return sun;
}

/**
 * Crea un pianeta
 */
export function createPlanet(data, textureLoader, scene) {
  const texL = textureLoader || defaultTextureLoader;
  const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: data.tex ? texL.load(data.tex) : null,
    color: data.color,
    roughness: 0.8,
    metalness: 0.1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.z = ((data.tilt || 0) * Math.PI) / 180;
  mesh.userData.bodyKey = data.key;

  // Pivot per orbita
  const pivot = new THREE.Object3D();
  pivot.add(mesh);
  scene.add(pivot);

  // Orbita
  const orbit = createOrbit(data.key, data.color || 0xffffff, scene, data.orbitRadius || 0);

  return { mesh, pivot, orbit, data };
}

/**
 * Crea un'orbita
 */
export function createOrbit(key, color, scene, radius) {
  if (radius === 0) return null;
  const points = [];
  for (let i = 0; i <= SEG; i++) {
    const theta = (i / SEG) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.3,
  });
  const orbit = new THREE.Line(geometry, material);
  orbit.userData.orbitKey = key;
  scene.add(orbit);
  return orbit;
}

/**
 * Crea una luna
 */
export function createMoon(data, parentMesh, textureLoader) {
  const texL = textureLoader || defaultTextureLoader;
  const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    map: data.tex ? texL.load(data.tex) : null,
    color: data.color,
    roughness: 0.9,
    metalness: 0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.bodyKey = data.key;

  const pivot = new THREE.Object3D();
  pivot.add(mesh);
  mesh.position.x = data.dist;
  parentMesh.add(pivot);

  return { mesh, pivot, data };
}

/**
 * Crea un asteroide
 */
export function createAsteroid(data, textureLoader, scene) {
  const texL = textureLoader || defaultTextureLoader;
  const geometry = new THREE.SphereGeometry(data.radius, 16, 16);
  const material = new THREE.MeshStandardMaterial({
    map: data.tex ? texL.load(data.tex) : null,
    color: data.color,
    roughness: 0.9,
    metalness: 0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.bodyKey = data.key;

  const pivot = new THREE.Object3D();
  pivot.add(mesh);
  scene.add(pivot);

  return { mesh, pivot, data };
}
