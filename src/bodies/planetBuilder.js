/**
 * planetBuilder — costruzione di pianeti, lune, asteroidi e fasce.
 * Estratto da main.js: stessa logica, lo stato condiviso (scene, gruppi,
 * array, UI) passa tramite `ctx`.
 *
 * ctx: {
 *   scene, ui, pGroup, aGroup,
 *   allBodies, meshList, hitboxList, lodList,
 *   selectBody(body), getTimeOffset(), getTimeOffsetMs()
 * }
 */
import * as THREE from 'three';
import { DEG } from '../utils/constants.js';
import { textureLoader as TL } from '../utils/textureLoader.js';
import { makeCanvasSprite, makeGlow } from '../utils/helpers.js';
import {
  getProceduralPlanetTexture,
  generateSaturnRingTexture,
} from '../utils/proceduralTextures.js';
import { keplerPos } from '../utils/kepler.js';
import {
  ORBITAL_ELEMENTS,
  PHYSICAL_DATA,
  PLANETS,
  MOONS,
  ASTEROIDS,
} from '../data/celestialData.js';
import { getBodyLabel } from '../data/celestialData.js';
import { getLang } from '../i18n/index.js';
import { buildAsteroidBody, generateAsteroidBelt } from './asteroidBelts.js';

function makePlanetMesh(radius, texPath, color, key, bodyType) {
  const procFallback = () => getProceduralPlanetTexture({ key, type: bodyType || 'planet', color });
  const segs = texPath ? 48 : 24;

  if (key === 'Earth') {
    const vertShader = `
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vPosition; varying vec3 vWorldNormal;
      void main() {
        vUv = uv; vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragShader = `
      uniform sampler2D dayTexture; uniform vec3 sunDirection; uniform float time;
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldNormal; varying vec3 vPosition;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        float a = hash(i); float b = hash(i + vec2(1.0,0.0));
        float c = hash(i + vec2(0.0,1.0)); float d = hash(i + vec2(1.0,1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      vec3 proceduralNight(vec2 uv) {
        float cityLights = 0.0;
        for (int i = 0; i < 5; i++) {
          float scale = float(i + 1) * 8.0;
          vec2 offset = vec2(float(i) * 0.17, float(i) * 0.13);
          cityLights += noise(uv * scale + offset) * 0.2;
        }
        float coast = noise(uv * 3.0 + 1.5);
        cityLights *= smoothstep(0.3, 0.7, coast);
        cityLights = clamp(cityLights, 0.0, 1.0);
        vec3 warm = vec3(1.0, 0.75, 0.35);
        vec3 cool = vec3(0.6, 0.8, 1.0);
        vec3 nightColor = mix(cool, warm, cityLights * 0.7 + 0.3);
        nightColor *= cityLights * 0.5 + 0.05;
        return nightColor;
      }
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 worldNormal = normalize(vWorldNormal);
        float ndotl = dot(worldNormal, normalize(sunDirection));
        float dayFactor = smoothstep(-0.15, 0.25, ndotl);
        vec3 dayColor = texture2D(dayTexture, vUv).rgb;
        vec3 nightColor = proceduralNight(vUv);
        vec3 viewDir = normalize(-vPosition);
        vec3 reflected = reflect(-normalize(sunDirection), worldNormal);
        float ocean = 1.0 - smoothstep(0.18, 0.33, max(dayColor.r, dayColor.g) - dayColor.b * 0.42);
        float specular = pow(max(0.0, dot(reflected, viewDir)), 72.0) * ocean * 0.75;
        vec3 specColor = vec3(0.72, 0.9, 1.0) * specular;
        vec3 finalColor = mix(nightColor, dayColor + specColor, dayFactor);
        float limb = pow(1.0 - max(0.0, dot(viewDir, worldNormal)), 4.0);
        finalColor += vec3(0.10, 0.34, 0.85) * limb * dayFactor * 0.45;
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: TL.load(texPath, procFallback) },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
        time: { value: 0 },
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
    });
    const highMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segs, segs), mat);
    highMesh.castShadow = true;
    const lowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(
        radius,
        Math.max(8, Math.floor(segs / 3)),
        Math.max(6, Math.floor(segs / 3))
      ),
      mat.clone()
    );
    const lod = new THREE.LOD();
    lod.addLevel(highMesh, 0);
    lod.addLevel(lowMesh, radius * 30);
    return { mesh: highMesh, lod, lodMeshes: [highMesh, lowMesh] };
  }

  const surfaceTuning = {
    Mercury: { roughness: 0.98 },
    Venus: { roughness: 0.9 },
    Mars: { roughness: 0.96 },
    Jupiter: { roughness: 0.55 },
    Saturn: { roughness: 0.62 },
    Uranus: { roughness: 0.48 },
    Neptune: { roughness: 0.5 },
  };
  const mat = new THREE.MeshStandardMaterial({
    roughness: surfaceTuning[key]?.roughness ?? 0.78,
    metalness: 0.0,
  });
  if (texPath) {
    mat.map = TL.load(texPath, procFallback);
  } else {
    const procTex = procFallback();
    if (procTex) {
      mat.map = procTex;
      mat.needsUpdate = true;
    } else {
      mat.color = new THREE.Color(color);
      mat.emissive = new THREE.Color(color);
      mat.emissiveIntensity = 0.15;
    }
  }

  const highMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segs, segs), mat);
  highMesh.castShadow = true;
  const lowMesh = new THREE.Mesh(
    new THREE.SphereGeometry(
      radius,
      Math.max(8, Math.floor(segs / 3)),
      Math.max(6, Math.floor(segs / 3))
    ),
    mat.clone()
  );
  const lod = new THREE.LOD();
  lod.addLevel(highMesh, 0);
  lod.addLevel(lowMesh, radius * 20);
  return { mesh: highMesh, lod, lodMeshes: [highMesh, lowMesh] };
}

