// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { getActiveMissions, getMission, getMissions } from './spaceMissions.js';
import { setLang } from '../i18n/index.js';

describe('spaceMissions helpers', () => {
  it('getMissions/getMission risolvono per chiave', () => {
    expect(getMissions().length).toBeGreaterThan(8);
    expect(getMission('Voyager1')?.name).toBe('Voyager 1');
    expect(getMission('Unknown')).toBeNull();
  });

  it('getActiveMissions funziona in entrambe le lingue', () => {
    setLang('it');
    const itKeys = getActiveMissions().map((m) => m.key);
    expect(itKeys).toContain('Voyager1');
    expect(itKeys).not.toContain('Cassini');
    setLang('en');
    const enKeys = getActiveMissions().map((m) => m.key);
    expect(enKeys).toEqual(itKeys);
    setLang('it');
  });
});
