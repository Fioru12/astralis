import * as THREE from 'three';
import { AU, DEG } from '../utils/constants.js';
import { makeGlow } from '../utils/helpers.js';
import { ORBITAL_ELEMENTS } from '../data/celestialData.js';
import { getProceduralPlanetTexture } from '../utils/proceduralTextures.js';

export function generateAsteroidBelt(innerRadius, outerRadius, count, color) {
  const geometry = new THREE.SphereGeometry(0.3, 6, 6);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.1 });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.castShadow = true;

  const dummy = new THREE.Object3D();
  const radii = new Float32Array(count);
  const angles = new Float32Array(count);
  const inclinations = new Float32Array(count);
  const speeds = new Float32Array(count);
  const scales = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const inclination = (Math.random() - 0.5) * 0.2;
    const scale = 0.5 + Math.random() * 1.5;

    radii[i] = radius;
    angles[i] = angle;
    inclinations[i] = inclination;
    speeds[i] = 0.0001 / Math.sqrt(radius / 100);
    scales[i] = scale;

    dummy.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * Math.sin(inclination),
      Math.sin(angle) * radius * Math.cos(inclination)
    );
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.userData.orbitalData = { radii, angles, inclinations, speeds, scales };
  return mesh;
}

export function updateAsteroidBelts(mainBelt, kuiperBelt, mult, paused) {
  if (paused) return;
  const asteroidSpeed = mult * 0.1;
  const dummy = new THREE.Object3D();
  [mainBelt, kuiperBelt].forEach((belt) => {
    if (!belt || !belt.userData?.orbitalData) return;
    const data = belt.userData.orbitalData;
    const count = data.angles.length;
    for (let i = 0; i < count; i++) {
      data.angles[i] += data.speeds[i] * asteroidSpeed;
      dummy.position.set(
        Math.cos(data.angles[i]) * data.radii[i],
        Math.sin(data.angles[i]) * data.radii[i] * Math.sin(data.inclinations[i]),
        Math.sin(data.angles[i]) * data.radii[i] * Math.cos(data.inclinations[i])
      );
      dummy.rotation.set(data.angles[i] * 0.5, data.angles[i] * 0.3, 0);
      dummy.scale.set(data.scales[i], data.scales[i], data.scales[i]);
      dummy.updateMatrix();
      belt.setMatrixAt(i, dummy.matrix);
    }
    belt.instanceMatrix.needsUpdate = true;
  });
}

export function createDustBelts(scene) {
  (function () {
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
      ang[i] = a;
      rad[i] = r;
      spd[i] = (6e-5 + Math.random() * 1e-4) * (Math.random() < 0.5 ? 1 : -1);
      yy[i] = (Math.random() - 0.5) * 14;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = yy[i];
      pos[i * 3 + 2] = Math.sin(a) * r;
      const w = Math.random() > 0.5;
      col[i * 3] = w ? 0.9 : 0.6 + Math.random() * 0.2;
      col[i * 3 + 1] = w ? 0.7 : 0.65 + Math.random() * 0.2;
      col[i * 3 + 2] = w ? 0.3 : 0.8 + Math.random() * 0.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const dust = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 2.2,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      })
    );
    dust.name = 'mainDustBelt';
    scene.add(dust);
    scene.userData.belt = { geo, ang, rad, spd, yy, N, pos };
  })();

  (function () {
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
      ang[i] = a;
      rad[i] = r;
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
    const dust = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 1.8,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
      })
    );
    dust.name = 'kuiperDustBelt';
    scene.add(dust);
    scene.userData.kuiper = { geo, ang, rad, spd, yy, N, pos };
  })();
}

