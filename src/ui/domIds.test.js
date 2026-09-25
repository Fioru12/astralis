import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Ogni getElementById statico deve esistere in index.html o essere creato via JS. */
function collectJs(rel) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry !== 'node_modules') walk(full);
      } else if (entry.endsWith('.js') && !entry.endsWith('.test.js')) {
        out.push(readFileSync(full, 'utf8'));
      }
    }
  };
  walk(resolve(rel));
  return out;
}

describe('dom ids', () => {
  it('every static getElementById target exists in index.html or is created dynamically', () => {
    const html = readFileSync(resolve('index.html'), 'utf8');
    const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
    const sources = collectJs('src');
    const refs = new Set();
    const created = new Set();
    for (const s of sources) {
      for (const m of s.matchAll(/getElementById\('([^']+)'\)/g)) refs.add(m[1]);
      for (const m of s.matchAll(/\.id\s*=\s*['"]([^'"]+)['"]/g)) created.add(m[1]);
      for (const m of s.matchAll(/id="([A-Za-z][\w-]*)"/g)) created.add(m[1]);
    }
    const missing = [...refs].filter((id) => !htmlIds.has(id) && !created.has(id));
    expect(missing).toEqual([]);
  });
});
