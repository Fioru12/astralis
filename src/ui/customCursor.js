/**
 * Custom Cursor Spaziale
 * Piccola sfera luminosa che segue il mouse con trail effect
 */

export class CustomCursor {
  constructor() {
    this.cursor = null;
    this.trail = [];
    this.maxTrail = 8;
    this.enabled = false;
    this.pos = { x: 0, y: 0 };
  }

  init() {
    if (window.matchMedia?.('(pointer: coarse)').matches) return;
    // Crea cursore principale
    this.cursor = document.createElement('div');
    this.cursor.id = 'customCursor';
    Object.assign(this.cursor.style, {
      position: 'fixed',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background:
        'radial-gradient(circle, rgba(91,196,207,0.9) 0%, rgba(91,196,207,0.3) 50%, transparent 70%)',
      pointerEvents: 'none',
      zIndex: '99999',
      transform: 'translate(-50%, -50%)',
      transition: 'width 0.2s, height 0.2s',
      mixBlendMode: 'screen',
    });
    document.body.appendChild(this.cursor);

    // Crea trail particles
    for (let i = 0; i < this.maxTrail; i++) {
      const particle = document.createElement('div');
      Object.assign(particle.style, {
        position: 'fixed',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'rgba(91,196,207,0.6)',
        pointerEvents: 'none',
        zIndex: '99998',
        transform: 'translate(-50%, -50%)',
        opacity: '0',
        transition: 'opacity 0.3s',
      });
      document.body.appendChild(particle);
      this.trail.push({ el: particle, x: 0, y: 0 });
    }

    // Event listeners
    document.addEventListener('mousemove', (e) => {
      this.pos.x = e.clientX;
      this.pos.y = e.clientY;
      this.cursor.style.left = e.clientX + 'px';
      this.cursor.style.top = e.clientY + 'px';
    });

    // Hover effect su elementi interattivi
    document.addEventListener('mouseover', (e) => {
      if (e.target.matches('button, a, input, .clickable, [role="button"]')) {
        this.cursor.style.width = '30px';
        this.cursor.style.height = '30px';
        this.cursor.style.background =
          'radial-gradient(circle, rgba(167,139,250,0.9) 0%, rgba(167,139,250,0.3) 50%, transparent 70%)';
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.matches('button, a, input, .clickable, [role="button"]')) {
        this.cursor.style.width = '20px';
        this.cursor.style.height = '20px';
        this.cursor.style.background =
          'radial-gradient(circle, rgba(91,196,207,0.9) 0%, rgba(91,196,207,0.3) 50%, transparent 70%)';
      }
    });

    this.enabled = true;
    // Animazione trail
    this.animate();
  }

  animate() {
    if (!this.enabled) return;

    // Aggiorna trail
    for (let i = this.trail.length - 1; i > 0; i--) {
      this.trail[i].x = this.trail[i - 1].x;
      this.trail[i].y = this.trail[i - 1].y;
    }
    this.trail[0].x = this.pos.x;
    this.trail[0].y = this.pos.y;

    // Applica posizioni
    this.trail.forEach((p, i) => {
      p.el.style.left = p.x + 'px';
      p.el.style.top = p.y + 'px';
      p.el.style.opacity = (1 - i / this.maxTrail) * 0.6;
      p.el.style.width = 6 - i * 0.5 + 'px';
      p.el.style.height = 6 - i * 0.5 + 'px';
    });

    requestAnimationFrame(() => this.animate());
  }

  hide() {
    if (this.cursor) this.cursor.style.display = 'none';
    this.trail.forEach((p) => (p.el.style.display = 'none'));
    this.enabled = false;
  }

  show() {
    if (!this.cursor) return;
    if (this.cursor) this.cursor.style.display = 'block';
    this.trail.forEach((p) => (p.el.style.display = 'block'));
    this.enabled = true;
  }

  toggle() {
    this.enabled ? this.hide() : this.show();
  }
}

export const customCursor = new CustomCursor();