function makeLabel(ctx, def, opacity) {
  if (!ctx.ui.labelsLayer) return null;
  const labelEl = document.createElement('div');
  labelEl.className = 'label';
  labelEl.textContent = getBodyLabel(def, getLang());
  if (opacity !== undefined) labelEl.style.opacity = String(opacity);
  labelEl.style.pointerEvents = 'auto';
  labelEl.style.cursor = 'pointer';
  ctx.ui.labelsLayer.appendChild(labelEl);
  return labelEl;
}

function buildPlanet(ctx, def) {
  const { pGroup, lodList, meshList, allBodies, selectBody } = ctx;
  const pivot = new THREE.Group();
  const tiltGroup = new THREE.Group();
  tiltGroup.rotation.z = (def.tilt || 0) * DEG;
  const pm = makePlanetMesh(def.radius, def.tex || null, def.color, def.key, def.type);
  const mesh = pm.mesh || pm;
  const lod = pm.lod || null;
  const lodMeshes = pm.lodMeshes || [mesh];
  lodMeshes.forEach((m) => {
    if (m) m.userData.bodyKey = def.key;
  });
  if (lod) {
    tiltGroup.add(lod);
    lodList.push(lod);
  } else tiltGroup.add(mesh);
  pivot.add(tiltGroup);
  pGroup.add(pivot);
  lodMeshes.forEach((m) => {
    if (m) meshList.push(m);
  });

  const glow = makeGlow(def.radius, def.color);
  pivot.add(glow);

  let atmosphere = null;
  if (def.hasAtmosphere) {
    atmosphere = makeCanvasSprite(
      (ctx2d, s) => {
        const g = ctx2d.createRadialGradient(s / 2, s / 2, s * 0.28, s / 2, s / 2, s / 2);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.65, 'rgba(50,120,255,0)');
        g.addColorStop(0.8, 'rgba(60,140,255,0.28)');
        g.addColorStop(0.9, 'rgba(80,160,255,0.18)');
        g.addColorStop(1, 'rgba(0,60,200,0)');
        ctx2d.fillStyle = g;
        ctx2d.fillRect(0, 0, s, s);
      },
      256,
      def.radius * 2.85
    );
    pivot.add(atmosphere);
  }

  if (def.key === 'Saturn') {
    const ri = def.radius * 1.4,
      ro = def.radius * 2.7;
    const rGeo = new THREE.RingGeometry(ri, ro, 256);
    const pos = rGeo.attributes.position,
      uv = rGeo.attributes.uv,
      v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      uv.setXY(i, (v3.length() - ri) / (ro - ri), 0);
    }
    const rt = TL.load(
      './assets/textures/optimized/2k_saturn_ring_alpha.webp',
      generateSaturnRingTexture
    );
    const ring = new THREE.Mesh(
      rGeo,
      new THREE.MeshBasicMaterial({
        map: rt,
        alphaMap: rt,
        color: 0xd4c070,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
      })
    );
    ring.castShadow = false;
    ring.receiveShadow = true;
    ring.rotation.x = Math.PI / 2;
    pivot.add(ring);
  }
  if (def.key === 'Uranus') {
    const ur = new THREE.Mesh(
      new THREE.RingGeometry(def.radius * 1.5, def.radius * 1.9, 64),
      new THREE.MeshBasicMaterial({
        color: 0x88eedd,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25,
      })
    );
    ur.rotation.x = Math.PI / 2;
    pivot.add(ur);
  }

  const labelEl = makeLabel(ctx, def, def.type === 'dwarf' ? 0.7 : undefined);

  const body = {
    ...def,
    ...(PHYSICAL_DATA[def.key] || {}),
    pivot,
    mesh,
    glow,
    atmosphereMesh: atmosphere,
    labelEl,
    visualR: def.radius,
    getPos: def.type === 'moon' ? null : (T) => keplerPos(def.key, T, ORBITAL_ELEMENTS),
  };
  if (labelEl) {
    labelEl.addEventListener('click', () => selectBody(body));
  }
  allBodies.push(body);
  return body;
}

