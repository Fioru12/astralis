// src/utils/helpers.js
// ══════════════════════════════════════════════════════════════════
// FUNZIONI DI UTILITÀ GENERALI (unificate da main.js)
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';

/**
 * Crea uno sprite Canvas per effetti (glow, atmosfera, aureole)
 * @param {Function} drawFn - (ctx, size) => void
 * @param {number} size - Dimensione canvas (px)
 * @param {number} scale - Scala dello sprite nel mondo 3D
 * @returns {THREE.Sprite}
 */
export function makeCanvasSprite(drawFn, size, scale) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  drawFn(c.getContext('2d'), size);
  const sp = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    })
  );
  sp.scale.set(scale, scale, 1);
  return sp;
}

/**
 * Crea glow per un corpo celeste
 * @param {number} radius - Raggio del corpo
 * @param {number|string} color - Colore hex
 * @returns {THREE.Sprite}
 */
export function makeGlow(radius, color) {
  const hex = new THREE.Color(color);
  const r = Math.round(hex.r * 255),
    g = Math.round(hex.g * 255),
    b = Math.round(hex.b * 255);
  return makeCanvasSprite(
    (ctx, s) => {
      const gr = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      gr.addColorStop(0, `rgba(${r},${g},${b},0.7)`);
      gr.addColorStop(0.35, `rgba(${r},${g},${b},0.25)`);
      gr.addColorStop(0.7, `rgba(${r},${g},${b},0.07)`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, s, s);
    },
    256,
    radius * 7
  );
}

/**
 * Crea tooltip DOM per hover
 */
export function createTooltip() {
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'display:none',
    'background:rgba(0,0,0,0.82)',
    'color:#fff',
    'padding:5px 12px',
    'border-radius:20px',
    'font-size:13px',
    'font-family:sans-serif',
    'border:1px solid rgba(255,255,255,0.2)',
    'backdrop-filter:blur(6px)',
    'z-index:200',
  ].join(';');
  document.body.appendChild(el);
  return el;
}

/**
 * Calcola data Giuliana
 */
export function julianDate(d) {
  let Y = d.getUTCFullYear(),
    M = d.getUTCMonth() + 1;
  const D =
    d.getUTCDate() +
    (d.getUTCHours() +
      (d.getUTCMinutes() + (d.getUTCSeconds() + d.getUTCMilliseconds() / 1000) / 60) / 60) /
      24;
  if (M <= 2) {
    Y--;
    M += 12;
  }
  const A = Math.floor(Y / 100),
    B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

/**
 * Calcola tempo T in secoli dall'epoca J2000
 */
export function currentT(date) {
  return (julianDate(date) - 2451545.0) / 36525.0;
}

/**
 * Formatta numero per display (es. 1.234.567)
 */
export function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
