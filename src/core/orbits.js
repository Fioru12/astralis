import * as THREE from 'three';
import { AU, DEG, SEG } from '../utils/constants.js';
import { ORBITAL_ELEMENTS, ORBIT_COLORS, PLANETS, ASTEROIDS } from '../data/celestialData.js';

// Create gradient color with fade effect
function createOrbitMaterial(color, isDwarf, isAst) {
  const baseOpacity = isDwarf ? 0.16 : isAst ? 0.2 : 0.28;

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

  oGroup.children.forEach((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  oGroup.clear();

  [...PLANETS, ...ASTEROIDS]
    .filter((b) => b.type !== 'moon')
    .forEach((b) => {
      const el = ORBITAL_ELEMENTS[b.key];
      if (!el) return;
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
      const pts = [];

      for (let i = 0; i <= SEG; i++) {
        const E = (i / SEG) * Math.PI * 2;
        const xP = a * (Math.cos(E) - e),
          yP = a * (Math.sqrt(1 - e * e) * Math.sin(E));
        pts.push(
          new THREE.Vector3(
            ((cw * cO - sw * sO * ci) * xP + (-sw * cO - cw * sO * ci) * yP) * AU,
            (sw * si * xP + cw * si * yP) * AU,
            ((cw * sO + sw * cO * ci) * xP + (-sw * sO + cw * cO * ci) * yP) * AU
          )
        );
      }

      const isDwarf = b.type === 'dwarf';
      const isAst = b.type === 'asteroid';
      const orbitColor = ORBIT_COLORS[b.key] || 0x666666;

      // Main clean orbit line
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        createOrbitMaterial(orbitColor, isDwarf, isAst)
      );
      line.name = `orbit-${b.key}`;
      oGroup.add(line);
    });
}