function buildMoon(ctx, def) {
  const { meshList, lodList, allBodies, selectBody } = ctx;
  const parentFn = () => allBodies.find((b) => b.key === def.parent);
  const pivot = new THREE.Group();

  let mesh;
  if (def.key === 'Phobos' || def.key === 'Deimos') {
    const irregularGeometry = new THREE.DodecahedronGeometry(def.radius, 0);
    const positions = irregularGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i),
        y = positions.getY(i),
        z = positions.getZ(i);
      const noise = 0.8 + Math.random() * 0.4;
      positions.setXYZ(i, x * noise, y * noise, z * noise);
    }
    irregularGeometry.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0.1 });
    const procTex = getProceduralPlanetTexture({ key: def.key, type: 'moon', color: def.color });
    if (procTex) {
      mat.map = procTex;
      mat.needsUpdate = true;
    } else mat.color = new THREE.Color(def.color);
    mesh = new THREE.Mesh(irregularGeometry, mat);
    mesh.castShadow = true;
  } else {
    const pm = makePlanetMesh(def.radius, def.tex || null, def.color, def.key, def.type);
    mesh = pm.mesh || pm;
    const lodMeshes = pm.lodMeshes || [mesh];
    lodMeshes.forEach((m) => {
      if (m) m.userData.bodyKey = def.key;
    });
    if (pm.lod) {
      pivot.add(pm.lod);
      lodList.push(pm.lod);
    } else pivot.add(mesh);
    lodMeshes.forEach((m) => {
      if (m) meshList.push(m);
    });
  }

  const glow = makeGlow(def.radius, def.color);
  pivot.add(glow);

  const labelEl = makeLabel(ctx, def, 0.65);

  const body = {
    ...def,
    pivot,
    mesh,
    glow,
    labelEl,
    visualR: def.radius,
    getPos: () => {
      const pb = parentFn();
      if (!pb) return new THREE.Vector3();
      const ms = Date.now() + ctx.getTimeOffsetMs();
      const angle = ((ms / (def.period * 1000)) * Math.PI * 2) % (Math.PI * 2);
      const incl = (def.inclination || 5) * DEG;
      return pb.pivot.position
        .clone()
        .add(
          new THREE.Vector3(
            Math.cos(angle) * def.dist,
            Math.sin(angle) * def.dist * Math.sin(incl),
            Math.sin(angle) * def.dist * Math.cos(incl * 0.3)
          )
        );
    },
  };
  if (labelEl) {
    const capturedDef = def;
    labelEl.addEventListener('click', () => {
      const b = allBodies.find((x) => x.key === capturedDef.key);
      if (b) selectBody(b);
    });
  }
  allBodies.push(body);
  return body;
}

export function buildPlanetsAndMoons(ctx) {
  const { scene, aGroup, meshList, hitboxList, ui, allBodies, selectBody, getTimeOffset } = ctx;
  PLANETS.forEach((def) => buildPlanet(ctx, def));
  MOONS.forEach((def) => buildMoon(ctx, def));
  ASTEROIDS.forEach((def) =>
    buildAsteroidBody(def, aGroup, meshList, hitboxList, ui, allBodies, selectBody, getTimeOffset)
  );

  const mainBelt = generateAsteroidBelt(180, 280, 1000, 0x887766);
  mainBelt.userData.name = 'mainBelt';
  scene.add(mainBelt);
  const kuiperBelt = generateAsteroidBelt(350, 450, 3000, 0x776655);
  kuiperBelt.userData.name = 'kuiperBelt';
  scene.add(kuiperBelt);
  return { mainBelt, kuiperBelt };
}
