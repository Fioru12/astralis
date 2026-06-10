/**
 * Sistema di Toast Notifications per feedback visivo
 * Mostra notifiche temporanee in alto a destra
 */

const TOAST_DURATION = 2500;

export class ToastManager {
  constructor() {
    this.container = null;
  }

  init() {
    this.container = document.getElementById('toastContainer');
  }

  /**
   * Mostra un toast notification
   * @param {string} message - Messaggio da mostrare
   * @param {string} type - Tipo: 'info', 'success', 'warning'
   * @param {number} duration - Durata in ms (default 2500)
   */
  show(message, type = 'info', duration = TOAST_DURATION) {
    if (!this.container) this.init();
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    this.container.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }

  success(message, duration) {
    this.show(message, 'success', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }
}

export const toast = new ToastManager();