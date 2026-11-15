// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { GalaxyModal } from './galaxyModal.js';

// Verifica solo la gestione di Esc: costruzione della scena 3D sostituita da stub.
function makeModal() {
  const modal = new GalaxyModal({ onEnterSolarSystem: vi.fn() });
  modal._buildModal = vi.fn();
  modal._initThreeScene = vi.fn();
  modal._startAnimation = vi.fn();
  modal._disposeThree = vi.fn();
  return modal;
}

const esc = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

describe('GalaxyModal - tasto Esc', () => {
  it('chiude la vista galattica e rimuove il listener', () => {
    const modal = makeModal();
    modal.open();
    expect(modal.isOpen).toBe(true);
    esc();
    expect(modal.isOpen).toBe(false);
    // Un secondo Esc a modale chiusa non deve riaprire né lanciare errori
    const close = vi.spyOn(modal, 'close');
    esc();
    expect(close).not.toHaveBeenCalled();
  });

  it('chiude prima la scheda di dettaglio aperta, poi la vista', () => {
    const modal = makeModal();
    modal.open();
    modal.sagittariusModalEl = document.createElement('div');
    document.body.appendChild(modal.sagittariusModalEl);
    esc();
    expect(modal.sagittariusModalEl).toBeNull();
    expect(modal.isOpen).toBe(true);
    esc();
    expect(modal.isOpen).toBe(false);
  });
});
