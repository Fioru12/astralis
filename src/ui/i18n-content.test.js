// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { QUESTIONS } from './quiz.js';
import { MISSIONS } from './missions.js';
import { SPACE_MISSIONS } from '../core/spaceMissions.js';
import { SPACECRAFT_PROFILES } from './travelCalc.js';
import { EXTRASOLAR_SYSTEMS_DATA } from './systemModal.js';
import { it as itDict } from '../i18n/it.js';
import { en as enDict } from '../i18n/en.js';

const both = (obj, path) => {
  expect(obj?.it, `${path}.it`).toBeTruthy();
  expect(obj?.en, `${path}.en`).toBeTruthy();
};

describe('bilingual content', () => {
  it('quiz questions are fully bilingual', () => {
    expect(QUESTIONS.length).toBe(10);
    QUESTIONS.forEach((q, i) => {
      both(q.q, `quiz[${i}].q`);
      both({ it: q.options.it, en: q.options.en }, `quiz[${i}].options`);
      expect(q.options.it.length).toBe(q.options.en.length);
      expect(q.options.it.length).toBe(4);
      both(q.explain, `quiz[${i}].explain`);
    });
  });

  it('gamification missions are fully bilingual', () => {
    expect(MISSIONS.length).toBe(6);
    MISSIONS.forEach((m) => {
      both(m.name, `${m.id}.name`);
      both(m.description, `${m.id}.description`);
      both(m.reward.badge, `${m.id}.badge`);
      m.steps.forEach((s) => {
        both(s.label, `${m.id}.${s.target}.label`);
        both(s.hint, `${m.id}.${s.target}.hint`);
      });
    });
  });

  it('space missions are fully bilingual', () => {
    expect(SPACE_MISSIONS.length).toBeGreaterThan(8);
    SPACE_MISSIONS.forEach((m) => {
      both(m.status, `${m.key}.status`);
      both(m.description, `${m.key}.description`);
      both(m.currentDistance, `${m.key}.currentDistance`);
      both(m.target, `${m.key}.target`);
      m.highlights.forEach((h, i) => both(h, `${m.key}.highlights[${i}]`));
    });
  });

  it('spacecraft profiles are fully bilingual', () => {
    expect(SPACECRAFT_PROFILES.length).toBe(9);
    SPACECRAFT_PROFILES.forEach((c) => {
      both(c.name, `${c.id}.name`);
      both(c.desc, `${c.id}.desc`);
      both(c.tech, `${c.id}.tech`);
    });
  });

  it('extrasolar systems are fully bilingual', () => {
    const keys = Object.keys(EXTRASOLAR_SYSTEMS_DATA);
    expect(keys.length).toBe(6);
    keys.forEach((k) => {
      const sys = EXTRASOLAR_SYSTEMS_DATA[k];
      both(sys.subtitle, `${k}.subtitle`);
      both(sys.starType, `${k}.starType`);
      both(sys.dist, `${k}.dist`);
      sys.exoplanets.forEach((exo) => {
        both(exo.period, `${exo.id}.period`);
        both(exo.desc, `${exo.id}.desc`);
      });
    });
  });

  it('UI dictionaries stay in sync (no missing keys)', () => {
    const itKeys = new Set(Object.keys(itDict));
    const enKeys = new Set(Object.keys(enDict));
    expect(itKeys.size).toBeGreaterThan(280);
    for (const key of itKeys) {
      expect(enKeys.has(key), `missing EN key: ${key}`).toBe(true);
    }
    for (const key of enKeys) {
      expect(itKeys.has(key), `missing IT key: ${key}`).toBe(true);
    }
  });
});
