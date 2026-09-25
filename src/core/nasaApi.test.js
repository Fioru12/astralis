// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NASA } from './nasaApi.js';

describe('NASA api', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('formatNeo riassume i near-earth objects', () => {
    const data = {
      near_earth_objects: {
        '2026-09-25': [
          { name: 'Apophis', estimated_diameter: { meters: { estimated_diameter_max: 340 } } },
        ],
      },
    };
    const rows = NASA.formatNeo(data);
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe('Apophis');
  });

  it('formatNeo con dati vuoti restituisce array vuoto', () => {
    expect(NASA.formatNeo(null)).toEqual([]);
    expect(NASA.formatNeo({})).toEqual([]);
  });

  it('usa la cache ed evita il fetch entro il TTL', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ title: 'x' }) }));
    vi.stubGlobal('fetch', fetchMock);
    await NASA.apod();
    await NASA.apod();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
