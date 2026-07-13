// src/core/starfield.js
// ══════════════════════════════════════════════════════════════════
// DYNAMIC STARFIELD - Milky Way background with parallax
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';

export function createStarfield(scene) {
  const starfieldGroup = new THREE.Group();
  starfieldGroup.name = 'starfield';

  // Layer 1: Distant stars (far background) — denso, con banda galattica
  const distantStars = createStarLayer(0.5, 9000, 0.35, 'distant', 0.55);
  starfieldGroup.add(distantStars);

  // Layer 2: Mid-distance stars
  const midStars = createStarLayer(1.0, 6000, 0.5, 'mid', 0.4);
  starfieldGroup.add(midStars);

  // Layer 3: Closer stars (faster parallax)
  const closeStars = createStarLayer(1.5, 3500, 0.7, 'close', 0.25);
  starfieldGroup.add(closeStars);

  // Milky Way glow (hidden by default in orbit mode, shown in galactic views)
  const milkyWay = createMilkyWay();
  milkyWay.userData.galaxyGlow = true; // Mark for conditional rendering
  milkyWay.visible = false; // Start hidden
  starfieldGroup.add(milkyWay);

  scene.add(starfieldGroup);
  return starfieldGroup;
}

export function setMilkyWayVisible(scene, visible) {
  const milkyWay = scene.getObjectByName('milkyway-glow');
  if (milkyWay) {
    // Show in galactic views, hide in orbit mode
    milkyWay.visible = visible;
    milkyWay.material.opacity = visible ? 0.25 : 0;
  }
}

function createStarLayer(parallaxFactor, starCount, size, layerName, bandBias = 0) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const sizes = [];

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    let phi;
    // Una frazione delle stelle è concentrata verso il piano galattico
    // (banda densa della Via Lattea, come nei dati GAIA)
    if (Math.random() < bandBias) {
      // Gaussiana attorno all'equatore (phi ≈ π/2)
      const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; // ~N(0,1) grezza
      phi = Math.PI / 2 + g * 0.28;
    } else {
      phi = Math.acos(2 * Math.random() - 1); // distribuzione uniforme sulla sfera
    }
    const r = 5000 + Math.random() * 10000;

    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );

    // Temperatura colore realistica: molte bianco-azzurre, alcune calde, poche rosse
    const t = Math.random();
    let cr, cg, cb;
    if (t < 0.55) { cr = 0.78; cg = 0.86; cb = 1.0; }        // bianco-azzurro (maggioranza)
    else if (t < 0.82) { cr = 1.0; cg = 1.0; cb = 0.96; }    // bianco
    else if (t < 0.95) { cr = 1.0; cg = 0.88; cb = 0.66; }   // giallo-arancio
    else { cr = 1.0; cg = 0.70; cb = 0.55; }                 // rossastra (rara)

    // Luminosità a legge di potenza: tantissime deboli, pochissime brillanti.
    // Applicata al colore perché PointsMaterial ignora l'attributo size.
    const brightness = Math.pow(Math.random(), 3.2);
    const intensity = 0.35 + brightness * 0.65;
    colors.push(cr * intensity, cg * intensity, cb * intensity);
    sizes.push(0.25 + brightness * 3.5);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(sizes), 1));

  const material = new THREE.PointsMaterial({
    size: size,
    sizeAttenuation: true,
    vertexColors: true,
    fog: false,
    transparent: true,
    opacity: 0.8,
  });

  const points = new THREE.Points(geometry, material);
  points.name = `starfield-${layerName}`;
  points.userData.parallaxFactor = parallaxFactor;

  return points;
}

function createMilkyWay() {
  // Create a semi-transparent plane with a radial gradient
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Create radial gradient
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 300);

  gradient.addColorStop(0, 'rgba(100, 80, 200, 0.15)');
  gradient.addColorStop(0.5, 'rgba(50, 40, 100, 0.08)');
  gradient.addColorStop(1, 'rgba(20, 20, 50, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add some noise
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] += Math.random() * 10;
    data[i + 1] += Math.random() * 8;
    data[i + 2] += Math.random() * 15;
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  const geometry = new THREE.SphereGeometry(4800, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    fog: false,
    side: THREE.BackSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'milkyway-glow';
  return mesh;
}

export function updateStarfieldParallax(starfieldGroup, camera) {
  starfieldGroup.children.forEach(child => {
    if (child.userData.parallaxFactor) {
      // Apply subtle parallax based on camera movement
      const factor = child.userData.parallaxFactor;
      child.position.copy(camera.position).multiplyScalar(factor * 0.05);
    }
  });
}
