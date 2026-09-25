import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MOONS, PLANETS } from './celestialData.js';

describe('PWA assets', () => {
  it('ships every icon referenced by the manifest', () => {
    const manifest = JSON.parse(readFileSync(resolve('public/manifest.json'), 'utf8'));
    expect(manifest.icons.length).toBeGreaterThan(0);
    manifest.icons.forEach(({ src }) => {
      const relativePath = src.replace(/^\.\//, '');
      expect(existsSync(resolve('public', relativePath)), `${src} is missing`).toBe(true);
    });
  });

  it('ships every screenshot referenced by the manifest', () => {
    const manifest = JSON.parse(readFileSync(resolve('public/manifest.json'), 'utf8'));
    expect(manifest.screenshots.length).toBeGreaterThan(0);
    manifest.screenshots.forEach(({ src, sizes }) => {
      const relativePath = src.replace(/^\.\//, '');
      expect(existsSync(resolve('public', relativePath)), `${src} is missing`).toBe(true);
      expect(sizes).toMatch(/^\d+x\d+$/);
    });
  });

  it('precaches only assets that exist (broken URLs fail SW install)', () => {
    const sw = readFileSync(resolve('public/sw.js'), 'utf8');
    const assets = [...sw.matchAll(/'(\.\/[^']+)'/g)].map((m) => m[1]);
    expect(assets.length).toBeGreaterThan(0);
    assets.forEach((src) => {
      const rel = src.replace(/^\.\//, '');
      const candidates = [resolve(rel), resolve('public', rel), resolve('dist', rel)];
      expect(
        candidates.some((p) => existsSync(p)),
        `${src} is missing: SW install would fail`
      ).toBe(true);
    });
  });

  it('injects hashed build assets into dist/sw.js precache', () => {
    const built = resolve('dist/sw.js');
    if (!existsSync(built)) return; // verificato in CI dopo npm run build
    const sw = readFileSync(built, 'utf8');
    expect(sw).toContain('"./assets/');
    expect(sw).toContain('"./assets/textures/optimized/');
    expect(sw).not.toContain('const BUILD_ASSETS = [];');
  });

  it('ships the loading-screen logo through the public directory', () => {
    const html = readFileSync(resolve('index.html'), 'utf8');
    const logo = html.match(/<img\b[^>]*\bsrc=["']\.\/([^"']+)["']/)?.[1];
    expect(logo).toBeTruthy();
    expect(existsSync(resolve('public', logo))).toBe(true);
  });

  it('uses existing optimized WebP textures for planets and moons', () => {
    [...PLANETS, ...MOONS]
      .filter(({ tex }) => tex)
      .forEach(({ name, tex }) => {
        expect(tex.endsWith('.webp'), `${name} does not use WebP`).toBe(true);
        expect(existsSync(resolve(tex.replace(/^\.\//, ''))), `${tex} is missing`).toBe(true);
      });
  });
});
