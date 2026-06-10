/**
 * Particle Effects - Stelle cadenti e polvere cosmica
 */

export class ParticleEffects {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.shootingStars = [];
    this.enabled = false;
    this.animationId = null;
  }

  init() {
    // Crea canvas overlay
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particleCanvas';
    Object.assign(this.canvas.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '1',
    });
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Genera polvere cosmica
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    this.enabled = true;
    this.animate();

    // Stelle cadenti casuali
    setInterval(() => {
      if (this.enabled && Math.random() > 0.7) {
        this.createShootingStar();
      }
    }, 3000);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createShootingStar() {
    const startX = Math.random() * this.canvas.width;
    const startY = Math.random() * this.canvas.height * 0.5;
    const angle = Math.random() * Math.PI * 0.3 + Math.PI * 0.2;
    const speed = Math.random() * 8 + 6;

    this.shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      trail: [],
    });
  }

  animate() {
    if (!this.enabled) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Aggiorna e disegna polvere cosmica
    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      this.ctx.fill();
    });

    // Aggiorna e disegna stelle cadenti
    this.shootingStars = this.shootingStars.filter(star => {
      star.x += star.vx;
      star.y += star.vy;
      star.life -= 0.02;

      // Aggiungi trail
      star.trail.push({ x: star.x, y: star.y });
      if (star.trail.length > 20) star.trail.shift();

      // Disegna trail
      star.trail.forEach((point, i) => {
        const opacity = (i / star.trail.length) * star.life;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.fill();
      });

      // Disegna testa
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.life})`;
      this.ctx.fill();

      return star.life > 0;
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  hide() {
    this.enabled = false;
    if (this.canvas) this.canvas.style.display = 'none';
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  show() {
    this.enabled = true;
    if (this.canvas) this.canvas.style.display = 'block';
    this.animate();
  }

  toggle() {
    this.enabled ? this.hide() : this.show();
  }
}

export const particleEffects = new ParticleEffects();