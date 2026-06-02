import * as THREE from 'three';
import { AU, DEG } from '../utils/constants.js';
import { makeGlow } from '../utils/helpers.js';
import { ORBITAL_ELEMENTS } from '../data/celestialData.js';

export function generateAsteroidBelt(innerRadius, outerRadius, count, color) {
  const asteroidGroup = new THREE.Group();
  const geometryHi = new THREE.SphereGeometry(0.3, 8, 8);
  const geometryLo = new THREE.SphereGeometry(0.3, 4, 4);
  const material = new THREE.MeshStandardMaterial({
    color, roughness: 0.9, metalness: 0.1,
  });

  const asteroids = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const inclination = (Math.random() - 0.5) * 0.2;

    const asteroidLod = new THREE.LOD();
    const highMesh = new THREE.Mesh(geometryHi, material);
    highMesh.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * Math.sin(inclination),
      Math.sin(angle) * radius * Math.cos(inclination),
    );
    highMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    const scale = 0.5 + Math.random() * 1.5;
    highMesh.scale.set(scale, scale, scale);

    const lowMesh = new THREE.Mesh(geometryLo, material);
    Object.assign(lowMesh, Object.getOwnPropertyDescriptors(highMesh));

    asteroidLod.addLevel(highMesh, 0);
    asteroidLod.addLevel(lowMesh, 300);

    highMesh.userData.orbitalData = {
      radius, angle, inclination,
      speed: 0.0001 / Math.sqrt(radius / 100),
    };

    asteroidGroup.add(asteroidLod);
    asteroids.push(highMesh);
  }

  asteroidGroup.userData.asteroids = asteroids;
  return asteroidGroup;
}

export function updateAsteroidBelts(mainBelt, kuiperBelt, mult, paused) {
  if (paused) return;
  const asteroidSpeed = mult * 0.1;
  [mainBelt, kuiperBelt].forEach(belt => {
    if (belt.userData.asteroids) {
      belt.userData.asteroids.forEach(asteroid => {
        const data = asteroid.userData.orbitalData;
        if (data) {
          data.angle += data.speed * asteroidSpeed;
          asteroid.position.set(
            Math.cos(data.angle) * data.radius,
            Math.sin(data.angle) * data.radius * Math.sin(data.inclination),
            Math.sin(data.angle) * data.radius * Math.cos(data.inclination),
          );
        }
      });
    }
  });
}

export function createDustBelts(scene) {
  (function() {
    const N = 6000;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const ang = new Float32Array(N);
    const rad = new Float32Array(N);
    const spd = new Float32Array(N);
    const yy = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const r = (2.1 + Math.random() * 1.2) * AU;
      const a = Math.random() * Math.PI * 2;
      ang[i] = a; rad[i] = r;
      spd[i] = (6e-5 + Math.random() * 1e-4) * (Math.random() < 0.5 ? 1 : -1);
      yy[i] = (Math.random() - 0.5) * 14;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = yy[i];
      pos[i * 3 + 2] = Math.sin(a) * r;
      const w = Math.random() > 0.5;
      col[i * 3] = w ? 0.9 : (0.6 + Math.random() * 0.2);
      col[i * 3 + 1] = w ? 0.7 : (0.65 + Math.random() * 0.2);
      col[i * 3 + 2] = w ? 0.3 : (0.8 + Math.random() * 0.2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      size: 2.2, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.85,
    })));
    scene.userData.belt = { geo, ang, rad, spd, yy, N, pos };
  })();

  (function() {
    const N = 3500;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const ang = new Float32Array(N);
    const rad = new Float32Array(N);
    const spd = new Float32Array(N);
    const yy = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const r = (30 + Math.random() * 20) * AU;
      const a = Math.random() * Math.PI * 2;
      ang[i] = a; rad[i] = r;
      spd[i] = (5e-6 + Math.random() * 1e-5) * (Math.random() < 0.5 ? 1 : -1);
      yy[i] = (Math.random() - 0.5) * AU * 3;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = yy[i];
      pos[i * 3 + 2] = Math.sin(a) * r;
      col[i * 3] = 0.4 + Math.random() * 0.2;
      col[i * 3 + 1] = 0.6 + Math.random() * 0.2;
      col[i * 3 + 2] = 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      size: 1.8, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.55,
    })));
    scene.userData.kuiper = { geo, ang, rad, spd, yy, N, pos };
  })();
}

