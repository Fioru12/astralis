/**
 * WebXR / VR support
 */
export class XRManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.renderer.xr.enabled = true;
    this.session = null;
    this.button = null;
  }

  isSupported() {
    return 'xr' in navigator;
  }

  async init() {
    if (!this.isSupported()) return false;
    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      if (supported) this._buildButton();
      return supported;
    } catch {
      return false;
    }
  }

  _buildButton() {
    if (this.button) return;
    this.button = document.createElement('button');
    this.button.id = 'xrButton';
    this.button.textContent = '🥽 Entra in VR';
    Object.assign(this.button.style, {
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #5bc4cf, #8be0ea)',
      border: 'none',
      borderRadius: '12px',
      color: '#000',
      fontWeight: '700',
      fontSize: '13px',
      cursor: 'pointer',
      zIndex: '99',
      boxShadow: '0 4px 20px rgba(91,196,207,0.4)',
    });
    this.button.addEventListener('click', () => this.toggle());
    document.body.appendChild(this.button);
  }

  async toggle() {
    if (this.session) {
      await this.session.end();
      this.session = null;
      if (this.button) this.button.textContent = '🥽 Entra in VR';
      return;
    }
    try {
      this.session = await navigator.xr.requestSession('immersive-vr');
      this.session.addEventListener('end', () => {
        this.session = null;
        if (this.button) this.button.textContent = '🥽 Entra in VR';
      });
      await this.renderer.xr.setSession(this.session);
      if (this.button) this.button.textContent = '🚪 Esci da VR';
    } catch {
      /* Il pulsante non viene mostrato se WebXR non è disponibile. */
    }
  }
}
