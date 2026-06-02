/**
 * HUD - Data, FPS, corpo selezionato
 */
export class HUD {
  constructor() { this.el = null; this.fpsHistory = []; }
  init() {
    this.el = document.createElement('div');
    this.el.id = 'hud';
    Object.assign(this.el.style, {
      position: 'fixed', top: '16px', right: '20px',
      padding: '8px 12px', background: 'rgba(8, 10, 20, 0.7)',
      backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px', color: 'rgba(228,234,248,0.85)',
      fontFamily: 'ui-monospace, monospace', fontSize: '11px',
      zIndex: '50', display: 'flex', flexDirection: 'column', gap: '3px',
      pointerEvents: 'none', minWidth: '160px',
    });
    this.el.innerHTML = `<div><span style="color:#5bc4cf;">Data</span> <span id="hudDate">--</span></div>
      <div><span style="color:#5bc4cf;">Focus</span> <span id="hudBody">Libero</span></div>
      <div><span style="color:#5bc4cf;">FPS</span> <span id="hudFps">--</span></div>`;
    document.body.appendChild(this.el);
  }
  setDate(d) { const e = this.el?.querySelector('#hudDate'); if (e) e.textContent = d.toLocaleDateString('it-IT'); }
  setBody(n) { const e = this.el?.querySelector('#hudBody'); if (e) e.textContent = n || 'Libero'; }
  updateFPS(f) {
    this.fpsHistory.push(f);
    if (this.fpsHistory.length > 30) this.fpsHistory.shift();
    const avg = Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
    const e = this.el?.querySelector('#hudFps');
    if (e) {
      e.textContent = avg + ' FPS';
      e.style.color = avg >= 50 ? '#48c864' : avg >= 30 ? '#ffaa44' : '#ff6b6b';
    }
  }
}