export function updateDustBelts(scene, dt, mult) {
  const belt = scene.userData.belt;
  if (belt) {
    for (let i = 0; i < belt.N; i++) {
      belt.ang[i] += belt.spd[i] * dt * mult;
      belt.pos[i * 3] = Math.cos(belt.ang[i]) * belt.rad[i];
      belt.pos[i * 3 + 1] = belt.yy[i];
      belt.pos[i * 3 + 2] = Math.sin(belt.ang[i]) * belt.rad[i];
    }
    belt.geo.attributes.position.needsUpdate = true;
  }
  const kuiper = scene.userData.kuiper;
  if (kuiper) {
    for (let i = 0; i < kuiper.N; i++) {
      kuiper.ang[i] += kuiper.spd[i] * dt * mult;
      kuiper.pos[i * 3] = Math.cos(kuiper.ang[i]) * kuiper.rad[i];
      kuiper.pos[i * 3 + 1] = kuiper.yy[i];
      kuiper.pos[i * 3 + 2] = Math.sin(kuiper.ang[i]) * kuiper.rad[i];
    }
    kuiper.geo.attributes.position.needsUpdate = true;
  }
}

export function buildAsteroidBody(def, aGroup, meshList, hitboxList, ui, allBodies, selectBody, getTimeOffset) {
  const pivot = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(def.color), roughness: 0.9, metalness: 0.1,
    emissive: new THREE.Color(def.color), emissiveIntensity: 0.15,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(def.radius, 16, 16), mat);
  mesh.userData.bodyKey = def.key;
  aGroup.add(pivot);
  pivot.add(mesh);
  meshList.push(mesh);

  const hitbox = new THREE.Mesh(new THREE.SphereGeometry(def.radius * 3, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
  hitbox.userData.bodyKey = def.key;
  pivot.add(hitbox);
  hitboxList.push(hitbox);

  const glow = makeGlow(def.radius, def.color);
  pivot.add(glow);

  let labelEl = null;
  if (ui.labelsLayer) {
    labelEl = document.createElement('div');
    labelEl.className = 'label';
    labelEl.textContent = def.label;
    labelEl.style.color = '#ccbbaa';
    labelEl.style.opacity = '0.75';
    labelEl.style.pointerEvents = 'auto';
    labelEl.style.cursor = 'pointer';
    const capturedDef = def;
    labelEl.addEventListener('click', () => {
      const b = allBodies.find(x => x.key === capturedDef.key);
      if (b) selectBody(b);
    });
    ui.labelsLayer.appendChild(labelEl);
  }

  const body = {
    ...def, pivot, mesh, glow, labelEl, visualR: def.radius, type: 'asteroid',
    getPos: T => {
      const el = ORBITAL_ELEMENTS[def.key];
      if (!el) return new THREE.Vector3();
      const a = el.a0 + el.a1 * T, e = el.e0 + el.e1 * T;
      const I = (el.I0 + el.I1 * T) * DEG, lp = el.p0 + el.p1 * T, ln = el.n0 + el.n1 * T;
      const w = (lp - ln) * DEG, O = ln * DEG;
      const ci = Math.cos(I), si = Math.sin(I), cO = Math.cos(O), sO = Math.sin(O), cw = Math.cos(w), sw = Math.sin(w);
      const offset = typeof getTimeOffset === 'function' ? getTimeOffset() : 0;
      const E = (Date.now() + offset) / (def.period * 1000 * 365.25 * 24 * 3600 * 1000) * Math.PI * 2;
      const xP = a * (Math.cos(E) - e), yP = a * (Math.sqrt(1 - e * e) * Math.sin(E));
      return new THREE.Vector3(
        ((cw * cO - sw * sO * ci) * xP + (-sw * cO - cw * sO * ci) * yP) * AU,
        ((sw * si) * xP + (cw * si) * yP) * AU,
        ((cw * sO + sw * cO * ci) * xP + (-sw * sO + cw * cO * ci) * yP) * AU,
      );
    },
  };
  allBodies.push(body);
  return body;
}
