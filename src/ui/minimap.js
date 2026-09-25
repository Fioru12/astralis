/**
 * @file minimap.js
 * @description Universal Interactive Radar Minimap HUD for Astralis.
 * Renders real-time planetary orbits, planet blips, camera view cone, and galactic stars.
 */

export class Minimap {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('minimapContainer');
    this.canvas = options.canvas || document.getElementById('minimapCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.onSelectBody = options.onSelectBody || (() => {});
    this.onSelectStar = options.onSelectStar || (() => {});

    this.visible = true;
    this.collapsed = false;
    // Zoom levels in AU for planetary radar
    this.zoomLevels = [5, 12, 35, 70]; // Inner (5 AU), Mid (12 AU), Outer (35 AU), Kuiper (70 AU)
    this.zoomIndex = 2; // Default ~35 AU (all major planets)

    this._initDOM();
  }

  _initDOM() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="minimap-hud-header">
        <div class="minimap-title-wrap">
          <span class="minimap-radar-pulse"></span>
          <span class="minimap-title" id="minimapTitle">RADAR</span>
        </div>
        <div class="minimap-controls">
          <button class="minimap-btn" id="minimapZoomIn" title="Zoom Avanti" aria-label="Zoom avanti">+</button>
          <button class="minimap-btn" id="minimapZoomOut" title="Zoom Indietro" aria-label="Zoom indietro">-</button>
          <button class="minimap-btn" id="minimapToggleCollapse" title="Riduci/Espandi" aria-label="Riduci radar">_</button>
        </div>
      </div>
      <div class="minimap-canvas-wrap" id="minimapCanvasWrap">
        <canvas id="minimapCanvas" width="220" height="220"></canvas>
        <div class="minimap-scale-badge" id="minimapScale">35 AU</div>
      </div>
    `;

    this.canvas = this.container.querySelector('#minimapCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.canvasWrap = this.container.querySelector('#minimapCanvasWrap');
    this.titleEl = this.container.querySelector('#minimapTitle');
    this.scaleEl = this.container.querySelector('#minimapScale');

    // Controls listeners
    this.container.querySelector('#minimapZoomIn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.zoomIn();
    });
    this.container.querySelector('#minimapZoomOut')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.zoomOut();
    });
    this.container.querySelector('#minimapToggleCollapse')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleCollapse();
    });

    // Canvas click listener
    this.canvas?.addEventListener('click', (e) => this._handleCanvasClick(e));
  }

  setBodies(allBodies) {
    this.allBodies = allBodies;
  }

  toggle() {
    this.visible = !this.visible;
    if (this.container) {
      this.container.style.display = this.visible ? 'flex' : 'none';
    }
    return this.visible;
  }

  setVisible(visible) {
    this.visible = Boolean(visible);
    if (this.container) {
      this.container.style.display = this.visible ? 'flex' : 'none';
    }
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    if (this.canvasWrap) {
      this.canvasWrap.style.display = this.collapsed ? 'none' : 'block';
    }
    const btn = this.container?.querySelector('#minimapToggleCollapse');
    if (btn) btn.textContent = this.collapsed ? '▢' : '_';
  }

  zoomIn() {
    if (this.zoomIndex > 0) {
      this.zoomIndex--;
      this._updateScaleLabel();
    }
  }

  zoomOut() {
    if (this.zoomIndex < this.zoomLevels.length - 1) {
      this.zoomIndex++;
      this._updateScaleLabel();
    }
  }

  _updateScaleLabel() {
    if (this.scaleEl) {
      this.scaleEl.textContent = `${this.zoomLevels[this.zoomIndex]} AU`;
    }
  }

  /**
   * Render loop called on each animation frame.
   */
  render({ allBodies = [], camera, cameraSystem, selectedBody = null, isGalaxyMode = false } = {}) {
    if (!this.visible || this.collapsed || !this.ctx || !this.canvas) return;

    this.lastRenderData = { allBodies, camera, cameraSystem, selectedBody, isGalaxyMode };

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 8;

    // Clear background with semi-transparent sweep
    ctx.clearRect(0, 0, w, h);

    if (isGalaxyMode) {
      this._renderGalacticMode(ctx, w, h, allBodies, cameraSystem);
      if (this.titleEl) this.titleEl.textContent = 'RADAR GALASSIA';
      if (this.scaleEl) this.scaleEl.textContent = '1000 LY';
      return;
    }

    // Determine active host star
    let hostStar = null;
    if (selectedBody) {
      if (selectedBody.type === 'star') {
        hostStar = selectedBody;
      } else if (selectedBody.type === 'exoplanet') {
        hostStar = allBodies.find(
          (b) =>
            b.type === 'star' &&
            (b.key === selectedBody.parent ||
              b.label === selectedBody.hostLabel ||
              b.key === selectedBody.hostLabel)
        );
      }
    }
    if (!hostStar) {
      hostStar = allBodies.find((b) => b.key === 'Sun') || {
        key: 'Sun',
        label: 'Sole',
        color: 0xffdd44,
        pivot: { position: { x: 0, y: 0, z: 0 } },
      };
    }

    const hostPos = hostStar.pivot ? hostStar.pivot.position : { x: 0, y: 0, z: 0 };
    const isSunSystem = hostStar.key === 'Sun';

    if (this.titleEl) {
      this.titleEl.textContent = `RADAR ${
        hostStar.label ? hostStar.label.toUpperCase() : 'SISTEMA'
      }`;
    }
    this._updateScaleLabel();

    // 1. Radar Circular Grid & Reticle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 10, 20, 0.88)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(91, 196, 207, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric Range Rings
    [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * ratio, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(91, 196, 207, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.strokeStyle = 'rgba(91, 196, 207, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Camera View Cone / Heading
    if (cameraSystem) {
      const theta = cameraSystem.theta || 0;
      const coneAngle = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(
        cx,
        cy,
        radius * 0.95,
        -theta - Math.PI / 2 - coneAngle,
        -theta - Math.PI / 2 + coneAngle
      );
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, 'rgba(91, 196, 207, 0.25)');
      grad.addColorStop(1, 'rgba(91, 196, 207, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // 3. Central Star (Sun or Host Star)
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = `#${(hostStar.color || 0xffdd44).toString(16).padStart(6, '0')}`;
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 4. Planets & Orbit Lines
    const maxAU = this.zoomLevels[this.zoomIndex];
    let systemBodies = [];
    if (isSunSystem) {
      systemBodies = allBodies.filter(
        (b) => (b.type === 'planet' || b.type === 'dwarf') && b.pivot
      );
    } else {
      systemBodies = allBodies.filter(
        (b) =>
          b.type === 'exoplanet' &&
          b.pivot &&
          (b.parent === hostStar.key ||
            b.hostLabel === hostStar.label ||
            b.parent === hostStar.label)
      );
    }

