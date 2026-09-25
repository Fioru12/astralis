/**
 * Gravity Sandbox - Simulatore fisico N-body semplificato
 * Permette di aggiungere corpi e vedere le orbite evolvere
 */
import * as THREE from 'three';
import { t } from '../i18n/index.js';

const G = 1; // costante gravitazionale normalizzata per il sandbox

export class GravitySandbox {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this.panel = null;
    this.bodies = [];
    this.running = true;
    this.dt = 0.016;
    this._tickHandler = null;
  }

  toggle() {
    this.isOpen ? this.hide() : this.show();
  }

  show() {
    if (this.panel) return;
    this._build();
    this._startSim();
    this.isOpen = true;
  }

  hide() {
    if (!this.panel) return;
    this.panel.style.opacity = '0';
    setTimeout(() => {
      this._clearAll();
      this.panel?.remove();
      this.panel = null;
      this._stopSim();
    }, 220);
    this.isOpen = false;
  }

  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'sandboxPanel';
    Object.assign(this.panel.style, {
      position: 'fixed',
      top: '60px',
      right: '20px',
      width: 'min(320px, 92vw)',
      padding: '18px',
      background: 'rgba(8, 10, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(91,196,207,0.25)',
      borderRadius: '18px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      color: '#e4eaf8',
      zIndex: '9960',
      opacity: '0',
      transition: 'opacity 0.25s ease',
    });

    this.panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <h2 style="margin:0;font-size:1.05rem;font-weight:800;color:#5bc4cf;">${t(
          'sandbox_title'
        )}</h2>
        <button id="sbClose" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16);
          color:rgba(228,234,248,0.7);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:12px;">X</button>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:10px;">
        <button id="sbAdd" style="flex:1;background:linear-gradient(135deg,#5bc4cf,#8be0ea);border:none;
          color:#000;padding:9px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;">+ ${t(
            'sandbox_add'
          )}</button>
        <button id="sbPause" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.16);
          color:#e4eaf8;padding:9px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;">⏸</button>
        <button id="sbClear" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.16);
          color:#e4eaf8;padding:9px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;">${t(
            'sandbox_clear'
          )}</button>
      </div>
      <div id="sbList" style="max-height:300px;overflow-y:auto;font-size:11.5px;color:rgba(228,234,248,0.7);">
        <div style="text-align:center;padding:18px 0;opacity:0.5;">${t('sandbox_empty')}</div>
      </div>
      <p style="font-size:10.5px;color:rgba(228,234,248,0.4);margin:10px 0 0;line-height:1.4;">
        ${t('sandbox_hint')}
      </p>
    `;

    document.body.appendChild(this.panel);
    this.panel.querySelector('#sbClose').onclick = () => this.hide();
    this.panel.querySelector('#sbAdd').onclick = () => this._addBody();
    this.panel.querySelector('#sbClear').onclick = () => this._clearAll();
    this.panel.querySelector('#sbPause').onclick = (e) => {
      this.running = !this.running;
      e.target.textContent = this.running ? '⏸' : '▶';
    };
  }

  _addBody() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 50;
    const mass = 0.5 + Math.random() * 2;
    const r = 0.5 + Math.random() * 1.2;
    const speed = Math.sqrt((G * 10) / dist) * (0.8 + Math.random() * 0.4);
    const body = {
      pos: new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist),
      vel: new THREE.Vector3(-Math.sin(angle) * speed, 0, Math.cos(angle) * speed),
      mass,
      radius: r,
      mesh: null,
      trail: [],
    };
    const geom = new THREE.SphereGeometry(r, 12, 12);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
    });
    body.mesh = new THREE.Mesh(geom, mat);
    body.mesh.position.copy(body.pos);
    this.scene.add(body.mesh);
    this.bodies.push(body);
    this._updateList();
  }

  _clearAll() {
    this.bodies.forEach((b) => {
      this.scene.remove(b.mesh);
      b.mesh.geometry.dispose();
      b.mesh.material.dispose();
    });
    this.bodies = [];
    this._updateList();
  }

  _updateList() {
    const el = this.panel.querySelector('#sbList');
    if (this.bodies.length === 0) {
      el.innerHTML = `<div style="text-align:center;padding:18px 0;opacity:0.5;">${t(
        'sandbox_empty'
      )}</div>`;
      return;
    }
    el.innerHTML = this.bodies
      .map(
        (b, i) =>
          `<div style="padding:6px 8px;background:rgba(255,255,255,0.04);border-radius:6px;margin-bottom:4px;display:flex;justify-content:space-between;">
        <span>${t('sandbox_body')} ${i + 1}</span>
        <span style="opacity:0.6;">m=${b.mass.toFixed(2)}</span>
      </div>`
      )
      .join('');
  }

  _startSim() {
    const tick = () => {
      if (this.running && this.bodies.length > 0) this._step();
      this._tickHandler = requestAnimationFrame(tick);
    };
    tick();
  }

  _stopSim() {
    if (this._tickHandler) cancelAnimationFrame(this._tickHandler);
  }

  _step() {
    // Calcola forze gravitazionali
    const forces = this.bodies.map(() => new THREE.Vector3());
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const a = this.bodies[i],
          b = this.bodies[j];
        const dir = new THREE.Vector3().subVectors(b.pos, a.pos);
        const distSq = dir.lengthSq() + 0.5; // softening
        const f = (G * a.mass * b.mass) / distSq;
        const fv = dir.normalize().multiplyScalar(f);
        forces[i].add(fv);
        forces[j].sub(fv);
      }
    }
    // Integrazione (Eulero semi-implicito)
    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      const acc = forces[i].divideScalar(b.mass);
      b.vel.addScaledVector(acc, this.dt);
      b.pos.addScaledVector(b.vel, this.dt);
      b.mesh.position.copy(b.pos);
    }
  }
}
