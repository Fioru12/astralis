// src/ui/starSpectrum.js
// ══════════════════════════════════════════════════════════════════
// SPETTRO STELLARE — curva di corpo nero (legge di Planck) + dati fisici
// Ispirato al pannello "star facts" di gaia-mary (Project Hail Mary).
// ══════════════════════════════════════════════════════════════════

import { escapeHtml } from '../utils/sanitize.js';

// Radianza spettrale di corpo nero (legge di Planck), forma relativa.
function planck(lambdaNm, T) {
  const h = 6.626e-34,
    c = 2.998e8,
    k = 1.381e-23;
  const lambda = lambdaNm * 1e-9;
  const x = (h * c) / (lambda * k * T);
  return 1.0 / (Math.pow(lambda, 5) * (Math.exp(x) - 1));
}

// Lunghezza d'onda (nm) → RGB [0..1] (approssimazione di Bruton).
function wavelengthToRGB(nm) {
  let r = 0,
    g = 0,
    b = 0;
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else if (nm <= 780) {
    r = 1;
  }
  // Attenuazione ai bordi della sensibilità dell'occhio
  let f = 1;
  if (nm < 420) f = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm > 700) f = 0.3 + (0.7 * (780 - nm)) / 80;
  const gamma = 0.8;
  return [Math.pow(r * f, gamma), Math.pow(g * f, gamma), Math.pow(b * f, gamma)];
}

/**
 * Disegna la curva di corpo nero per una temperatura data.
 * @param {HTMLCanvasElement} canvas
 * @param {number} tempK - temperatura effettiva (K)
 * @param {boolean} showVisible - colora la banda visibile con lo spettro
 */
export function drawBlackbodyCurve(canvas, tempK, showVisible = true) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width,
    H = canvas.height;
  const padL = 28,
    padR = 8,
    padT = 6,
    padB = 16;
  const plotW = W - padL - padR,
    plotH = H - padT - padB;
  ctx.clearRect(0, 0, W, H);

  const LMIN = 300,
    LMAX = 1000; // nm campionati
  const N = plotW;
  const vals = [];
  let maxV = 0;
  for (let i = 0; i <= N; i++) {
    const lambda = LMIN + (LMAX - LMIN) * (i / N);
    const v = planck(lambda, tempK);
    vals.push(v);
    if (v > maxV) maxV = v;
  }

  const xFor = (i) => padL + (i / N) * plotW;
  const yFor = (v) => padT + plotH - (v / maxV) * plotH;

  // Riempimento colonna per colonna
  for (let i = 0; i <= N; i++) {
    const lambda = LMIN + (LMAX - LMIN) * (i / N);
    const x = xFor(i);
    const yTop = yFor(vals[i]);
    let col;
    if (showVisible && lambda >= 380 && lambda <= 780) {
      const [r, g, b] = wavelengthToRGB(lambda);
      col = `rgba(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0},0.85)`;
    } else {
      col = 'rgba(93,118,137,0.28)'; // fuori dal visibile: grigio-blu tenue
    }
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, padT + plotH);
    ctx.lineTo(x, yTop);
    ctx.stroke();
  }

  // Inviluppo della curva
  ctx.strokeStyle = 'rgba(207,227,240,0.9)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const x = xFor(i),
      y = yFor(vals[i]);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Assi
  ctx.strokeStyle = 'rgba(93,118,137,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT + plotH);
  ctx.lineTo(padL + plotW, padT + plotH);
  ctx.stroke();

  // Tacche banda visibile (400..700 nm)
  ctx.fillStyle = 'rgba(93,118,137,0.9)';
  ctx.font = '8px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'center';
  for (let l = 400; l <= 700; l += 50) {
    const i = ((l - LMIN) / (LMAX - LMIN)) * N;
    const x = xFor(i);
    ctx.fillRect(x, padT + plotH, 1, 3);
    ctx.fillText(String(l), x, padT + plotH + 12);
  }
  ctx.textAlign = 'left';
  ctx.fillText('λ (nm)', padL + plotW - 30, padT + 8);
}

/**
 * Costruisce le righe HTML con i dati fisici della stella.
 * @param {object} s - record da STELLAR_DATA
 */
export function stellarInfoRows(s) {
  const cell = (label, value) =>
    `<div class="star-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(
      value
    )}</strong></div>`;
  return `
    <div class="star-evo">
      <span>EVOLUTION</span><strong>${escapeHtml(s.evo)}</strong>
    </div>
    <div class="star-stats">
      ${cell('App. Mag', s.mag.toFixed(2))}
      ${cell('Class', s.cls)}
      ${cell('Mass', s.m + ' M☉')}
      ${cell('Radius', s.r + ' R☉')}
      ${cell('Temp', s.t + ' K')}
      ${cell('Age', s.age + ' Gyr')}
    </div>`;
}
