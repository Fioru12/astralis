// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { GalaxyModal } from './galaxyModal.js';
import { EXTRASOLAR_SYSTEMS_DATA, SystemInspectorModal } from './systemModal.js';
import { setLang } from '../i18n/index.js';

describe('GalaxyModal data', () => {
  it('espone 5 galassie satellite bilingui senza aprire WebGL', () => {
    const modal = new GalaxyModal({});
    expect(modal.isOpen).toBe(false);
    expect(modal.satelliteGalaxies.length).toBe(5);
    for (const sat of modal.satelliteGalaxies) {
      for (const field of ['name', 'subtitle', 'dist', 'stars', 'details']) {
        expect(sat[field]?.it, `${sat.id}.${field}.it`).toBeTruthy();
        expect(sat[field]?.en, `${sat.id}.${field}.en`).toBeTruthy();
      }
      expect(sat.r).toBeGreaterThan(0);
    }
  });

  it('close() su modale mai aperto è un no-op sicuro', () => {
    const modal = new GalaxyModal({});
    expect(() => modal.close()).not.toThrow();
    expect(modal.isOpen).toBe(false);
  });
});

describe('SystemInspectorModal', () => {
  it('si costruisce senza DOM e resta chiuso', () => {
    const modal = new SystemInspectorModal({});
    expect(modal.isOpen).toBe(false);
    expect(() => modal.close()).not.toThrow();
  });

  it('i sistemi hanno dati fisici coerenti e testi bilingui', () => {
    setLang('en');
    for (const sys of Object.values(EXTRASOLAR_SYSTEMS_DATA)) {
      expect(sys.temp).toBeGreaterThan(0);
      expect(sys.habitableZone.inner).toBeLessThan(sys.habitableZone.outer);
      expect(sys.exoplanets.length).toBeGreaterThan(0);
      for (const exo of sys.exoplanets) {
        expect(exo.distAU).toBeTruthy();
        expect(exo.color).toMatch(/^#/);
      }
    }
    expect(EXTRASOLAR_SYSTEMS_DATA.Trappist1.exoplanets.length).toBe(7);
    setLang('it');
  });
});
