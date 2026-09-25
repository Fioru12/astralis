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