    this.renderedBlips = [];

    // Central Star target blip
    this.renderedBlips.push({
      x: cx,
      y: cy,
      radius: 10,
      body: hostStar,
    });

    systemBodies.forEach((body) => {
      const bodyWorldPos = typeof body.getPos === 'function' ? body.getPos() : body.pivot.position;
      const dx = bodyWorldPos.x - hostPos.x;
      const dz = bodyWorldPos.z - hostPos.z;
      const distFromCenter = Math.sqrt(dx * dx + dz * dz);
      const distAU = isSunSystem ? distFromCenter / 30 : Math.max(0.2, distFromCenter / 3000);

      if (distAU <= maxAU * 1.5 || !isSunSystem) {
        const rRatio = Math.min(
          radius * 0.9,
          isSunSystem ? (distAU / maxAU) * radius : Math.max(16, (distAU / maxAU) * radius * 3.5)
        );
        const angle = Math.atan2(dz, dx);
        const bx = cx + Math.cos(angle) * rRatio;
        const by = cy + Math.sin(angle) * rRatio;

        if (rRatio <= radius) {
          ctx.beginPath();
          ctx.arc(cx, cy, rRatio, 0, Math.PI * 2);
          ctx.strokeStyle =
            selectedBody?.key === body.key
              ? 'rgba(91, 196, 207, 0.5)'
              : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (bx >= 4 && bx <= w - 4 && by >= 4 && by <= h - 4) {
          const isSelected = selectedBody?.key === body.key;

          ctx.beginPath();
          ctx.arc(bx, by, isSelected ? 4.5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = `#${(body.color || 0x5bc4cf).toString(16).padStart(6, '0')}`;
          ctx.fill();

          if (isSelected) {
            ctx.beginPath();
            ctx.arc(bx, by, 7, 0, Math.PI * 2);
            ctx.strokeStyle = '#5bc4cf';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          this.renderedBlips.push({
            x: bx,
            y: by,
            radius: 9,
            body,
          });
        }
      }
    });

    ctx.restore();
  }

  _renderGalacticMode(ctx, w, h, allBodies, cameraSystem) {
    const stars = allBodies.filter((b) => b.type === 'star' && b.pivot);
    if (!stars.length) return;

    ctx.fillStyle = 'rgba(6, 10, 20, 0.9)';
    ctx.fillRect(0, 0, w, h);

    const xs = stars.map((s) => s.pivot.position.x);
    const zs = stars.map((s) => s.pivot.position.z);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minZ = Math.min(...zs),
      maxZ = Math.max(...zs);
    const padding = 16;
    const rangeX = maxX - minX;
    const rangeZ = maxZ - minZ;
    const scaleX = (val) =>
      rangeX > 0 ? padding + ((val - minX) / rangeX) * (w - padding * 2) : w / 2;
    const scaleZ = (val) =>
      rangeZ > 0 ? padding + ((val - minZ) / rangeZ) * (h - padding * 2) : h / 2;

    this.renderedBlips = [];

    stars.forEach((star) => {
      const sx = scaleX(star.pivot.position.x);
      const sy = scaleZ(star.pivot.position.z);

      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `#${(star.color || 0xffffff).toString(16).padStart(6, '0')}`;
      ctx.fill();

      this.renderedBlips.push({
        x: sx,
        y: sy,
        radius: 8,
        body: star,
      });
    });

    // Camera target marker
    if (cameraSystem?.pivot) {
      const cx = scaleX(cameraSystem.pivot.x);
      const cy = scaleZ(cameraSystem.pivot.z);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#50fa7b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  _handleCanvasClick(event) {
    if (!this.canvas || !this.renderedBlips || !this.renderedBlips.length) return;

    const rect = this.canvas.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) * (this.canvas.width / rect.width);
    const clickY = (event.clientY - rect.top) * (this.canvas.height / rect.height);

    let closest = null;
    let minDist = Infinity;

    this.renderedBlips.forEach((blip) => {
      const dist = Math.hypot(clickX - blip.x, clickY - blip.y);
      if (dist <= blip.radius && dist < minDist) {
        minDist = dist;
        closest = blip.body;
      }
    });

    if (closest) {
      if (closest.type === 'star') {
        this.onSelectStar(closest.key);
      } else {
        this.onSelectBody(closest);
      }
    }
  }
}
