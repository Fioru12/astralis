import * as THREE from 'three';
import { AU } from '../utils/constants.js';
import { makeGlow } from '../utils/helpers.js';

export function createNearbyStars(NEARBY_STARS, pGroup, ui, allBodies, meshList, selectBody) {
  NEARBY_STARS.forEach(def => {
    const pivot = new THREE.Group();
    
    // Usa coordinate 3D reali se disponibili, altrimenti posizione casuale
    if (def.x !== undefined && def.y !== undefined && def.z !== undefined) {
      // Converti da anni luce a unità Three.js (1 anno luce ≈ 63241 AU)
      const lyToAU = 63241;
      pivot.position.set(
        def.x * lyToAU,
        def.y * lyToAU,
        def.z * lyToAU
      );
    } else {
      // Fallback a posizione casuale per compatibilità
      const angle = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      pivot.position.set(
        Math.cos(angle) * Math.cos(phi) * def.distAU,
        Math.sin(phi) * def.distAU,
        Math.sin(angle) * Math.cos(phi) * def.distAU,
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
        vec3 color = baseColor;
        float n = fbm(vUv * 15.0 + time * 0.05);
        color += vec3(n * 0.15);
        float edge = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        color += edge * 0.4;
        float pulse = sin(time * 0.002) * 0.05;
        color += edge * pulse;
        float tempFactor = (temperature - 3000.0) / 7000.0;
        color = mix(vec3(1.0, 0.3, 0.1), vec3(0.8, 0.9, 1.0), tempFactor);
        float atmosphere = smoothstep(0.0, 0.3, edge);
        color += atmosphere * 0.1;
        gl_FragColor = vec4(color, 0.9);
      }
    `;

    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(def.color) },
        temperature: { value: 5000.0 },
        time: { value: 0 },
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
      labelEl.style.pointerEvents = 'auto';
      labelEl.style.cursor = 'pointer';
      const capturedDef = def;
      labelEl.addEventListener('click', () => {
        const b = allBodies.find(x => x.key === capturedDef.key);
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
  const stars = allBodies.filter(b => b.type === 'star');
  const maxDistance = 150000;

  stars.forEach((star1, i) => {
    stars.forEach((star2, j) => {
      if (i >= j) return;
      const distance = star1.pivot.position.distanceTo(star2.pivot.position);
      if (distance < maxDistance) {
        const points = [star1.pivot.position.clone(), star2.pivot.position.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0x4488ff,
          transparent: true,
          opacity: 0.3,
        });
        const line = new THREE.Line(geometry, material);
        line.userData = { from: star1.key, to: star2.key, distance };
        hyperlaneGroup.add(line);
      }
    });
  });
}

export function createSpaceProbes(SPACE_PROBES, pGroup, ui, allBodies, selectBody) {
  SPACE_PROBES.forEach(def => {
    const pivot = new THREE.Group();
    const angle = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    // Fix: moltiplica per AU per convertire da AU a unità Three.js
    const distUnits = def.distAU * AU;
    pivot.position.set(
      Math.cos(angle) * Math.cos(phi) * distUnits,
      Math.sin(phi) * distUnits,
      Math.sin(angle) * Math.cos(phi) * distUnits,
    );

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(def.radius, 16, 16),
      new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.9 }),
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
      labelEl.style.pointerEvents = 'auto';
      labelEl.style.cursor = 'pointer';
      const capturedDef = def;
      labelEl.addEventListener('click', () => {
        const b = allBodies.find(x => x.key === capturedDef.key);
        if (b) selectBody(b);
      });
      ui.labelsLayer.appendChild(labelEl);
    }

    const body = { ...def, pivot, mesh, glow, labelEl, visualR: def.radius, type: 'probe' };
    allBodies.push(body);
  });
}

export function createExoplanets(EXOPLANETS, pGroup, ui, allBodies, selectBody, timeOffsetMsFn, meshList) {
  EXOPLANETS.forEach(def => {
    const parentStar = allBodies.find(b => b.key === def.parent);
    if (!parentStar) return;

    const pivot = new THREE.Group();
    pivot.position.copy(parentStar.pivot.position);
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
      void main() {
        float bands = sin(vUv.y * 20.0 + time * 0.001) * 0.1;
        vec3 color = baseColor + vec3(bands);
        float edge = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        color += edge * 0.2;
        gl_FragColor = vec4(color, 0.9);
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
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      void main() {
        float n = random(vUv * 50.0) * 0.1;
        vec3 color = baseColor + vec3(n);
        float edge = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        color += edge * 0.15;
        gl_FragColor = vec4(color, 0.9);
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

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(def.radius * 0.5, 16, 16), material);
    mesh.userData.bodyKey = def.key;
    mesh.userData.isGasGiant = isGasGiant;
    pivot.add(mesh);
    pGroup.add(pivot);

    const glow = makeGlow(def.radius * 1.5, def.color);
    glow.scale.set(0.5, 0.5, 0.5);
    pivot.add(glow);

    const orbitGeo = new THREE.RingGeometry(orbitRadius - 0.5, orbitRadius + 0.5, 64);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: def.color, side: THREE.DoubleSide, transparent: true, opacity: 0.3,
    });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 2;
    pivot.add(orbit);

    let labelEl = null;
    if (ui.labelsLayer) {
      labelEl = document.createElement('div');
      labelEl.className = 'label';
      labelEl.textContent = def.icon + ' ' + def.label;
      labelEl.style.opacity = '0.5';
      labelEl.style.fontSize = '11px';
      labelEl.style.pointerEvents = 'auto';
      labelEl.style.cursor = 'pointer';
      const capturedDef = def;
      labelEl.addEventListener('click', () => {
        const b = allBodies.find(x => x.key === capturedDef.key);
        if (b) selectBody(b);
      });
      ui.labelsLayer.appendChild(labelEl);
    }

    const getPos = () => {
      const ms = Date.now() + (typeof timeOffsetMsFn === 'function' ? timeOffsetMsFn() : 0);
      const periodMs = parseFloat(def.period) * 24 * 60 * 60 * 1000;
      const angle = ((ms / periodMs) * Math.PI * 2) % (Math.PI * 2);
      return parentStar.pivot.position.clone().add(new THREE.Vector3(
        Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius,
      ));
    };

    const body = {
      ...def, pivot, mesh, glow, labelEl, visualR: def.radius * 0.5,
      type: 'exoplanet', getPos, orbitRadius,
    };
    allBodies.push(body);
  });
}

export function createLocalBubbleConnections(allBodies, localBubbleGroup) {
  const stars = allBodies.filter(b => b.type === 'star');
  const maxDistLY = 50; // Distanza massima per connessione nella Local Bubble (in anni luce)
  const lyToAU = 63241;
  const maxDistAU = maxDistLY * lyToAU;
  
  stars.forEach((star1, i) => {
    stars.forEach((star2, j) => {
      if (i >= j) return;
      const distance = star1.pivot.position.distanceTo(star2.pivot.position);
      if (distance < maxDistAU) {
        const points = [star1.pivot.position.clone(), star2.pivot.position.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Calculate distance in light-years for opacity
        const distLY = distance / lyToAU;
        const opacity = Math.max(0.1, 0.6 - (distLY / maxDistLY) * 0.4);
        
        const material = new THREE.LineBasicMaterial({
          color: 0x88ccff,
          transparent: true,
          opacity: opacity,
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
  const axisLength = 50 * lyToAU; // 50 light-years in AU
  
  // Create axes helper
  const axesHelper = new THREE.AxesHelper(axisLength);
  axesHelper.name = 'localBubbleAxes';
  localBubbleGroup.add(axesHelper);
  
  // Add scale markers (every 10 light-years)
  const markerInterval = 10 * lyToAU; // 10 light-years
  const markerCount = Math.floor(axisLength / markerInterval);
  
  for (let i = 1; i <= markerCount; i++) {
    const dist = i * markerInterval;
    const distLY = i * 10;
    
    // X-axis marker (red)
    const xMarker = new THREE.Mesh(
      new THREE.SphereGeometry(500, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 })
    );
    xMarker.position.set(dist, 0, 0);
    localBubbleGroup.add(xMarker);
    
    // Y-axis marker (green)
    const yMarker = new THREE.Mesh(
      new THREE.SphereGeometry(500, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 })
    );
    yMarker.position.set(0, dist, 0);
    localBubbleGroup.add(yMarker);
    
    // Z-axis marker (blue)
    const zMarker = new THREE.Mesh(
      new THREE.SphereGeometry(500, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 })
    );
    zMarker.position.set(0, 0, dist);
    localBubbleGroup.add(zMarker);
  }
  
  // Add origin marker (Sun position)
  const originMarker = new THREE.Mesh(
    new THREE.SphereGeometry(1000, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.8 })
  );
  originMarker.name = 'sunOrigin';
  localBubbleGroup.add(originMarker);
  
  // Add grid at origin for reference
  const gridHelper = new THREE.GridHelper(axisLength, 10, 0x444444, 0x222222);
  gridHelper.name = 'localBubbleGrid';
  localBubbleGroup.add(gridHelper);
}

export function createLocalBubbleDistanceLabels(allBodies, ui) {
  const stars = allBodies.filter(b => b.type === 'star');
  const lyToAU = 63241;
  
  stars.forEach(star => {
    if (!ui.labelsLayer) return;
    
    const distAU = star.pivot.position.length();
    const distLY = (distAU / lyToAU).toFixed(1);
    
    const labelEl = document.createElement('div');
    labelEl.className = 'label local-bubble-label';
    labelEl.style.fontSize = '10px';
    labelEl.style.color = '#88ccff';
    labelEl.style.opacity = '0';
    labelEl.style.transition = 'opacity 0.3s';
    labelEl.textContent = `${distLY} ly`;
    labelEl.dataset.starKey = star.key;
    
    ui.labelsLayer.appendChild(labelEl);
    star.distanceLabel = labelEl;
  });
}
