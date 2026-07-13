// src/ui/travelCalc.js
// ══════════════════════════════════════════════════════════════════
// TRAVEL CALC — tempi di viaggio interstellare relativistici
// Razzo a fotoni (antimateria) ad accelerazione propria costante,
// con fase di accelerazione + decelerazione (arrivo a riposo).
// Ispirato alla star map di Project Hail Mary / GAIA (valhovey).
// ══════════════════════════════════════════════════════════════════

// Costanti SI
const C = 299792458;          // m/s
const G0 = 9.80665;           // m/s²
const LY = 9.4607304725808e15; // m
const YR = 3.15576e7;         // s (anno giuliano)
const PAYLOAD_T = 1000;       // tonnellate di carico utile

/**
 * Calcola i parametri di un viaggio a distanza distLy con accelerazione
 * propria costante aG (in g), accelerando per metà e decelerando per metà.
 */
export function computeTrip(distLy, aG) {
  const a = aG * G0;
  const halfD = (distLy * LY) / 2;
  // Rapidità accumulata in una fase: φ = arccosh(a·d½/c² + 1)
  const phi = Math.acosh((a * halfD) / (C * C) + 1);

  const vPeak = C * Math.tanh(phi);          // velocità di picco (al giro di boa)
  const shipS = 2 * (C / a) * phi;           // tempo proprio (nave)
  const earthS = 2 * (C / a) * Math.sinh(phi); // tempo coordinato (Terra)

  // Razzo a fotoni: rapporto massa = e^(2φ) (accel + decel), tutto carburante = e^(2φ)-1
  const massRatioExtra = Math.exp(2 * phi) - 1;
  const payloadKg = PAYLOAD_T * 1000;
  const fuelKg = payloadKg * massRatioExtra;
  const energyJ = fuelKg * C * C;            // E = mc² del carburante

  return {
    distLy,
    aG,
    vPeakC: vPeak / C,
    shipYr: shipS / YR,
    earthYr: earthS / YR,
    fuelKg,
    energyJ,
  };
}

// — Formattatori —
function fmtYears(yr) {
  if (yr < 1) {
    const mo = Math.round(yr * 12);
    return `${mo} mo`;
  }
  if (yr < 20) {
    const whole = Math.floor(yr);
    const mo = Math.round((yr - whole) * 12);
    return mo > 0 ? `${whole} y ${mo} mo` : `${whole} y`;
  }
  return `${yr.toFixed(1)} yr`;
}

function fmtMass(kg) {
  const t = kg / 1000;                 // tonnellate
  if (t >= 1e9) return `${(t / 1e9).toFixed(2)} Gt`;
  if (t >= 1e6) return `${(t / 1e6).toFixed(2)} Mt`;
  if (t >= 1e3) return `${(t / 1e3).toFixed(2)} kt`;
  return `${t.toFixed(1)} t`;
}

function fmtEnergy(j) {
  if (j >= 1e24) return `${(j / 1e24).toFixed(2)} YJ`;
  if (j >= 1e21) return `${(j / 1e21).toFixed(2)} ZJ`;
  if (j >= 1e18) return `${(j / 1e18).toFixed(2)} EJ`;
  return `${(j / 1e15).toFixed(2)} PJ`;
}

class TravelCalc {
  constructor() {
    this.panel = null;
    this.distLy = 0;
    this.label = '';
    this.aG = 1.0;
  }

  _ensurePanel() {
    if (this.panel) return;
    const el = document.createElement('div');
    el.className = 'travel-calc';
    el.id = 'travelCalc';
    el.innerHTML = `
      <div class="tc-header">
        <h3 id="tcTitle">Travel Calc</h3>
        <button class="tc-close" id="tcClose" aria-label="Chiudi">✕</button>
      </div>
      <div class="tc-body">
        <div class="tc-rows" id="tcRows"></div>
        <div class="tc-drive">PAYLOAD 1,000 T · PHOTONIC DRIVE (V<sub>e</sub> = c)</div>
        <div class="tc-accel">
          <div class="tc-accel-head">
            <span>CONSTANT ACCEL</span><strong id="tcAccelVal">1.0 G</strong>
          </div>
          <input type="range" id="tcAccel" min="0.1" max="5" step="0.1" value="1.0">
          <div class="tc-accel-scale"><span>0.1</span><span>1</span><span>5</span></div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    this.panel = el;

    el.querySelector('#tcClose').onclick = () => this.close();
    const slider = el.querySelector('#tcAccel');
    slider.addEventListener('input', (e) => {
      this.aG = parseFloat(e.target.value);
      this._render();
    });
  }

  open(body) {
    // Distanza in anni luce: usa distLY se presente, altrimenti da distAU
    let distLy = body.distLY;
    if (!distLy && body.distAU) distLy = body.distAU / 63241.077;
    if (!distLy || distLy <= 0) return;

    this._ensurePanel();
    this.distLy = distLy;
    this.label = (body.icon ? body.icon + ' ' : '') + (body.label || body.key);
    this.panel.querySelector('#tcTitle').textContent = 'Travel → ' + (body.label || body.key);
    this._render();
    this.panel.classList.add('open');
  }

  _render() {
    const t = computeTrip(this.distLy, this.aG);
    const rows = [
      ['Distance', `${t.distLy.toFixed(2)} ly`],
      ['Ship time', fmtYears(t.shipYr)],
      ['Earth time', fmtYears(t.earthYr)],
      ['Peak V', `${t.vPeakC.toFixed(4)} c`],
      ['Fuel mass', fmtMass(t.fuelKg)],
      ['Energy', fmtEnergy(t.energyJ)],
    ];
    this.panel.querySelector('#tcRows').innerHTML = rows.map(
      ([k, v]) => `<div class="tc-row"><span>${k}</span><strong>${v}</strong></div>`
    ).join('');
    this.panel.querySelector('#tcAccelVal').textContent = `${this.aG.toFixed(1)} G`;
  }

  close() {
    if (this.panel) this.panel.classList.remove('open');
  }

  toggle(body) {
    if (this.panel && this.panel.classList.contains('open')) this.close();
    else if (body) this.open(body);
  }
}

export const travelCalc = new TravelCalc();
