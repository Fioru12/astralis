import * as THREE from 'three';
import { AU } from '../utils/constants.js';
import { makeGlow } from '../utils/helpers.js';

export function createNearbyStars(NEARBY_STARS, pGroup, ui, allBodies, meshList, selectBody) {
  NEARBY_STARS.forEach((def) => {
    const pivot = new THREE.Group();

    // Usa coordinate 3D reali se disponibili, altrimenti posizione casuale
    if (def.x !== undefined && def.y !== undefined && def.z !== undefined) {
      // Converti da anni luce a unità Three.js (1 anno luce ≈ 63241 AU)
      const lyToAU = 63241;
      pivot.position.set(def.x * lyToAU, def.y * lyToAU, def.z * lyToAU);
    } else {
      // Fallback a posizione casuale per compatibilità
      const angle = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      pivot.position.set(
        Math.cos(angle) * Math.cos(phi) * def.distAU,
        Math.sin(phi) * def.distAU,
        Math.sin(angle) * Math.cos(phi) * def.distAU
      );
    }

    const starVertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const starFragmentShader = `
      uniform vec3 baseColor;
      uniform float temperature;
      uniform float time;
      uniform float starType;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(st * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(-vPosition);
        float rim = 1.0 - max(dot(normal, viewDir), 0.0);
        float tempFactor = (temperature - 3000.0) / 7000.0;

        vec3 coolColor = mix(vec3(1.0, 0.8, 0.4), vec3(1.0, 0.3, 0.1), 1.0 - tempFactor);
        vec3 hotColor = mix(vec3(0.9, 0.95, 1.0), vec3(0.6, 0.7, 1.0), tempFactor);
        vec3 starColor = mix(coolColor, hotColor, tempFactor);

        float n1 = fbm(vUv * 12.0 + time * 0.03);
        float n2 = fbm(vUv * 25.0 - time * 0.07 + 10.0);
        float granulation = n1 * 0.2 + n2 * 0.1;
        float spot = fbm(vUv * 8.0 + 5.0) * 0.15;
        vec3 surfaceColor = starColor * (0.7 + granulation + spot);

        float corona = pow(rim, 2.5) * (0.8 + 0.2 * sin(time * 0.003 + vUv.x * 20.0));
        float tempGlow = 0.3 + tempFactor * 0.4;
        vec3 coronaColor = mix(vec3(1.0, 0.6, 0.2), vec3(0.6, 0.7, 1.0), tempFactor) * corona * tempGlow;

        float pulse = 0.95 + 0.05 * sin(time * 0.001 + fbm(vUv * 30.0 + 20.0) * 6.28);
        vec3 finalColor = surfaceColor * pulse + coronaColor;

        float alpha = 0.85 + corona * 0.15;
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const r = (def.color >> 16) & 0xff,
      b = def.color & 0xff;
    const estTemp = 3000 + (b / Math.max(r, 1)) * 5000;
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(def.color) },
        temperature: { value: estTemp },
        time: { value: 0 },
        starType: { value: 0.0 },
      },
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
    });

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(def.radius, 32, 32), starMaterial);
    mesh.userData.bodyKey = def.key;
    pivot.add(mesh);
    pGroup.add(pivot);

    const glow = makeGlow(def.radius * 8, def.color);
    pivot.add(glow);

    const ringGeo = new THREE.RingGeometry(def.radius * 10, def.radius * 11, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: getStarTypeColor(def),
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    pivot.add(ring);

    let labelEl = null;
    if (ui.labelsLayer) {
      labelEl = document.createElement('div');
      labelEl.className = 'label';
      labelEl.textContent = def.icon + ' ' + def.label;
      labelEl.dataset.iconPrefix = (def.icon || '') + ' ';
      labelEl.style.pointerEvents = 'auto';
      labelEl.style.cursor = 'pointer';
      const capturedDef = def;
      labelEl.addEventListener('click', () => {
        const b = allBodies.find((x) => x.key === capturedDef.key);
        if (b) selectBody(b);
      });
      ui.labelsLayer.appendChild(labelEl);
    }

    const body = { ...def, pivot, mesh, glow, labelEl, visualR: def.radius, type: 'star' };
    allBodies.push(body);

    mesh.userData.isStar = true;
    mesh.userData.starKey = def.key;
  });
}

function getStarTypeColor(def) {
  if (def.key === 'Sun') return 0xffff00;
  if (def.key.includes('Alpha')) return 0xffaa00;
  if (def.key.includes('Proxima')) return 0xff6644;
  if (def.key.includes('Barnard')) return 0xff8866;
  if (def.key.includes('Sirius')) return 0xaaccff;
  if (def.key.includes('TRAPPIST')) return 0xff5533;
  if (def.key.includes('Kepler')) return 0xffaa66;
  if (def.key.includes('Gliese')) return 0xff6644;
  if (def.key.includes('Ross')) return 0xff7766;
  if (def.key.includes('Teegarden')) return 0xff6644;
  if (def.key.includes('Luyten')) return 0xff8866;
  return def.color || 0xffffff;
}

export function createHyperlanes(allBodies, hyperlaneGroup) {
  hyperlaneGroup.clear();
  const stars = allBodies.filter((b) => b.type === 'star' && b.pivot);
  if (!stars.length) return;

  const connectedPairs = new Set();
  const linePositions = [];
  const maxDistance = 70000;
  const maxNeighborsPerStar = 2;

  stars.forEach((star1) => {
    // Find closest neighbors for star1
    const neighbors = stars
      .filter((star2) => star2.key !== star1.key)
      .map((star2) => ({
        star: star2,
        dist: star1.pivot.position.distanceTo(star2.pivot.position),
      }))
      .filter((n) => n.dist <= maxDistance)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, maxNeighborsPerStar);

    neighbors.forEach(({ star: star2 }) => {
      const pairKey = [star1.key, star2.key].sort().join('--');
      if (!connectedPairs.has(pairKey)) {
        connectedPairs.add(pairKey);
        const p1 = star1.pivot.position;
        const p2 = star2.pivot.position;
        linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    });
  });

  if (!linePositions.length) return;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0x5bc4cf,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(geometry, material);
  lines.name = 'hyperlaneSegments';
  hyperlaneGroup.add(lines);
}

export function createSpaceProbes(SPACE_PROBES, pGroup, ui, allBodies, selectBody) {
  SPACE_PROBES.forEach((def) => {
    const pivot = new THREE.Group();
    const angle = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    // Fix: moltiplica per AU per convertire da AU a unità Three.js
    const distUnits = def.distAU * AU;
    pivot.position.set(
      Math.cos(angle) * Math.cos(phi) * distUnits,
      Math.sin(phi) * distUnits,
      Math.sin(angle) * Math.cos(phi) * distUnits
    );

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(def.radius, 16, 16),
      new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.9 })
    );
    mesh.userData.bodyKey = def.key;
    pivot.add(mesh);
    pGroup.add(pivot);

    const glow = makeGlow(def.radius * 4, def.color);
    pivot.add(glow);

    let labelEl = null;
    if (ui.labelsLayer) {
      labelEl = document.createElement('div');
      labelEl.className = 'label';
      labelEl.textContent = def.icon + ' ' + def.label;
      labelEl.dataset.iconPrefix = (def.icon || '') + ' ';
      labelEl.style.pointerEvents = 'auto';
      labelEl.style.cursor = 'pointer';
      const capturedDef = def;
      labelEl.addEventListener('click', () => {
        const b = allBodies.find((x) => x.key === capturedDef.key);
        if (b) selectBody(b);
      });
      ui.labelsLayer.appendChild(labelEl);
    }

    const body = { ...def, pivot, mesh, glow, labelEl, visualR: def.radius, type: 'probe' };
    allBodies.push(body);
  });
}

export function createExoplanets(
  EXOPLANETS,
  pGroup,
  ui,
  allBodies,
  meshList,
  selectBody,
  timeOffsetMsFn
) {
  EXOPLANETS.forEach((def) => {
    const parentStar = allBodies.find((b) => b.key === def.parent);
    if (!parentStar) return;

    const systemGroup = new THREE.Group();
    systemGroup.position.copy(parentStar.pivot.position);
    pGroup.add(systemGroup);
    const pivot = new THREE.Group();
    // Fix: usa Math.max per garantire che il pianeta sia sempre FUORI dalla stella
    // Il pianeta deve essere almeno a 3x il raggio della stella
    const minOrbitRadius = parentStar.radius * 3.5;
    const orbitRadius = Math.max(def.distAU * AU * 2, minOrbitRadius);
    const isGasGiant = def.radius > 2.0;

    const gasGiantVertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const gasGiantFragmentShader = `
      uniform vec3 baseColor;
      uniform float time;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        // Strisce atmosferiche animate
        float bands = sin(vUv.y * 30.0 + time * 0.0005) * 0.15;
        bands += sin(vUv.y * 50.0 - time * 0.0003) * 0.08;

        // Turbolenza atmosferica
        float turb = noise(vUv * 10.0 + vec2(time * 0.001)) * 0.1;

        vec3 color = baseColor + vec3(bands + turb);

        // Limb darkening (bordi scuri)
        float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
        color *= 1.0 - rim * 0.3;

        // Edge glow (alone al bordo)
        float edge = pow(max(0.0, dot(vNormal, normalize(vPosition))), 3.0);
        color += baseColor * edge * 0.3;

        gl_FragColor = vec4(color, 0.95);
      }
    `;

    const rockyVertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const rockyFragmentShader = `
      uniform vec3 baseColor;
      uniform float time;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5 * fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
        f += 0.25 * fract(sin(dot(p * 2.01, vec2(269.5, 183.3))) * 43758.5);
        f += 0.125 * fract(sin(dot(p * 4.01, vec2(456.2, 234.1))) * 43758.5);
        return f;
      }

      void main() {
        // Texture di superficie con crateri
        float surface = fbm(vUv * 20.0) * 0.2;
        surface += fbm(vUv * 50.0 + time * 0.0001) * 0.1;

        vec3 color = baseColor * (0.9 + surface);

        // Limb darkening (ombre ai bordi)
        float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
        color *= 1.0 - rim * 0.4;

        // Specular highlight (riflessi)
        float spec = pow(max(0.0, dot(normalize(vPosition), vNormal)), 10.0);
        color += vec3(spec) * 0.2;

        gl_FragColor = vec4(color, 0.92);
      }
    `;

    let material;
    if (isGasGiant) {
      material = new THREE.ShaderMaterial({
        uniforms: { baseColor: { value: new THREE.Color(def.color) }, time: { value: 0 } },
        vertexShader: gasGiantVertexShader,
        fragmentShader: gasGiantFragmentShader,
        transparent: true,
      });
    } else {
      material = new THREE.ShaderMaterial({
        uniforms: { baseColor: { value: new THREE.Color(def.color) }, time: { value: 0 } },
        vertexShader: rockyVertexShader,
        fragmentShader: rockyFragmentShader,
        transparent: true,
      });
    }

    // Scale planets appropriately - larger for better visibility
    const planetScale = 0.9; // Increased from 0.5 to 0.9
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(def.radius * planetScale, 32, 32),
      material
    );
    mesh.userData.bodyKey = def.key;
    mesh.userData.isGasGiant = isGasGiant;
    pivot.add(mesh);
    systemGroup.add(pivot);
    meshList.push(mesh);

    // Add rings to large gas giants only
    if (isGasGiant && def.radius > 3.0 && def.hasRings) {
      // Rings are proportional to planet size and much more subtle
      const ringInner = def.radius * planetScale * 1.2;
      const ringOuter = def.radius * planetScale * 1.6;
      const ringGeo = new THREE.RingGeometry(ringInner, ringOuter, 64);

      // More realistic ring colors (greyish with slight tint)
      const ringColor = new THREE.Color(def.color)
        .multiplyScalar(0.4)
        .lerp(new THREE.Color(0xcccccc), 0.5);

      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35, // More subtle
        depthWrite: false,
      });
      const rings = new THREE.Mesh(ringGeo, ringMat);
      rings.rotation.x = ((def.ringTilt || 0) * Math.PI) / 180;
      pivot.add(rings);
    }

    const glow = makeGlow(def.radius * 1.5, def.color);
    pivot.add(glow);

    // Add atmospheric glow for habitable/ocean planets (bluish planets)
    let atmosphere = null;
    const c = new THREE.Color(def.color);
    const isBluish = !isGasGiant && c.b > 0.5 && c.b > c.r;
    if (isBluish) {
      const atmosphereGeo = new THREE.SphereGeometry(def.radius * planetScale * 1.06, 24, 24);
      const atmosphereMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(def.color).multiplyScalar(1.5),
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      });
      atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
      pivot.add(atmosphere);
    }

    // Create orbit line instead of ring - more accurate and visible
    const orbitPoints = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      orbitPoints.push(
        new THREE.Vector3(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius)
      );
    }
    const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitLineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(def.color).multiplyScalar(0.7),
      transparent: true,
      opacity: 0.5,
      linewidth: 1,
      fog: false,
    });
    const orbitLine = new THREE.Line(orbitLineGeo, orbitLineMat);
    systemGroup.add(orbitLine);

    let labelEl = null;
    if (ui.labelsLayer) {
      labelEl = document.createElement('div');
      labelEl.className = 'label';
      labelEl.textContent = def.icon + ' ' + def.label;
      labelEl.dataset.iconPrefix = (def.icon || '') + ' ';
      labelEl.style.opacity = '0.5';
      labelEl.style.fontSize = '11px';
      labelEl.style.pointerEvents = 'auto';
      labelEl.style.cursor = 'pointer';
      const capturedDef = def;
      labelEl.addEventListener('click', () => {
        const b = allBodies.find((x) => x.key === capturedDef.key);
        if (b) selectBody(b);
      });
      ui.labelsLayer.appendChild(labelEl);
    }

    const phase = [...def.key].reduce((sum, char) => sum + char.charCodeAt(0), 0) * 0.173;
    const updatePos = () => {
      const ms = Date.now() + (typeof timeOffsetMsFn === 'function' ? timeOffsetMsFn() : 0);
      const periodDays = def.periodDays ?? (parseFloat(def.period) || 30);
      const periodMs = periodDays * 24 * 60 * 60 * 1000;
      const angle = ((ms / periodMs) * Math.PI * 2 + phase) % (Math.PI * 2);
      pivot.position.set(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius);
    };
    updatePos();

    const getPos = () => {
      return parentStar.pivot.position.clone().add(pivot.position);
    };

    const body = {
      ...def,
      pivot,
      mesh,
      glow,
      atmosphereMesh: atmosphere,
      labelEl,
      visualR: def.radius * planetScale,
      type: 'exoplanet',
      hostLabel: parentStar.label,
      distLY: parentStar.distLY,
      getPos,
      updatePos,
      orbitRadius,
      orbitLine,
      systemGroup,
    };
    allBodies.push(body);
  });
}

export function createLocalBubbleConnections(allBodies, localBubbleGroup) {
  const stars = allBodies.filter((b) => b.type === 'star');
  const lyToAU = 63241;
  const solPos = new THREE.Vector3(0, 0, 0);

  // 1. Draw elegant radial vectors from Sol to each star with drop stem lines to reference plane
  stars.forEach((star) => {
    if (star.key === 'sun') return;
    const starPos = star.pivot.position;
    const distance = solPos.distanceTo(starPos);
    const distLY = distance / lyToAU;

    // Radial vector from Sol to Star
    const points = [solPos.clone(), starPos.clone()];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const opacity = Math.max(0.18, 0.45 - (distLY / 50) * 0.25);
    const material = new THREE.LineDashedMaterial({
      color: 0x5bc4cf,
      transparent: true,
      opacity: opacity,
      dashSize: 25000,
      gapSize: 12000,
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    line.userData = { from: 'sun', to: star.key, distance, distLY };
    localBubbleGroup.add(line);

    // Stem line perpendicular to galactic equatorial reference plane (Y=0)
    const planePoint = new THREE.Vector3(starPos.x, 0, starPos.z);
    const stemGeom = new THREE.BufferGeometry().setFromPoints([starPos.clone(), planePoint]);
    const stemMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.22,
    });
    const stemLine = new THREE.Line(stemGeom, stemMat);
    localBubbleGroup.add(stemLine);
  });

  // 2. Connect ONLY immediate nearest stellar neighbors (< 12 Light Years) to prevent clutter
  stars.forEach((star1, i) => {
    stars.forEach((star2, j) => {
      if (i >= j) return;
      if (star1.key === 'sun' || star2.key === 'sun') return;
      const distance = star1.pivot.position.distanceTo(star2.pivot.position);
      const distLY = distance / lyToAU;

      if (distLY < 12) {
        const points = [star1.pivot.position.clone(), star2.pivot.position.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0x88ccff,
          transparent: true,
          opacity: 0.18,
        });
        const line = new THREE.Line(geometry, material);
        line.userData = { from: star1.key, to: star2.key, distance, distLY };
        localBubbleGroup.add(line);
      }
    });
  });
}

export function createLocalBubbleAxes(localBubbleGroup) {
  const lyToAU = 63241;
  const bubbleRadiusLY = 35;
  const bubbleRadiusAU = bubbleRadiusLY * lyToAU;

  // 1. Visible 3D Translucent Plasma Sphere representing the Local Bubble cavity
  const sphereGeom = new THREE.SphereGeometry(bubbleRadiusAU, 32, 24);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x1e3a8a,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const bubbleMesh = new THREE.Mesh(sphereGeom, sphereMat);
  bubbleMesh.name = 'localBubbleMesh';
  localBubbleGroup.add(bubbleMesh);

  // 2. Glowing Wireframe Shell for 3D spatial depth perception
  const wireframeGeom = new THREE.SphereGeometry(bubbleRadiusAU * 1.001, 18, 12);
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0x5bc4cf,
    transparent: true,
    opacity: 0.22,
    wireframe: true,
    depthWrite: false,
  });
  const wireframeMesh = new THREE.Mesh(wireframeGeom, wireframeMat);
  wireframeMesh.name = 'localBubbleWireframe';
  localBubbleGroup.add(wireframeMesh);

  // 3. Concentric Equatorial Reference Distance Rings on Plane (10, 20, 30, 40 LY)
  const ringDistancesLY = [10, 20, 30, 40];
  ringDistancesLY.forEach((rLY) => {
    const rAU = rLY * lyToAU;
    const ringSegments = 64;
    const ringPoints = [];
    for (let i = 0; i <= ringSegments; i++) {
      const theta = (i / ringSegments) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(theta) * rAU, 0, Math.sin(theta) * rAU));
    }
    const ringGeom = new THREE.BufferGeometry().setFromPoints(ringPoints);
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.28,
    });
    const ringLine = new THREE.Line(ringGeom, ringMat);
    localBubbleGroup.add(ringLine);
  });

  // 4. Subtle Axes Helper at Origin
  const axisLength = 45 * lyToAU;
  const axesHelper = new THREE.AxesHelper(axisLength);
  axesHelper.name = 'localBubbleAxes';
  localBubbleGroup.add(axesHelper);

  // Sun Origin Marker
  const originMarker = new THREE.Mesh(
    new THREE.SphereGeometry(1500, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9 })
  );
  originMarker.name = 'sunOrigin';
  localBubbleGroup.add(originMarker);
}

export function createLocalBubbleDistanceLabels(allBodies, ui) {
  const stars = allBodies.filter((b) => b.type === 'star');
  const lyToAU = 63241;

  // Remove existing distance labels to prevent memory leak
  const existingLabels = ui.labelsLayer?.querySelectorAll('.local-bubble-label');
  existingLabels?.forEach((label) => label.remove());

  stars.forEach((star) => {
    if (!ui.labelsLayer) return;

    const distAU = star.pivot.position.length();
    const distLY = (distAU / lyToAU).toFixed(1);

    const labelEl = document.createElement('div');
    labelEl.className = 'label local-bubble-label';
    labelEl.style.fontSize = '10.5px';
    labelEl.style.color = '#5bc4cf';
    labelEl.style.background = 'rgba(8, 12, 24, 0.78)';
    labelEl.style.padding = '2px 7px';
    labelEl.style.borderRadius = '6px';
    labelEl.style.border = '1px solid rgba(91, 196, 207, 0.4)';
    labelEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.6)';
    labelEl.style.backdropFilter = 'blur(6px)';
    labelEl.style.opacity = '0';
    labelEl.style.transition = 'opacity 0.3s';
    labelEl.textContent = `${distLY} ly`;
    labelEl.dataset.starKey = star.key;

    ui.labelsLayer.appendChild(labelEl);
    star.distanceLabel = labelEl;
  });
}

export function cleanupLocalBubbleLabels(allBodies) {
  allBodies.forEach((star) => {
    if (star.distanceLabel) {
      star.distanceLabel.remove();
      star.distanceLabel = null;
    }
  });
}
