import { describe, expect, it } from 'vitest';
import {
  ASTEROIDS,
  COMETS,
  EXOPLANETS,
  MOONS,
  NEARBY_STARS,
  ORBITAL_ELEMENTS,
  PHYSICAL_DATA,
  PLANETS,
  SPACE_PROBES,
  getBodyDesc,
  getBodyDiscovery,
  getBodyLabel,
  getBodyPeriod,
} from './celestialData.js';

const ALL_BODIES = [
  ...PLANETS,
  ...MOONS,
  ...ASTEROIDS,
  ...COMETS,
  ...NEARBY_STARS,
  ...EXOPLANETS,
  ...SPACE_PROBES,
];

describe('celestial data integrity', () => {
  it('provides orbital and physical data for every planet and dwarf planet', () => {
    PLANETS.forEach(({ key }) => {
      expect(ORBITAL_ELEMENTS[key], `${key}: orbital elements`).toBeDefined();
      expect(PHYSICAL_DATA[key], `${key}: physical data`).toBeDefined();
      expect(PHYSICAL_DATA[key].radiusKm).toBeGreaterThan(0);
      expect(PHYSICAL_DATA[key].semiMajorAxisAU).toBeGreaterThan(0);
      expect(PHYSICAL_DATA[key].orbitalPeriodDays).toBeGreaterThan(0);
      expect(PHYSICAL_DATA[key].eccentricity).toBeGreaterThanOrEqual(0);
      expect(PHYSICAL_DATA[key].eccentricity).toBeLessThan(1);
    });
  });

  it('keeps exoplanet systems internally consistent', () => {
    const starKeys = new Set(NEARBY_STARS.map(({ key }) => key));
    const planetKeys = new Set();
    EXOPLANETS.forEach((body) => {
      expect(planetKeys.has(body.key), `${body.key}: duplicate key`).toBe(false);
      planetKeys.add(body.key);
      expect(starKeys.has(body.parent), `${body.key}: missing host star`).toBe(true);
      expect(body.distAU).toBeGreaterThan(0);
      expect(body.periodDays ?? Number.parseFloat(body.period)).toBeGreaterThan(0);
      expect(typeof body.atmosphere).toBe('string');
    });
  });

  it('keeps physical radius separate from the exaggerated scene radius', () => {
    PLANETS.forEach((body) => {
      expect(PHYSICAL_DATA[body.key].radiusKm).not.toBe(body.radius);
    });
  });

  it('provides Italian + English labels and descriptions for every body', () => {
    expect(ALL_BODIES.length).toBeGreaterThan(100);
    ALL_BODIES.forEach((body) => {
      expect(body.label, `${body.key}: label`).toBeTruthy();
      expect(body.desc, `${body.key}: desc`).toBeTruthy();
      expect(body.descEn, `${body.key}: descEn`).toBeTruthy();
      expect(body.label.length, `${body.key}: label vuota?`).toBeGreaterThanOrEqual(2);
      expect(body.label.endsWith('.'), `${body.key}: label troncata?`).toBe(false);
      if (body.labelEn) expect(body.labelEn.length).toBeGreaterThan(0);
    });
  });

  it('translates string periods and discoveries, leaving neutral values alone', () => {
    ALL_BODIES.forEach((body) => {
      if (typeof body.period === 'string' && /giorni|anni|ore|mesi/.test(body.period)) {
        expect(body.periodEn, `${body.key}: periodEn`).toBeTruthy();
        expect(body.periodEn).not.toBe(body.period);
      }
      if (body.scoperta === 'antichità') {
        expect(body.scopertaEn, `${body.key}: scopertaEn`).toBe('antiquity');
      }
    });
    // Regressione: label troncata di 67P corretta.
    const chury = ALL_BODIES.find((b) => b.key === 'Churyumov');
    expect(chury.label).toBe('67P/Churyumov');
  });

  it('localizes bodies with fallback to Italian', () => {
    const body = { key: 'Earth', label: 'Terra', labelEn: 'Earth', desc: 'it', descEn: 'en' };
    expect(getBodyLabel(body, 'it')).toBe('Terra');
    expect(getBodyLabel(body, 'en')).toBe('Earth');
    expect(getBodyDesc(body, 'en')).toBe('en');
    expect(getBodyLabel({ label: 'X' }, 'en')).toBe('X');
    expect(getBodyDesc({ desc: 'Y' }, 'en')).toBe('Y');
    expect(getBodyLabel(null)).toBe('');
    const numeric = { period: 365 };
    expect(getBodyPeriod(numeric, 'en')).toBe(365);
    expect(getBodyPeriod({})).toBeUndefined();
    expect(getBodyDiscovery({ scoperta: '1995' }, 'en')).toBe('1995');
    expect(getBodyDiscovery({})).toBeUndefined();
  });
});
