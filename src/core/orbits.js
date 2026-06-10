import * as THREE from 'three';
import { AU, DEG, SEG } from '../utils/constants.js';
import { ORBITAL_ELEMENTS, ORBIT_COLORS, PLANETS, ASTEROIDS } from '../data/celestialData.js';

// Create gradient texture for orbit glow
function createOrbitGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 1);
  return new THREE.CanvasTexture(canvas);
}

// Create gradient color with fade effect
function createOrbitMaterial(color, isDwarf, isAst, timeOffset = 0) {
  const baseOpacity = isDwarf ? 0.16 : isAst ? 0.20 : 0.28;

  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: baseOpacity,
    linewidth: 2,
    fog: false,
    // Add subtle animation via dashSize in the future
  });
}

export function rebuildOrbits(T, oGroup, lastOrbitTRef) {
  if (lastOrbitTRef.current !== null && Math.abs(T - lastOrbitTRef.current) < 0.01) return;
  lastOrbitTRef.current = T;

  oGroup.children.forEach(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  oGroup.clear();

  [...PLANETS, ...ASTEROIDS].filter(b => b.type !== 'moon').forEach((b, idx) => {
    const el = ORBITAL_ELEMENTS[b.key];
    if (!el) return;
    const a = el.a0 + el.a1 * T, e = el.e0 + el.e1 * T;
    const I = (el.I0 + el.I1 * T) * DEG, lp = el.p0 + el.p1 * T, ln = el.n0 + el.n1 * T;
    const w = (lp - ln) * DEG, O = ln * DEG;
    const ci = Math.cos(I), si = Math.sin(I), cO = Math.cos(O), sO = Math.sin(O), cw = Math.cos(w), sw = Math.sin(w);
    const pts = [];

    for (let i = 0; i <= SEG; i++) {
      const E = (i / SEG) * Math.PI * 2;
      const xP = a * (Math.cos(E) - e), yP = a * (Math.sqrt(1 - e * e) * Math.sin(E));
      pts.push(new THREE.Vector3(
        ((cw * cO - sw * sO * ci) * xP + (-sw * cO - cw * sO * ci) * yP) * AU,
        ((sw * si) * xP + (cw * si) * yP) * AU,
        ((cw * sO + sw * cO * ci) * xP + (-sw * sO + cw * cO * ci) * yP) * AU,
      ));
    }

    const isDwarf = b.type === 'dwarf';
    const isAst = b.type === 'asteroid';
    const orbitColor = ORBIT_COLORS[b.key] || 0x666666;

    // Main orbit line
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      createOrbitMaterial(orbitColor, isDwarf, isAst, idx * 0.1)
    );
    line.name = `orbit-${b.key}`;
    oGroup.add(line);

    // Add glow effect with slightly thicker, more transparent line
    const glowPts = pts.map(p => p.clone()); // Same points
    const glowOpacity = isDwarf ? 0.08 : isAst ? 0.10 : 0.14;
    const glowLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(glowPts),
      new THREE.LineBasicMaterial({
        color: orbitColor,
        transparent: true,
        opacity: glowOpacity,
        linewidth: 4,
        fog: false,
      })
    );
    glowLine.position.z += 0.001; // Slightly offset to avoid z-fighting
    oGroup.add(glowLine);
  });
}
