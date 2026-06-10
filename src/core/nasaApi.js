/**
 * NASA APIs integration con protezione errori
 */
const APOD = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';
const NEO = 'https://api.nasa.gov/neo/rest/v1/feed/today?api_key=DEMO_KEY';
const KEY = 'solar-system.nasa-cache';
const TTL = 12 * 60 * 60 * 1000;

function readCache() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { void e; return {}; } }
function writeCache(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { void e; } }

async function fetchWithCache(k, url) {
  const c = readCache();
  if (c[k] && Date.now() - c[k].ts < TTL) return c[k].data;
  // Timeout di sicurezza: 10 secondi max
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const r = await fetch(url, { signal: controller.signal, mode: 'cors' });
    clearTimeout(timeout);
    if (!r.ok) throw new Error('NASA error ' + r.status);
    const data = await r.json();
    // Validazione minima: assicurati sia un oggetto
    if (typeof data !== 'object' || data === null) throw new Error('Invalid response');
    c[k] = { ts: Date.now(), data };
    writeCache(c);
    return data;
  } catch (e) {
    clearTimeout(timeout);
    console.warn('NASA fetch failed:', e.message);
    return c[k]?.data || null;
  }
}

export const NASA = {
  apod: () => fetchWithCache('apod', APOD),
  neo: () => fetchWithCache('neo', NEO),
  formatNeo(data) {
    if (!data?.near_earth_objects || typeof data.near_earth_objects !== 'object') return [];
    const today = Object.keys(data.near_earth_objects)[0];
    if (!today) return [];
    const list = data.near_earth_objects[today];
    if (!Array.isArray(list)) return [];
    return list.slice(0, 5).map(n => {
      const diam = n.estimated_diameter?.kilometers?.estimated_diameter_max;
      const velData = n.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour;
      const missData = n.close_approach_data?.[0]?.miss_distance?.lunar;
      return {
        name: String(n.name || 'Unknown'),
        diameter: typeof diam === 'number' ? diam.toFixed(2) + ' km' : 'N/A',
        velocity: typeof velData === 'string' || typeof velData === 'number' ? Math.round(parseFloat(velData)) + ' km/h' : 'N/A',
        miss: typeof missData === 'string' || typeof missData === 'number' ? parseFloat(missData).toFixed(1) + ' LD' : 'N/A',
        hazardous: !!n.is_potentially_hazardous_asteroid,
      };
    });
  }
};
