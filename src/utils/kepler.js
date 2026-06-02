// src/utils/kepler.js
// ══════════════════════════════════════════════════════════════════
// FUNZIONI ORBITALI KEPLERIANE
// ══════════════════════════════════════════════════════════════════

import { DEG, AU } from './constants.js';

/**
 * Normalizza angolo tra -180 e 180 gradi
 */
export function wrapDeg180(d) {
  let x = d % 360;
  if (x > 180) x -= 360;
  if (x < -180) x += 360;
  return x;
}

/**
 * Risolve l'equazione di Kepler usando iterazione Newton-Raphson
 * M = E - e * sin(E)
 */
export function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 12; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

/**
 * Calcola posizione 3D di un corpo usando elementi orbitali
 * @param {string} name - Nome del corpo
 * @param {number} T - Tempo in secoli dall'epoca J2000
 * @param {object} elements - Elementi orbitali
 * @returns {THREE.Vector3} Posizione in unità Three.js
 */
export function keplerPos(name, T, elements) {
  const el = elements[name];
  if (!el) return new THREE.Vector3();

  const a = el.a0 + el.a1 * T;
  const e = el.e0 + el.e1 * T;
  const I = (el.I0 + el.I1 * T) * DEG;
  const L = el.L0 + el.L1 * T;
  const lp = el.p0 + el.p1 * T;
  const ln = el.n0 + el.n1 * T;

  const w = (lp - ln) * DEG;
  const O = ln * DEG;
  const Mv = wrapDeg180(L - lp) * DEG;

  const E = solveKepler(Mv, e);

  const xP = a * (Math.cos(E) - e);
  const yP = a * (Math.sqrt(1 - e * e) * Math.sin(E));

  const ci = Math.cos(I), si = Math.sin(I);
  const cO = Math.cos(O), sO = Math.sin(O);
  const cw = Math.cos(w), sw = Math.sin(w);

  return new THREE.Vector3(
    (cw * cO - sw * sO * ci) * xP + (-sw * cO - cw * sO * ci) * yP,
    (sw * si) * xP + (cw * si) * yP,
    (cw * sO + sw * cO * ci) * xP + (-sw * sO + cw * cO * ci) * yP
  ).multiplyScalar(AU);
}

/**
 * Calcola data Giuliana
 */
export function julianDate(d) {
  let Y = d.getUTCFullYear(), M = d.getUTCMonth() + 1;
  const D = d.getUTCDate() + (d.getUTCHours() + (d.getUTCMinutes() + (d.getUTCSeconds() + d.getUTCMilliseconds() / 1000) / 60) / 60) / 24;
  if (M <= 2) { Y--; M += 12; }
  const A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

/**
 * Calcola tempo T in secoli dall'epoca J2000
 */
export function currentT(date) {
  return (julianDate(date) - 2451545.0) / 36525.0;
}