export function createOortCloud(scene) {
  const N = 8000;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 2000 + Math.random() * 98000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
    pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
    pos[i * 3 + 2] = Math.cos(phi) * r;
    const brightness = 0.3 + Math.random() * 0.4;
    col[i * 3] = brightness * 0.7;
    col[i * 3 + 1] = brightness * 0.8;
    col[i * 3 + 2] = brightness;
    sizes[i] = 0.5 + Math.random() * 2.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const mat = new THREE.PointsMaterial({
    size: 3,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const cloud = new THREE.Points(geo, mat);
  cloud.name = 'oortCloud';
  scene.add(cloud);
  scene.userData.oort = { geo, N, pos, speed: 0.00005 };
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
  const oort = scene.userData.oort;
  if (oort) {
    for (let i = 0; i < oort.N; i++) {
      const idx = i * 3;
      const x = oort.pos[idx],
        y = oort.pos[idx + 1],
        z = oort.pos[idx + 2];
      const r = Math.sqrt(x * x + y * y + z * z);
      const theta = Math.atan2(z, x) + oort.speed * dt * mult;
      const phi = Math.acos(y / r);
      oort.pos[idx] = r * Math.sin(phi) * Math.cos(theta);
      oort.pos[idx + 1] = r * Math.cos(phi);
      oort.pos[idx + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    oort.geo.attributes.position.needsUpdate = true;
  }
}

export function buildAsteroidBody(
  def,
  aGroup,
  meshList,
  hitboxList,
  ui,
  allBodies,
  selectBody,
  getTimeOffset
) {
  const pivot = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.9,
    metalness: 0.1,
  });
  const procTex = getProceduralPlanetTexture({ key: def.key, type: 'asteroid', color: def.color });
  if (procTex) {
    mat.map = procTex;
    mat.needsUpdate = true;
  } else {
    mat.color = new THREE.Color(def.color);
    mat.emissive = new THREE.Color(def.color);
    mat.emissiveIntensity = 0.15;
  }
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(def.radius, 16, 16), mat);
  mesh.castShadow = true;
  mesh.userData.bodyKey = def.key;
  aGroup.add(pivot);
  pivot.add(mesh);
  meshList.push(mesh);

  const hitbox = new THREE.Mesh(
    new THREE.SphereGeometry(def.radius * 3, 8, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
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
      const b = allBodies.find((x) => x.key === capturedDef.key);
      if (b) selectBody(b);
    });
    ui.labelsLayer.appendChild(labelEl);
  }

  const body = {
    ...def,
    pivot,
    mesh,
    glow,
    labelEl,
    visualR: def.radius,
    type: 'asteroid',
    getPos: (T) => {
      const el = ORBITAL_ELEMENTS[def.key];
      if (!el) {
        // Never stack an incomplete catalogue entry at the origin/Sun.
        // A deterministic fallback keeps it explorable until full elements are added.
        const radius = Math.max((parseFloat(def.distAU) || 1) * AU, 80);
        const phase = [...def.key].reduce((sum, char) => sum + char.charCodeAt(0), 0) * 0.17;
        return new THREE.Vector3(
          Math.cos(phase) * radius,
          Math.sin(phase * 0.5) * radius * 0.08,
          Math.sin(phase) * radius
        );
      }
      const a = el.a0 + el.a1 * T,
        e = el.e0 + el.e1 * T;
      const I = (el.I0 + el.I1 * T) * DEG,
        lp = el.p0 + el.p1 * T,
        ln = el.n0 + el.n1 * T;
      const w = (lp - ln) * DEG,
        O = ln * DEG;
      const ci = Math.cos(I),
        si = Math.sin(I),
        cO = Math.cos(O),
        sO = Math.sin(O),
        cw = Math.cos(w),
        sw = Math.sin(w);
      const offset = typeof getTimeOffset === 'function' ? getTimeOffset() : 0;
      // `period` is presentation text (for example "3.6 anni"). Parse its
      // numeric value defensively so invalid data can never poison positions.
      const periodYears = Number(def.orbitalPeriodYears ?? parseFloat(def.period));
      if (!Number.isFinite(periodYears) || periodYears <= 0) return new THREE.Vector3();
      const E = ((Date.now() + offset) / (periodYears * 365.25 * 24 * 3600 * 1000)) * Math.PI * 2;
      const xP = a * (Math.cos(E) - e),
        yP = a * (Math.sqrt(1 - e * e) * Math.sin(E));
      return new THREE.Vector3(
        ((cw * cO - sw * sO * ci) * xP + (-sw * cO - cw * sO * ci) * yP) * AU,
        (sw * si * xP + cw * si * yP) * AU,
        ((cw * sO + sw * cO * ci) * xP + (-sw * sO + cw * cO * ci) * yP) * AU
      );
    },
  };
  allBodies.push(body);
  return body;
}
